// src/routes/kitchenRoutes.js
const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateKitchenUpdate } = require('../validations/kitchenValidation');

// All routes require authentication
router.use(protect);
router.use(authorize('kitchen', 'chef', 'admin', 'restaurant_admin'));

// Dashboard routes
router.get('/dashboard/:restaurantId', kitchenController.getDashboardData);
router.get('/completed/:restaurantId', kitchenController.getCompletedOrders);
router.get('/analytics/:restaurantId', kitchenController.getKitchenAnalytics);
router.get('/inventory-alerts/:restaurantId', kitchenController.getInventoryAlerts);
router.get('/stations/:restaurantId', kitchenController.getKitchenStations);

// Order management routes
router.get('/orders/:orderId', kitchenController.getOrderDetails);
router.put('/orders/:orderId/status', validateKitchenUpdate, kitchenController.updateOrderStatus);
router.post('/orders/bulk-update', kitchenController.bulkUpdateStatus);

module.exports = router;