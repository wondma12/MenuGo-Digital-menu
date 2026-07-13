// src/routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo, optionalAuth } = require('../middleware/authMiddleware');
const { isRestaurantOwner, isRestaurantStaff } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { restaurantValidations } = require('../middleware/validationMiddleware');
const { uploadSingle, uploadFields } = require('../middleware/uploadMiddleware');
const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
  getDashboardStats,
  verifyRestaurant,
  getPendingVerifications,
  updateSettings,
  updateSettingsSection,
  getTables,
  createTable,
} = require('../controllers/restaurantController');
const { createCallRequest } = require('../controllers/customerController');
const { getRestaurantReviews, createReview } = require('../controllers/reviewController');
const { reviewValidations } = require('../middleware/validationMiddleware');

// Public routes - customers can see active/verified restaurants
router.get('/', getAllRestaurants);
// Platform admin: get ALL restaurants with advanced filtering (MUST come before '/:id' param route to avoid conflict)
router.get('/admin/all', protect, restrictTo('platform_admin'), getAllRestaurants);
// Platform admin: pending verifications (MUST come before '/:id' param route to avoid conflict)
router.get('/pending-verifications', protect, restrictTo('platform_admin'), getPendingVerifications);
// Allow customers to view restaurant details
router.get('/:id', getRestaurantById);
// Public: create a call request from a customer at a table
router.post('/:id/calls', createCallRequest);
// Public: list available tables for customers (no auth)
router.get('/:id/tables/public', (req, res, next) => {
  // reuse restaurant getTables logic but only return minimal table info
  req.isPublicTables = true
  return getTables(req, res, next)
});

// Public: restaurant reviews (list)
router.get('/:id/reviews', (req, res, next) => {
  req.params.restaurantId = req.params.id;
  return getRestaurantReviews(req, res, next);
});

// Public: table operations (customers need access for QR code ordering and seating)
router.get('/:id/tables', getTables);
router.post('/:id/tables', createTable);

// Protected routes
router.use(protect);

// Restaurant-scoped settings (by authenticated user's restaurant or provided restaurant id)
// Handles endpoints like: PUT /restaurants/settings/notifications, /restaurants/settings/payment, etc.
router.put('/settings/:section', updateSettingsSection);

// (pending-verifications route moved above to avoid conflict with '/:id')

// Restaurant owner routes
// Accept multiple optional files in the same multipart: document (business license), logo, banner, coverImage
router.post('/', uploadFields([{ name: 'document', maxCount: 1 }, { name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), validate(restaurantValidations.create), createRestaurant);
router.put('/:id', isRestaurantOwner, uploadFields([{ name: 'document', maxCount: 1 }, { name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), validate(restaurantValidations.update), updateRestaurant);
// Allow platform admins to delete restaurants too — controller enforces owner OR platform_admin.
router.delete('/:id', deleteRestaurant);
router.get('/:id/dashboard', isRestaurantOwner, getDashboardStats);
router.put('/:id/settings', isRestaurantOwner, updateSettings);

// Platform admin routes
router.patch('/:id/status', restrictTo('platform_admin'), updateRestaurantStatus);
router.post('/:id/verify', restrictTo('platform_admin'), verifyRestaurant);

// Reviews (mounted here for frontend convenience) - allow optional auth for customers
router.post('/:id/reviews', optionalAuth, validate(reviewValidations.create), (req, res, next) => {
  req.params.restaurantId = req.params.id;
  return createReview(req, res, next);
});

module.exports = router;
