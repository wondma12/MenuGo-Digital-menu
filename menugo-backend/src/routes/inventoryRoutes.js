const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isRestaurantStaff } = require('../middleware/roleMiddleware');
const {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
  getLowStockItems,
  getInventoryTransactions,
  getInventorySummary,
} = require('../controllers/inventoryController');

// Protected routes
router.use(protect);

// Inventory management
router.get('/restaurant/:restaurantId', isRestaurantStaff, getInventoryItems);
router.get('/restaurant/:restaurantId/summary', isRestaurantStaff, getInventorySummary);
router.get('/restaurant/:restaurantId/low-stock', isRestaurantStaff, getLowStockItems);
router.get('/restaurant/:restaurantId/transactions', isRestaurantStaff, getInventoryTransactions);
router.get('/:id', isRestaurantStaff, getInventoryItemById);
router.post('/restaurant/:restaurantId', isRestaurantStaff, createInventoryItem);
router.put('/:id', isRestaurantStaff, updateInventoryItem);
router.delete('/:id', isRestaurantStaff, deleteInventoryItem);
router.post('/:id/adjust', isRestaurantStaff, adjustStock);

module.exports = router;