const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { isRestaurantStaff, isWaiter } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { orderValidations } = require('../middleware/validationMiddleware');
const { normalizeOrderPayload } = require('../middleware/normalizeMiddleware');
const {
  createOrder,
  createOrderByWaiter,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  verifyOrder,
  getWaiterOrders,
  cancelOrder,
} = require('../controllers/orderController');

// Public route for creating order (no auth required)
// Normalize incoming payloads (camelCase → snake_case) before validation
router.post('/', normalizeOrderPayload, validate(orderValidations.create), createOrder);

// Public GET for restaurant orders when `table` query param is present (customers viewing their table)
router.get('/restaurant/:restaurantId', (req, res, next) => {
  if (req.query && (req.query.table || req.query.table_number)) {
    return getRestaurantOrders(req, res, next)
  }
  return next()
})

// Protected routes
router.use(protect);

// Restaurant admin routes
router.get('/restaurant/:restaurantId', isRestaurantStaff, getRestaurantOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', validate(orderValidations.updateStatus), updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

// Waiter routes
router.post('/waiter', isWaiter, normalizeOrderPayload, validate(orderValidations.create), createOrderByWaiter);
router.get('/waiter/orders', isWaiter, getWaiterOrders);
router.post('/:id/verify', isWaiter, validate(orderValidations.verify), verifyOrder);

module.exports = router;