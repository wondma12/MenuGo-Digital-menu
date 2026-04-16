const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { isRestaurantStaff, isWaiter } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { orderValidations } = require('../middleware/validationMiddleware');
const {
  createOrder,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  verifyOrder,
  getWaiterOrders,
  cancelOrder,
} = require('../controllers/orderController');

// Public route for creating order (no auth required)
router.post('/', validate(orderValidations.create), createOrder);

// Protected routes
router.use(protect);

// Restaurant admin routes
router.get('/restaurant/:restaurantId', isRestaurantStaff, getRestaurantOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', validate(orderValidations.updateStatus), updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

// Waiter routes
router.get('/waiter/orders', isWaiter, getWaiterOrders);
router.post('/:id/verify', isWaiter, validate(orderValidations.verify), verifyOrder);

module.exports = router;