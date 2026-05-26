const { body, param } = require('express-validator');
const { DISCOUNT_TYPES } = require('../utils/constants');

// Create coupon validation
const createCouponValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .toUpperCase()
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon code must be between 3 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('discount_type')
    .isIn(Object.values(DISCOUNT_TYPES))
    .withMessage(`Discount type must be one of: ${Object.values(DISCOUNT_TYPES).join(', ')}`),
  body('discount_value')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number')
    .custom((value, { req }) => {
      if (req.body.discount_type === 'percentage' && value > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }
      return true;
    }),
  body('minimum_order_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('max_discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be a positive number'),
  body('usage_limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  body('per_user_limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Per user limit must be at least 1'),
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('applicable_items')
    .optional()
    .isArray()
    .withMessage('Applicable items must be an array'),
  body('applicable_categories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
];

// Update coupon validation
const updateCouponValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid coupon ID format'),
  body('description')
    .optional()
    .trim(),
  body('discount_value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('minimum_order_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('max_discount_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum discount amount must be a positive number'),
  body('usage_limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be at least 1'),
  body('per_user_limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Per user limit must be at least 1'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
];

// Validate coupon validation
const validateCouponValidation = [
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .toUpperCase(),
  body('order_amount')
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number'),
];

// Apply coupon validation
const applyCouponValidation = [
  param('orderId')
    .isUUID()
    .withMessage('Invalid order ID format'),
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .toUpperCase(),
];

module.exports = {
  createCouponValidation,
  updateCouponValidation,
  validateCouponValidation,
  applyCouponValidation,
};