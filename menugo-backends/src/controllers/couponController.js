const { Coupon, CouponUsage, Order, Restaurant } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op, fn, col, where } = require('sequelize');

// Get all coupons for restaurant
const getCoupons = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { page = 1, limit = 20, is_active } = req.query;
  const offset = (page - 1) * limit;

  const where = { restaurant_id: restaurantId };
  if (is_active !== undefined) where.is_active = is_active === 'true';

  const { count, rows } = await Coupon.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success({
    coupons: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  }, 'Coupons retrieved'));
});

// Get coupon by ID
const getCouponById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByPk(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  res.json(ApiResponse.success(coupon, 'Coupon retrieved'));
});

// Create coupon
const createCoupon = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const {
    code, description, discount_type, discount_value, minimum_order_amount,
    max_discount_amount, usage_limit, per_user_limit, applicable_items,
    applicable_categories, start_date, end_date,
  } = req.body;

  // Check if code exists
  const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
  if (existingCoupon) {
    throw new ApiError(400, 'Coupon code already exists');
  }

  const coupon = await Coupon.create({
    restaurant_id: restaurantId,
    code: code.toUpperCase(),
    description,
    discount_type,
    discount_value,
    minimum_order_amount: minimum_order_amount || 0,
    max_discount_amount: max_discount_amount || null,
    usage_limit: usage_limit || null,
    per_user_limit: per_user_limit || 1,
    applicable_items: applicable_items || [],
    applicable_categories: applicable_categories || [],
    start_date,
    end_date,
    is_active: true,
  });

  res.status(201).json(ApiResponse.success(coupon, 'Coupon created'));
});

// Update coupon
const updateCoupon = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const coupon = await Coupon.findByPk(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  await coupon.update(updates);

  res.json(ApiResponse.success(coupon, 'Coupon updated'));
});

// Delete coupon
const deleteCoupon = catchAsync(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByPk(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  await coupon.destroy();

  res.json(ApiResponse.success(null, 'Coupon deleted'));
});

// Validate coupon
const validateCoupon = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { code, order_amount } = req.body;

  const coupon = await Coupon.findOne({
    where: {
      restaurant_id: restaurantId,
      code: code.toUpperCase(),
      is_active: true,
      start_date: { [Op.lte]: new Date() },
      end_date: { [Op.gte]: new Date() },
    },
  });

  if (!coupon) {
    throw new ApiError(404, 'Invalid or expired coupon');
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    throw new ApiError(400, 'Coupon usage limit exceeded');
  }

  // Check minimum order amount
  if (order_amount < coupon.minimum_order_amount) {
    throw new ApiError(400, `Minimum order amount of $${coupon.minimum_order_amount} required`);
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = (order_amount * coupon.discount_value) / 100;
    if (coupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
    }
  } else if (coupon.discount_type === 'fixed_amount') {
    discountAmount = coupon.discount_value;
  }

  res.json(ApiResponse.success({
    coupon,
    discount_amount: discountAmount,
    final_amount: order_amount - discountAmount,
  }, 'Coupon is valid'));
});

// Apply coupon to order
const applyCoupon = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { code } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const validation = await validateCoupon({ body: { code, order_amount: order.subtotal }, params: { restaurantId: order.restaurant_id } });
  
  const coupon = validation.coupon;
  const discountAmount = validation.discount_amount;

  // Update order
  await order.update({
    discount_amount: discountAmount,
    total_amount: order.subtotal + order.tax_amount + order.service_charge - discountAmount,
    coupon_code: code,
  });

  // Record usage
  await CouponUsage.create({
    coupon_id: coupon.id,
    order_id: orderId,
    user_id: req.user.id,
    discount_amount: discountAmount,
  });

  await coupon.increment('used_count');

  res.json(ApiResponse.success({
    discount_amount: discountAmount,
    final_amount: order.total_amount - discountAmount,
  }, 'Coupon applied'));
});

// Get coupon analytics
const getCouponAnalytics = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const coupons = await Coupon.findAll({
    where: { restaurant_id: restaurantId },
    include: [{ model: CouponUsage, as: 'usages' }],
  });

  const totalUsed = coupons.reduce((sum, c) => sum + c.used_count, 0);
  const totalDiscount = coupons.reduce((sum, c) => sum + c.usages.reduce((s, u) => s + parseFloat(u.discount_amount), 0), 0);

  res.json(ApiResponse.success({
    coupons,
    total_coupons: coupons.length,
    total_used: totalUsed,
    total_discount_given: totalDiscount,
  }, 'Coupon analytics retrieved'));
});

const normalizeRestaurantIdentifier = (value) => {
  if (!value) return '';
  return value.toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
};

const resolvePublicRestaurant = async (restaurantId) => {
  if (!restaurantId) return null;

  const normalizeLookup = normalizeRestaurantIdentifier(restaurantId);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let restaurant = null;

  // Exact QR slug or identifier lookup first
  restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurantId, deleted_at: null, is_active: true } }).catch(() => null);

  // If the exact identifier did not match, also try a case-insensitive slug lookup
  // before falling back to UUID/PK lookup. This helps support user-facing slugs
  // that may differ only by case or formatting.
  if (!restaurant) {
    restaurant = await Restaurant.findOne({
      where: {
        deleted_at: null,
        is_active: true,
        [Op.or]: [
          { qr_code_identifier: restaurantId },
          where(fn('lower', col('qr_code_identifier')), normalizeLookup),
        ],
      },
    }).catch(() => null);
  }

  // If the input looks like a UUID, try primary key lookup too.
  if (!restaurant && uuidRegex.test(restaurantId)) {
    restaurant = await Restaurant.findOne({ where: { id: restaurantId, deleted_at: null, is_active: true } }).catch(() => null);
  }

  // Fallback to forgiving slug/name match across all active restaurants.
  if (!restaurant) {
    const candidates = await Restaurant.findAll({ where: { deleted_at: null, is_active: true } });
    restaurant = candidates.find((candidate) => {
      try {
        const candidateSlug = normalizeRestaurantIdentifier(candidate.qr_code_identifier) || normalizeRestaurantIdentifier(candidate.name);
        return candidateSlug === normalizeLookup || normalizeRestaurantIdentifier(candidate.name) === normalizeLookup;
      } catch (e) {
        return false;
      }
    }) || null;

    if (restaurant && restaurant.toJSON) {
      restaurant = Restaurant.build(restaurant.toJSON(), { isNewRecord: false });
    }
  }

  return restaurant;
};

// Public: Get active coupons for restaurant (for menu/promotions display)
const getPublicCoupons = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = await resolvePublicRestaurant(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  const coupons = await Coupon.findAll({
    where: {
      restaurant_id: restaurant.id,
      is_active: true,
      start_date: { [Op.lte]: new Date() },
      end_date: { [Op.gte]: new Date() },
    },
    order: [['created_at', 'DESC']],
  });

  // Return minimal public-facing fields
  const publicCoupons = coupons.map(c => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discount_type: c.discount_type,
    discount_value: c.discount_value,
    minimum_order_amount: c.minimum_order_amount,
    start_date: c.start_date,
    end_date: c.end_date,
  }));

  res.json(ApiResponse.success({ coupons: publicCoupons }, 'Active public coupons retrieved'));
});

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getCouponAnalytics,
  getPublicCoupons,
};