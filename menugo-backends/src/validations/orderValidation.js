const { body, param } = require('express-validator');
const { ORDER_STATUS, ORDER_TYPES, PAYMENT_METHODS } = require('../utils/constants');

// Create order validation
const createOrderValidation = [
  body('restaurant_id')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.menu_item_id')
    .isUUID()
    .withMessage('Invalid menu item ID format'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99'),
  body('items.*.special_instructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters'),
  body('items.*.options')
    .optional()
    .isArray()
    .withMessage('Options must be an array'),
  body('table_number')
    .optional()
    .trim(),
  body('customer_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customer_phone')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('customer_email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('special_instructions')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special instructions cannot exceed 1000 characters'),
  body('order_type')
    .optional()
    .isIn(Object.values(ORDER_TYPES))
    .withMessage(`Order type must be one of: ${Object.values(ORDER_TYPES).join(', ')}`),
  body('delivery_address')
    .if(body('order_type').equals('delivery'))
    .notEmpty()
    .withMessage('Delivery address is required for delivery orders'),
  body('coupon_code')
    .optional()
    .trim(),
];

// Update order status validation
const updateOrderStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid order ID format'),
  body('status')
    .isIn(Object.values(ORDER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// Verify order validation
const verifyOrderValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid order ID format'),
  body('verification_code')
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 10 })
    .withMessage('Verification code must be between 6 and 10 characters'),
];

// Cancel order validation
const cancelOrderValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid order ID format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

// Update payment validation
const updatePaymentValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid order ID format'),
  body('payment_status')
    .isIn(['paid', 'refunded', 'failed'])
    .withMessage('Payment status must be paid, refunded, or failed'),
  body('payment_method')
    .optional()
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  body('payment_intent_id')
    .optional()
    .trim(),
];

// Get orders query validation
const getOrdersQueryValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('status')
    .optional()
    .isIn(Object.values(ORDER_STATUS))
    .withMessage(`Status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
  verifyOrderValidation,
  cancelOrderValidation,
  updatePaymentValidation,
  getOrdersQueryValidation,
};