const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isRestaurantStaff, restrictTo } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { reportValidations } = require('../middleware/validationMiddleware');
const {
  getSalesAnalytics,
  getMenuPerformance,
  getHourlyAnalytics,
  getCustomerAnalytics,
  getRevenueAnalytics,
  exportAnalyticsReport,
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(protect);

// Restaurant analytics
router.get('/sales/:restaurantId', isRestaurantStaff, getSalesAnalytics);
router.get('/menu/:restaurantId', isRestaurantStaff, getMenuPerformance);
router.get('/hourly/:restaurantId', isRestaurantStaff, getHourlyAnalytics);
router.get('/customers/:restaurantId', isRestaurantStaff, getCustomerAnalytics);
router.get('/revenue/:restaurantId', isRestaurantStaff, getRevenueAnalytics);

// Export
router.get('/export/:restaurantId', isRestaurantStaff, validate(reportValidations.export), exportAnalyticsReport);

module.exports = router;