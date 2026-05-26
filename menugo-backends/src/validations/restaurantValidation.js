const { body, param } = require('express-validator');

// Create restaurant validation
const createRestaurantValidation = [
  body('name')
    .notEmpty()
    .withMessage('Restaurant name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Restaurant name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('address')
    .optional()
    .trim(),
  body('city')
    .optional()
    .trim(),
  body('state')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim(),
  body('postal_code')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('cuisine_type')
    .optional()
    .trim(),
  body('cuisine_types')
    .optional()
    .isArray()
    .withMessage('Cuisine types must be an array'),
  body('operating_hours')
    .optional()
    .isObject()
    .withMessage('Operating hours must be a valid JSON object'),
  body('delivery_radius_km')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Delivery radius must be between 0 and 100 km'),
  body('minimum_order_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a positive number'),
  body('tax_rate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('service_charge')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Service charge must be between 0 and 100'),
  body('delivery_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),
];

// Update restaurant validation
const updateRestaurantValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Restaurant name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
  body('is_verified')
    .optional()
    .isBoolean()
    .withMessage('is_verified must be a boolean'),
];

// Restaurant ID param validation
const restaurantIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
];

// Verify restaurant validation (admin)
const verifyRestaurantValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('is_verified')
    .isBoolean()
    .withMessage('is_verified must be a boolean'),
  body('rejection_reason')
    .if(body('is_verified').equals('false'))
    .optional()
    .trim(),
];

// Update settings validation
const updateSettingsValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('settings')
    .isObject()
    .withMessage('Settings must be a valid JSON object'),
];

// Create table validation
const createTableValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('table_number')
    .notEmpty()
    .withMessage('Table number is required')
    .trim(),
  body('table_name')
    .optional()
    .trim(),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Capacity must be between 1 and 20'),
  body('section')
    .optional()
    .trim(),
  body('x_position')
    .optional()
    .isInt()
    .withMessage('X position must be an integer'),
  body('y_position')
    .optional()
    .isInt()
    .withMessage('Y position must be an integer'),
];

module.exports = {
  createRestaurantValidation,
  updateRestaurantValidation,
  restaurantIdValidation,
  verifyRestaurantValidation,
  updateSettingsValidation,
  createTableValidation,
};