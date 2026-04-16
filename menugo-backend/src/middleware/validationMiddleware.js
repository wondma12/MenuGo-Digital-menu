const { validationResult, body, param, query } = require('express-validator');
const { ApiError } = require('../utils/apiError');

// Validate request
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));

    throw new ApiError(400, 'Validation Error', extractedErrors);
  };
};

// Common validations
const commonValidations = {
  // ID validation
  id: param('id').isUUID().withMessage('Invalid ID format'),
  
  // Pagination
  page: query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  limit: query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  // Email
  email: body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  
  // Password
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Phone
  phone: body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  
  // URL
  url: body('url').optional().isURL().withMessage('Please provide a valid URL'),
  
  // Date
  date: body('date').isISO8601().withMessage('Please provide a valid date'),
  
  // Enum
  isIn: (field, values) => body(field).isIn(values).withMessage(`Invalid value for ${field}`),
};

// Auth validations
const authValidations = {
  register: [
    commonValidations.email,
    commonValidations.password,
    body('full_name').notEmpty().withMessage('Full name is required').trim(),
    body('phone').optional(),
    body('role').optional().isIn(['customer', 'restaurant_admin', 'waiter']),
    body('restaurant_name').if(body('role').equals('restaurant_admin')).notEmpty().withMessage('Restaurant name is required'),
  ],
  login: [
    commonValidations.email,
    body('password').notEmpty().withMessage('Password is required'),
  ],
  forgotPassword: [commonValidations.email],
  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    commonValidations.password,
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
  ],
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    commonValidations.password,
    body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Passwords do not match'),
  ],
};

// Restaurant validations
const restaurantValidations = {
  create: [
    body('name').notEmpty().withMessage('Restaurant name is required').trim(),
    body('email').optional().isEmail(),
    body('phone').optional(),
    body('address').optional(),
    body('city').optional(),
    body('country').optional(),
    body('cuisine_type').optional(),
  ],
  update: [
    body('name').optional().trim(),
    body('email').optional().isEmail(),
    body('is_active').optional().isBoolean(),
    body('is_verified').optional().isBoolean(),
  ],
};

// Menu validations
const menuValidations = {
  createCategory: [
    body('name').notEmpty().withMessage('Category name is required').trim(),
    body('description').optional(),
    body('display_order').optional().isInt(),
  ],
  createItem: [
    body('name').notEmpty().withMessage('Item name is required').trim(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category_id').optional().isUUID(),
    body('description').optional(),
    body('is_available').optional().isBoolean(),
  ],
  updateItem: [
    body('name').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('is_available').optional().isBoolean(),
  ],
};

// Order validations
const orderValidations = {
  create: [
    body('restaurant_id').isUUID().withMessage('Invalid restaurant ID'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.menu_item_id').isUUID().withMessage('Invalid menu item ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('table_number').optional(),
    body('customer_name').optional().trim(),
    body('customer_phone').optional(),
    body('customer_email').optional().isEmail(),
    body('special_instructions').optional(),
    body('order_type').optional().isIn(['dine_in', 'takeaway', 'delivery']),
  ],
  updateStatus: [
    body('status').isIn(['pending', 'verified', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'rejected']),
    body('notes').optional(),
  ],
  verify: [
    body('verification_code').notEmpty().withMessage('Verification code is required'),
  ],
};

// Waiter validations
const waiterValidations = {
  startShift: [
    body('shift_start').optional(),
    body('shift_end').optional(),
  ],
  updateStatus: [
    body('status').isIn(['online', 'offline', 'busy', 'break', 'away']),
    body('current_table_id').optional().isUUID(),
    body('battery_level').optional().isInt({ min: 0, max: 100 }),
  ],
  takeBreak: [
    body('duration').isInt({ min: 5, max: 120 }).withMessage('Break duration must be between 5 and 120 minutes'),
  ],
  acknowledgeCall: [
    body('call_id').isUUID().withMessage('Invalid call ID'),
  ],
};

// Table validations
const tableValidations = {
  create: [
    body('table_number').notEmpty().withMessage('Table number is required'),
    body('capacity').optional().isInt({ min: 1 }),
    body('section').optional(),
  ],
  updateStatus: [
    body('status').isIn(['available', 'occupied', 'reserved', 'cleaning', 'maintenance']),
    body('notes').optional(),
  ],
  assignWaiter: [
    body('waiter_id').isUUID().withMessage('Invalid waiter ID'),
    body('reason').optional(),
  ],
  createReservation: [
    body('customer_name').notEmpty().withMessage('Customer name is required'),
    body('party_size').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
    body('reservation_date').isISO8601().withMessage('Invalid date'),
    body('reservation_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('duration_minutes').optional().isInt({ min: 30, max: 240 }),
  ],
};

// Coupon validations
const couponValidations = {
  create: [
    body('code').notEmpty().withMessage('Coupon code is required').toUpperCase(),
    body('discount_type').isIn(['percentage', 'fixed_amount', 'buy_one_get_one']),
    body('discount_value').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
    body('end_date').isISO8601().withMessage('Invalid end date'),
    body('minimum_order_amount').optional().isFloat({ min: 0 }),
    body('usage_limit').optional().isInt({ min: 1 }),
  ],
  validate: [
    body('code').notEmpty().withMessage('Coupon code is required').toUpperCase(),
    body('order_amount').isFloat({ min: 0 }).withMessage('Order amount must be positive'),
  ],
};

// Review validations
const reviewValidations = {
  create: [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
    body('title').optional().trim(),
    body('is_anonymous').optional().isBoolean(),
  ],
  updateStatus: [
    body('status').isIn(['pending', 'approved', 'rejected', 'reported']),
    body('reply_from_restaurant').optional(),
  ],
};

// Report validations
const reportValidations = {
  generate: [
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('format').optional().isIn(['json', 'excel', 'pdf']),
  ],
  export: [
    query('entity').isIn(['orders', 'menu_items', 'customers', 'inventory']),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('format').optional().isIn(['excel', 'csv', 'json']),
  ],
};

module.exports = {
  validate,
  commonValidations,
  authValidations,
  restaurantValidations,
  menuValidations,
  orderValidations,
  waiterValidations,
  tableValidations,
  couponValidations,
  reviewValidations,
  reportValidations,
};