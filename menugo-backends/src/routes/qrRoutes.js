const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { isRestaurantStaff } = require('../middleware/roleMiddleware');
const {
  generateRestaurantQR,
  generateTableQR,
  downloadQR,
  recordScan,
  getQRAnalytics,
  getRestaurantQRCodes,
  deactivateQR,
} = require('../controllers/qrController');

// Public routes
router.post('/scan/:identifier', recordScan);

// Protected routes
router.use(protect);

// QR generation
router.post('/restaurant/:restaurantId/generate', isRestaurantStaff, generateRestaurantQR);
router.post('/restaurant/:restaurantId/table/:tableId/generate', isRestaurantStaff, generateTableQR);

// QR management
router.get('/restaurant/:restaurantId', isRestaurantStaff, getRestaurantQRCodes);
router.get('/restaurant/:restaurantId/analytics', isRestaurantStaff, getQRAnalytics);
router.patch('/:id/deactivate', isRestaurantStaff, deactivateQR);

// Download
router.get('/download/:identifier', downloadQR);

module.exports = router;