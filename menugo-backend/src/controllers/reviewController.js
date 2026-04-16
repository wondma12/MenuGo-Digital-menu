const { Review, WaiterFeedback, Order, Restaurant, User } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');

// Get restaurant reviews
const getRestaurantReviews = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 20, rating, status } = req.query;
  const offset = (page - 1) * limit;

  const where = { restaurant_id: restaurantId };
  if (rating) where.rating = rating;
  if (status) where.status = status;

  const { count, rows } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: Order, as: 'order', attributes: ['order_number'] },
    ],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  // Get average rating
  const avgRating = await Review.findOne({
    where: { restaurant_id: restaurantId, status: 'approved' },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'average_rating']],
  });

  // Get rating distribution
  const ratingDistribution = await Review.findAll({
    where: { restaurant_id: restaurantId, status: 'approved' },
    attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
    group: ['rating'],
  });

  res.json(ApiResponse.success({
    reviews: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    average_rating: avgRating?.dataValues?.average_rating || 0,
    rating_distribution: ratingDistribution,
  }, 'Reviews retrieved'));
});

// Create review
const createReview = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { order_id, rating, title, comment, images, is_anonymous } = req.body;
  const userId = req.user.id;

  // Check if user has already reviewed this order
  const existingReview = await Review.findOne({
    where: { order_id, user_id: userId },
  });

  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this order');
  }

  const review = await Review.create({
    restaurant_id: restaurantId,
    user_id: userId,
    order_id,
    rating,
    title,
    comment,
    images: images || [],
    is_verified_purchase: true,
    status: 'pending',
    is_anonymous: is_anonymous || false,
  });

  // Update restaurant average rating
  const avgRating = await Review.findAll({
    where: { restaurant_id: restaurantId, status: 'approved' },
    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
  });

  await Restaurant.update(
    { 
      average_rating: avgRating[0]?.dataValues?.avg || 0,
      total_reviews: await Review.count({ where: { restaurant_id: restaurantId, status: 'approved' } }),
    },
    { where: { id: restaurantId } }
  );

  res.status(201).json(ApiResponse.success(review, 'Review submitted successfully'));
});

// Update review status (admin)
const updateReviewStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, reply_from_restaurant } = req.body;

  const review = await Review.findByPk(id);
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

  const review = await Review.findByPk(id);
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