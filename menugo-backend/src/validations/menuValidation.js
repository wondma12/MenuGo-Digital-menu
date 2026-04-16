const { body, param } = require('express-validator');

// Create category validation
const createCategoryValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('icon_url')
    .optional()
    .isURL()
    .withMessage('Icon URL must be a valid URL'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
];

// Update category validation
const updateCategoryValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid category ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
];

// Create menu item validation
const createMenuItemValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('name')
    .notEmpty()
    .withMessage('Item name is required')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Item name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('price')
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be between 0 and 9999.99'),
  body('discount_price')
    .optional()
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Discount price must be between 0 and 9999.99')
    .custom((value, { req }) => {
      if (value && value >= req.body.price) {
        throw new Error('Discount price must be less than regular price');
      }
      return true;
    }),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID format'),
  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available must be a boolean'),
  body('is_recommended')
    .optional()
    .isBoolean()
    .withMessage('is_recommended must be a boolean'),
  body('is_vegetarian')
    .optional()
    .isBoolean()
    .withMessage('is_vegetarian must be a boolean'),
  body('is_vegan')
    .optional()
    .isBoolean()
    .withMessage('is_vegan must be a boolean'),
  body('is_gluten_free')
    .optional()
    .isBoolean()
    .withMessage('is_gluten_free must be a boolean'),
  body('spice_level')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spice level must be between 0 and 5'),
  body('preparation_time')
    .optional()
    .isInt({ min: 0, max: 180 })
    .withMessage('Preparation time must be between 0 and 180 minutes'),
  body('calories')
    .optional()
    .isInt({ min: 0, max: 5000 })
    .withMessage('Calories must be between 0 and 5000'),
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

// Update menu item validation
const updateMenuItemValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid menu item ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Item name must be between 2 and 255 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be between 0 and 9999.99'),
  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available must be a boolean'),
];

// Toggle availability validation
const toggleAvailabilityValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid menu item ID format'),
];

// Create option group validation
const createOptionGroupValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('name')
    .notEmpty()
    .withMessage('Option group name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Option group name must be between 2 and 100 characters'),
  body('min_selection')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum selection must be a non-negative integer'),
  body('max_selection')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum selection must be at least 1'),
  body('is_required')
    .optional()
    .isBoolean()
    .withMessage('is_required must be a boolean'),
];

// Add option validation
const addOptionValidation = [
  param('groupId')
    .isUUID()
    .withMessage('Invalid option group ID format'),
  body('name')
    .notEmpty()
    .withMessage('Option name is required')
    .trim(),
  body('price_adjustment')
    .optional()
    .isFloat({ min: -999, max: 999 })
    .withMessage('Price adjustment must be between -999 and 999'),
  body('is_default')
    .optional()
    .isBoolean()
    .withMessage('is_default must be a boolean'),
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation,
  createMenuItemValidation,
  updateMenuItemValidation,
  toggleAvailabilityValidation,
  createOptionGroupValidation,
  addOptionValidation,
};