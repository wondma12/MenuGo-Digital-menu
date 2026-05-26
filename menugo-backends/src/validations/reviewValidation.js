const { body, param } = require('express-validator');

// Create review validation
const createReviewValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('order_id')
    .optional()
    .isUUID()
    .withMessage('Invalid order ID format'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
];

// Update review status validation (admin)
const updateReviewStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid review ID format'),
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'reported'])
    .withMessage('Status must be pending, approved, rejected, or reported'),
  body('reply_from_restaurant')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reply cannot exceed 1000 characters'),
];

// Create waiter feedback validation
const createWaiterFeedbackValidation = [
  param('waiterId')
    .isUUID()
    .withMessage('Invalid waiter ID format'),
  param('orderId')
    .isUUID()
    .withMessage('Invalid order ID format'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('response_time_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Response time rating must be between 1 and 5'),
  body('service_quality_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service quality rating must be between 1 and 5'),
  body('helpfulness_rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Helpfulness rating must be between 1 and 5'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
];

// Get reviews query validation
const getReviewsQueryValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'reported'])
    .withMessage('Status must be pending, approved, rejected, or reported'),
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
  createReviewValidation,
  updateReviewStatusValidation,
  createWaiterFeedbackValidation,
  getReviewsQueryValidation,
};