// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo, isRestaurantStaff, isWaiter } = require('../middleware/roleMiddleware');
const {
  getRestaurantDashboard,
  getPlatformDashboard,
  getWaiterDashboard,
  getCustomerDashboard,
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(protect);

// Platform admin dashboard
router.get('/platform', restrictTo('platform_admin'), getPlatformDashboard);

// Restaurant staff dashboard
router.get('/restaurant', isRestaurantStaff, getRestaurantDashboard);

// Waiter dashboard
router.get('/waiter', isWaiter, getWaiterDashboard);

// Customer dashboard
router.get('/customer', restrictTo('customer'), getCustomerDashboard);

module.exports = router;
