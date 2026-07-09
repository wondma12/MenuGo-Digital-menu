const express = require('express');
const router = express.Router();
// eslint-disable-next-line no-unused-vars
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

// Public routes (customer menu - view only)
router.get('/restaurant/:restaurantId', getCustomerMenu);
router.get('/items/:restaurantId', getMenuItems); // Allow customers to view menu items
router.get('/item/:id', getMenuItemById); // Allow customers to view individual menu items
router.get('/categories/:restaurantId', getCategories); // Allow customers to view menu categories

// Protected routes (requires authentication for admin operations)
router.use(protect);

// Category routes (POST/PUT/DELETE/PATCH - admin only, GET is public)
router.post('/categories/:restaurantId', isRestaurantStaff, validate(menuValidations.createCategory), createCategory);
router.put('/categories/:id', isRestaurantStaff, updateCategory);
router.delete('/categories/:id', isRestaurantStaff, deleteCategory);
router.patch('/categories/:id/status', isRestaurantStaff, toggleCategoryStatus);

// Menu item routes (POST/PUT/DELETE/PATCH - admin only, GET is public)
router.post('/items/:restaurantId', isRestaurantStaff, uploadSingle('image'), validate(menuValidations.createItem), createMenuItem);
router.put('/items/:id', isRestaurantStaff, uploadSingle('image'), validate(menuValidations.updateItem), updateMenuItem);
router.delete('/items/:id', isRestaurantStaff, deleteMenuItem);
router.patch('/items/:id/toggle', isRestaurantStaff, toggleAvailability);

// Option group routes
router.post('/option-groups/:restaurantId', isRestaurantStaff, createOptionGroup);
router.post('/option-groups/:groupId/options', isRestaurantStaff, addOption);

module.exports = router;
