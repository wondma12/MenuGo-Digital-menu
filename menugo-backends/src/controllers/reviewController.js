const { Review, WaiterFeedback, Order, Restaurant, User, Notification, sequelize } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');

// Get restaurant reviews
const getRestaurantReviews = catchAsync(async (req, res) => {
  let { restaurantId } = req.params;
  const { page = 1, limit = 20, rating, status } = req.query;
  const offset = (page - 1) * limit;

  // Support both slug-style `qr_code_identifier` and UUID primary key values.
  let restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurantId, is_active: true } });
  if (!restaurant) {
    restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant && !restaurant.is_active) restaurant = null;
  }

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  restaurantId = restaurant.id

  const where = { restaurant_id: restaurantId };
  // Only apply rating/status filters when they're meaningful (not the frontend 'all' placeholder)
  if (rating && rating !== 'all') {
    // allow numeric or string numbers
    where.rating = Number.isFinite(Number(rating)) ? Number(rating) : rating
  }
  if (status && status !== 'all') where.status = status;

  // Limit selected attributes to actual DB columns to avoid errors when the schema is not migrated
  const cols = await ensureReviewsTableCols()
  const reviewAttrs = getSafeReviewAttributes(cols)

  const { count, rows } = await Review.findAndCountAll({
    where,
    attributes: reviewAttrs,
    include: [
      { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: Order, as: 'review_order', attributes: ['order_number'] },
    ],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  // Normalize returned rows so that if a customer submitted `customer_name`/`customer_email`
  // but `user` is absent, the frontend can still display the provided name/email via `user.full_name`.
  const normalizedRows = (rows || []).map(r => {
    // r may be a Sequelize instance
    const obj = r && typeof r.toJSON === 'function' ? r.toJSON() : r
    if (obj) {
      if (obj.customer_name && (!obj.user || !obj.user.full_name)) {
        obj.user = Object.assign({}, obj.user || {}, { full_name: obj.customer_name })
      }
      if (obj.customer_email && (!obj.user || !obj.user.email)) {
        obj.user = Object.assign({}, obj.user || {}, { email: obj.customer_email })
      }
    }
    return obj
  })

  // Ensure `total` is a numeric count even if Sequelize returns a non-numeric
  // value for `count` in some edge cases (group/include combinations).
  let total = 0;
  if (typeof count === 'number') {
    total = count;
  } else {
    // Fall back to a safe COUNT query when findAndCountAll didn't return
    // a numeric total (this happens with GROUP BY in some dialects).
    total = await Review.count({ where });
  }

  // Get average rating (approved only) and normalize to a number
  const avgRating = await Review.findOne({
    where: { restaurant_id: restaurantId, status: 'approved' },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average_rating']],
  });
  const average_rating = parseFloat((avgRating && (avgRating.dataValues?.average_rating || avgRating.get && avgRating.get('average_rating'))) || 0) || 0;

  // Get rating distribution (approved only) and normalize shape
  const ratingDistributionRaw = await Review.findAll({
    where: { restaurant_id: restaurantId, status: 'approved' },
    attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
    group: ['rating'],
  });
  const rating_distribution = (ratingDistributionRaw || []).map(r => {
    const rv = r && r.dataValues ? r.dataValues : r;
    return {
      rating: Number(rv.rating),
      count: Number(rv.count || (r.get && r.get('count')) || 0),
    };
  });

  // Get counts per status (approved, pending, rejected, etc.) for frontend tabs
  const statusCountsRaw = await Review.findAll({
    where: { restaurant_id: restaurantId },
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
    group: ['status'],
  });
  const status_counts = (statusCountsRaw || []).reduce((acc, row) => {
    const rv = row && row.dataValues ? row.dataValues : row;
    const st = rv.status || row.status;
    const cnt = parseInt(rv.count || (row.get && row.get('count')) || 0, 10) || 0;
    acc[st] = cnt;
    return acc;
  }, {});

  // Ensure common status keys are present with default 0
  ['pending', 'approved', 'rejected'].forEach(k => { if (!status_counts[k]) status_counts[k] = 0 });

  res.json(ApiResponse.success({
    reviews: normalizedRows,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit) || 1),
    average_rating,
    rating_distribution,
    status_counts,
  }, 'Reviews retrieved'));
});

const { emitToRestaurant } = require('../sockets');

// Cache of reviews table columns to avoid querying DB repeatedly
let _reviewsTableCols = null
const ensureReviewsTableCols = async () => {
  if (_reviewsTableCols) return _reviewsTableCols
  try {
    const q = sequelize.getQueryInterface()
    const desc = await q.describeTable('reviews')
    _reviewsTableCols = desc || {}
  } catch (e) {
    // if describeTable fails (e.g., table missing), set to empty object so
    // downstream code avoids selecting non-existent columns (prevents SQL errors)
    _reviewsTableCols = {}
  }
  return _reviewsTableCols
}

// Build a safe list of attributes to request from the `reviews` table.
// If `cols` (describeTable result) contains keys, use the intersection between
// model attributes and the actual DB columns. If `cols` is empty (e.g., describe
// failed), exclude optional new columns to avoid SQL errors.
const getSafeReviewAttributes = (cols) => {
  const modelAttrs = Object.keys(Review.rawAttributes || {})
  const optional = ['customer_name', 'customer_email']
  if (cols && Object.keys(cols).length > 0) {
    return modelAttrs.filter(a => !!cols[a])
  }
  return modelAttrs.filter(a => !optional.includes(a))
}

// Create review
const createReview = catchAsync(async (req, res) => {
  let { restaurantId } = req.params;
  const { order_id, rating, title, comment, images, is_anonymous, customer_name, customer_email } = req.body;
  const userId = req.user?.id || null;

  // Precompute safe review attributes to use in any subsequent queries that read reviews.
  const colsForCreate = await ensureReviewsTableCols()
  const safeReviewAttrsForCreate = getSafeReviewAttributes(colsForCreate)

  // Resolve restaurant identifier (allow qr_code_identifier slug or UUID PK)
  let restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurantId, is_active: true } });
  if (!restaurant) {
    restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant && !restaurant.is_active) restaurant = null;
  }

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const resolvedRestaurantId = restaurant.id;

  // If an order_id is provided, validate order ownership and prevent duplicate reviews for the same order
  let order = null
  if (order_id) {
    // Must be authenticated to post an order-specific review
    if (!userId) {
      throw new ApiError(401, 'Must be logged in to review an order');
    }
    order = await Order.findByPk(order_id)
    if (!order) {
      throw new ApiError(404, 'Order not found')
    }
    if (String(order.user_id) !== String(userId)) {
      throw new ApiError(403, 'Order does not belong to you')
    }
    if (String(order.restaurant_id) !== String(resolvedRestaurantId)) {
      throw new ApiError(400, 'Order does not belong to this restaurant')
    }

    const existingReview = await Review.findOne({ where: { order_id, user_id: userId }, attributes: safeReviewAttrsForCreate });
    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this order');
    }
  } else {
    // No order_id: if user already left a restaurant-level (no-order) review, update it instead of rejecting
    const existingReview = await Review.findOne({ where: { restaurant_id: resolvedRestaurantId, user_id: userId, order_id: null }, attributes: safeReviewAttrsForCreate });
    if (existingReview) {
        // Update existing review with new content
        const updatePayload = {
          rating,
          title,
          comment,
          images: images || [],
          is_anonymous: is_anonymous || existingReview.is_anonymous,
          status: 'pending',
        }
        // only include name/email if the DB table actually has those columns
        const cols = await ensureReviewsTableCols()
        if (cols && cols.customer_name) updatePayload.customer_name = customer_name || existingReview.customer_name
        if (cols && cols.customer_email) updatePayload.customer_email = customer_email || existingReview.customer_email

        await existingReview.update(updatePayload);

      // Recalculate restaurant aggregates (keep behavior consistent)
      const avgRating = await Review.findAll({
        where: { restaurant_id: resolvedRestaurantId, status: 'approved' },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
      });

      await Restaurant.update(
        { 
          average_rating: avgRating[0]?.dataValues?.avg || 0,
          total_reviews: await Review.count({ where: { restaurant_id: resolvedRestaurantId, status: 'approved' } }),
        },
        { where: { id: resolvedRestaurantId } }
      );

      // Emit socket/notification for updated review
      try {
        const customerName = req.user?.full_name || 'A customer';
        await Notification.create({
          restaurant_id: resolvedRestaurantId,
          user_id: userId,
          order_id: null,
          type: 'new_review',
          title: 'Review Updated',
          message: `${customerName} updated their review`,
          data: { review_id: existingReview.id, order_id: null },
        });
        try { emitToRestaurant(resolvedRestaurantId, 'new_review', { review_id: existingReview.id, order_id: null, rating, comment }); } catch (e) { }
      } catch (e) { /* swallow notification errors */ }

      // Normalize existingReview for response
      const existingObj = existingReview && typeof existingReview.toJSON === 'function' ? existingReview.toJSON() : existingReview
      if (existingObj) {
        if (existingObj.customer_name && (!existingObj.user || !existingObj.user.full_name)) {
          existingObj.user = Object.assign({}, existingObj.user || {}, { full_name: existingObj.customer_name })
        }
        if (existingObj.customer_email && (!existingObj.user || !existingObj.user.email)) {
          existingObj.user = Object.assign({}, existingObj.user || {}, { email: existingObj.customer_email })
        }
      }
      return res.status(200).json(ApiResponse.success(existingObj, 'Review updated'));
    }
  }

  const createPayload = {
    restaurant_id: resolvedRestaurantId,
    user_id: userId,
    order_id,
    rating,
    title,
    comment,
    images: images || [],
    is_verified_purchase: !!order,
    status: 'pending',
    is_anonymous: is_anonymous || false,
  }
  // only include name/email if DB has those columns
  const cols = await ensureReviewsTableCols()
  if (cols && cols.customer_name) createPayload.customer_name = customer_name || null
  if (cols && cols.customer_email) createPayload.customer_email = customer_email || null

  const review = await Review.create(createPayload);

  // Create notification for restaurant staff and emit socket event
  try {
    const customerName = req.user?.full_name || 'A customer';
    await Notification.create({
      restaurant_id: resolvedRestaurantId,
      user_id: userId,
      order_id,
      type: 'new_review',
      title: 'New Review Received',
      message: `${customerName} left a ${rating} star review`,
      data: { review_id: review.id, order_id },
    });

    // Emit to restaurant room via sockets so staff UI can react in real-time
    try { emitToRestaurant(resolvedRestaurantId, 'new_review', { review_id: review.id, order_id, rating, comment }); } catch (e) { /* swallow socket errors */ }
  } catch (e) {
    // don't fail the review creation flow if notification/socket fails
    console.warn('Failed to create/emit review notification', e);
  }

  // Update restaurant average rating
  const avgRating = await Review.findAll({
    where: { restaurant_id: resolvedRestaurantId, status: 'approved' },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
  });

  await Restaurant.update(
    { 
      average_rating: avgRating[0]?.dataValues?.avg || 0,
      total_reviews: await Review.count({ where: { restaurant_id: resolvedRestaurantId, status: 'approved' } }),
    },
    { where: { id: resolvedRestaurantId } }
  );

  // Normalize created review for response
  const reviewObj = review && typeof review.toJSON === 'function' ? review.toJSON() : review
  if (reviewObj) {
    if (reviewObj.customer_name && (!reviewObj.user || !reviewObj.user.full_name)) {
      reviewObj.user = Object.assign({}, reviewObj.user || {}, { full_name: reviewObj.customer_name })
    }
    if (reviewObj.customer_email && (!reviewObj.user || !reviewObj.user.email)) {
      reviewObj.user = Object.assign({}, reviewObj.user || {}, { email: reviewObj.customer_email })
    }
  }

  res.status(201).json(ApiResponse.success(reviewObj, 'Review submitted successfully'));
});

// Update review status (admin)
const updateReviewStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reply_from_restaurant } = req.body;

  // Use safe attributes when fetching the review
  const colsForStatus = await ensureReviewsTableCols()
  const safeReviewAttrsForStatus = getSafeReviewAttributes(colsForStatus)

  const review = await Review.findByPk(id, { attributes: safeReviewAttrsForStatus });
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  await review.update({
    status,
    reply_from_restaurant: reply_from_restaurant || review.reply_from_restaurant,
    reply_at: reply_from_restaurant ? new Date() : review.reply_at,
  });

  // Update restaurant average rating if status changed to approved
  if (status === 'approved') {
    const avgRating = await Review.findAll({
      where: { restaurant_id: review.restaurant_id, status: 'approved' },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
    });

    await Restaurant.update(
      { average_rating: avgRating[0]?.dataValues?.avg || 0 },
      { where: { id: review.restaurant_id } }
    );
  }

  res.json(ApiResponse.success({ status }, 'Review status updated'));
});

// Delete review
const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const colsForDelete = await ensureReviewsTableCols()
  const safeReviewAttrsForDelete = getSafeReviewAttributes(colsForDelete)

  const review = await Review.findByPk(id, { attributes: safeReviewAttrsForDelete });
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  await review.destroy();

  res.json(ApiResponse.success(null, 'Review deleted'));
});

// Get waiter feedback
const getWaiterFeedback = catchAsync(async (req, res) => {
  const { waiterId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await WaiterFeedback.findAndCountAll({
    where: { waiter_id: waiterId },
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  const avgRatings = await WaiterFeedback.findOne({
    where: { waiter_id: waiterId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
      [sequelize.fn('AVG', sequelize.col('response_time_rating')), 'avg_response_time'],
      [sequelize.fn('AVG', sequelize.col('service_quality_rating')), 'avg_service_quality'],
      [sequelize.fn('AVG', sequelize.col('helpfulness_rating')), 'avg_helpfulness'],
    ],
  });

  res.json(ApiResponse.success({
    feedback: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    average_ratings: avgRatings,
  }, 'Waiter feedback retrieved'));
});

// Create waiter feedback
const createWaiterFeedback = catchAsync(async (req, res) => {
  const { waiterId, orderId } = req.params;
  const {
    rating, comment, response_time_rating, service_quality_rating,
    helpfulness_rating, tags, is_anonymous,
  } = req.body;

  const feedback = await WaiterFeedback.create({
    restaurant_id: req.user.restaurantId,
    waiter_id: waiterId,
    order_id: orderId,
    customer_name: is_anonymous ? null : req.user.full_name,
    rating,
    comment,
    response_time_rating,
    service_quality_rating,
    helpfulness_rating,
    tags: tags || [],
    is_anonymous: is_anonymous || false,
  });

  // Update waiter average rating
  const avgRating = await WaiterFeedback.findOne({
    where: { waiter_id: waiterId },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
  });

  await Waiter.update(
    { rating: avgRating?.dataValues?.avg || 0 },
    { where: { id: waiterId } }
  );

  res.status(201).json(ApiResponse.success(feedback, 'Feedback submitted'));
});

module.exports = {
  getRestaurantReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
  getWaiterFeedback,
  createWaiterFeedback,
};