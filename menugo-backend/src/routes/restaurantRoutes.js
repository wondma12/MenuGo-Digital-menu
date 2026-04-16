// src/routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { isRestaurantOwner, isRestaurantStaff } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { restaurantValidations } = require('../middleware/validationMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus,
  getDashboardStats,
  verifyRestaurant,
  updateSettings,
  getTables,
  createTable,
} = require('../controllers/restaurantController');

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes
router.use(protect);

// Restaurant owner routes
router.post('/', validate(restaurantValidations.create), createRestaurant);
router.put('/:id', isRestaurantOwner, validate(restaurantValidations.update), updateRestaurant);
router.delete('/:id', isRestaurantOwner, deleteRestaurant);
router.get('/:id/dashboard', isRestaurantOwner, getDashboardStats);
router.put('/:id/settings', isRestaurantOwner, updateSettings);

// Platform admin routes
router.patch('/:id/status', restrictTo('platform_admin'), updateRestaurantStatus);
router.post('/:id/verify', restrictTo('platform_admin'), verifyRestaurant);

// Table routes
router.get('/:id/tables', isRestaurantStaff, getTables);
router.post('/:id/tables', isRestaurantOwner, createTable);

module.exports = router;
