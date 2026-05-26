const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isRestaurantStaff, restrictTo } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { reportValidations } = require('../middleware/validationMiddleware');
const {
  generateSalesReport,
  generateOrderReport,
  generateMenuReport,
  generateOrderInvoice,
  exportData,
} = require('../controllers/reportController');

// Protected routes
router.use(protect);

// Reports
router.get('/sales/:restaurantId', isRestaurantStaff, validate(reportValidations.generate), generateSalesReport);
router.get('/orders/:restaurantId', isRestaurantStaff, validate(reportValidations.generate), generateOrderReport);
router.get('/menu/:restaurantId', isRestaurantStaff, validate(reportValidations.generate), generateMenuReport);

// Invoice
router.get('/invoice/:orderId', isRestaurantStaff, generateOrderInvoice);

// Export data
router.get('/export/:restaurantId', isRestaurantStaff, validate(reportValidations.export), exportData);

module.exports = router;