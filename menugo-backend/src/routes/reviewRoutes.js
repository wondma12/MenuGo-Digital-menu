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

// Customer review routes (allow optional auth so guests can leave restaurant-level reviews)
router.post('/restaurant/:restaurantId', optionalAuth, validate(reviewValidations.create), createReview);

// Protected routes (routes below require authentication)
router.use(protect);

// Restaurant admin routes
router.patch('/:id/status', isRestaurantStaff, validate(reviewValidations.updateStatus), updateReviewStatus);
router.delete('/:id', isRestaurantStaff, deleteReview);

// Waiter feedback routes
router.get('/waiter/:waiterId', isRestaurantStaff, getWaiterFeedback);
router.post('/waiter/:waiterId/order/:orderId', isRestaurantStaff, createWaiterFeedback);

module.exports = router;