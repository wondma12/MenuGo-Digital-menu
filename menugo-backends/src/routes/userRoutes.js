const express = require('express');
const router = express.Router();
const { protect, restrictTo, authorize } = require('../middleware/authMiddleware');
const { validate, commonValidations } = require('../middleware/validationMiddleware');
const { body } = require('express-validator');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
  getUserActivity,
  uploadBusinessLicense,
  getUserSessions,
  revokeSession,
  getUserStats,
  toggleUserStatus,
  createUser,
  inviteUser,
  getRestaurantUsers,
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Platform admin only routes
router.get('/', restrictTo('platform_admin'), getAllUsers);
router.post(
  '/',
  restrictTo('platform_admin'),
  validate([
    commonValidations.email,
    commonValidations.password,
    body('full_name').optional().trim(),
    body('phone').optional(),
    body('role').optional().isString(),
    body('restaurant_name')
      .if(body('role').equals('restaurant_admin'))
      .notEmpty()
      .withMessage('Restaurant name is required when creating a restaurant admin'),
  ]),
  createUser,
);
router.get('/stats', restrictTo('platform_admin'), getUserStats);
router.post('/:id/toggle-status', restrictTo('platform_admin'), toggleUserStatus);

// Invite a user to the restaurant (restaurant admin/owner or platform admin)
router.post(
  '/invite',
  protect,
  authorize('restaurant_admin', 'platform_admin', 'admin'),
  validate([
    commonValidations.email,
    body('role').optional().isString(),
  ]),
  inviteUser,
);

// Get restaurant users (optionally provide :restaurantId or omit to infer)
router.get('/restaurant/:restaurantId', protect, authorize('restaurant_admin', 'platform_admin', 'admin'), getRestaurantUsers);
router.get('/restaurant', protect, authorize('restaurant_admin', 'platform_admin', 'admin'), getRestaurantUsers);

// User profile routes
router.get('/me/sessions', getUserSessions);
router.delete('/me/sessions/:sessionId', revokeSession);
router.post('/me/avatar', uploadSingle('avatar'), uploadAvatar);
router.post('/me/business-license', uploadSingle('businessLicenseDocument'), uploadBusinessLicense);

// Activity logs for a user
router.get('/:id/activity', getUserActivity);

// User CRUD routes
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;