const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { isRestaurantStaff, restrictTo } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { reviewValidations } = require('../middleware/validationMiddleware');
const {
  getRestaurantReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
  getWaiterFeedback,
  createWaiterFeedback,
} = require('../controllers/reviewController');

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Protected routes
router.use(protect);

// Customer review routes
router.post('/restaurant/:restaurantId', validate(reviewValidations.create), createReview);

// Restaurant admin routes
router.patch('/:id/status', isRestaurantStaff, validate(reviewValidations.updateStatus), updateReviewStatus);
router.delete('/:id', isRestaurantStaff, deleteReview);

// Waiter feedback routes
router.get('/waiter/:waiterId', isRestaurantStaff, getWaiterFeedback);
router.post('/waiter/:waiterId/order/:orderId', isRestaurantStaff, createWaiterFeedback);

module.exports = router;