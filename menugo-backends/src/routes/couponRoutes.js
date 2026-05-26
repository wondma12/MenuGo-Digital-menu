const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isRestaurantStaff } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { couponValidations } = require('../middleware/validationMiddleware');
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getCouponAnalytics,
  getPublicCoupons,
} = require('../controllers/couponController');

// Public route: get active/public coupons for a restaurant (used on menu page)
router.get('/public/restaurant/:restaurantId', getPublicCoupons);

// Protected routes
router.use(protect);

// Public validation (no restaurant staff required for validation)
router.post('/validate', validate(couponValidations.validate), validateCoupon);

// Restaurant staff routes
router.get('/restaurant/:restaurantId', isRestaurantStaff, getCoupons);
router.get('/:id', isRestaurantStaff, getCouponById);
router.post('/restaurant/:restaurantId', isRestaurantStaff, validate(couponValidations.create), createCoupon);
router.put('/:id', isRestaurantStaff, updateCoupon);
router.delete('/:id', isRestaurantStaff, deleteCoupon);
router.get('/restaurant/:restaurantId/analytics', isRestaurantStaff, getCouponAnalytics);

// Order coupon application
router.post('/order/:orderId/apply', applyCoupon);

module.exports = router;