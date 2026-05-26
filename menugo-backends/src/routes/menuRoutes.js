const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { isRestaurantStaff } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { menuValidations } = require('../middleware/validationMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getCustomerMenu,
  createOptionGroup,
  addOption,
} = require('../controllers/menuController');

// Public routes (customer menu)
router.get('/restaurant/:restaurantId', getCustomerMenu);

// Protected routes
router.use(protect);

// Category routes
router.get('/categories/:restaurantId', isRestaurantStaff, getCategories);
router.post('/categories/:restaurantId', isRestaurantStaff, validate(menuValidations.createCategory), createCategory);
router.put('/categories/:id', isRestaurantStaff, updateCategory);
router.delete('/categories/:id', isRestaurantStaff, deleteCategory);
router.patch('/categories/:id/status', isRestaurantStaff, toggleCategoryStatus);

// Menu item routes
router.get('/items/:restaurantId', isRestaurantStaff, getMenuItems);
router.get('/item/:id', isRestaurantStaff, getMenuItemById);
router.post('/items/:restaurantId', isRestaurantStaff, uploadSingle('image'), validate(menuValidations.createItem), createMenuItem);
router.put('/items/:id', isRestaurantStaff, uploadSingle('image'), validate(menuValidations.updateItem), updateMenuItem);
router.delete('/items/:id', isRestaurantStaff, deleteMenuItem);
router.patch('/items/:id/toggle', isRestaurantStaff, toggleAvailability);

// Option group routes
router.post('/option-groups/:restaurantId', isRestaurantStaff, createOptionGroup);
router.post('/option-groups/:groupId/options', isRestaurantStaff, addOption);

module.exports = router;