const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validate, commonValidations } = require('../middleware/validationMiddleware');
const { body } = require('express-validator');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
  getUserSessions,
  revokeSession,
  getUserStats,
  toggleUserStatus,
  createUser,
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
  createUser
);
router.get('/stats', restrictTo('platform_admin'), getUserStats);
router.post('/:id/toggle-status', restrictTo('platform_admin'), toggleUserStatus);

// User profile routes
router.get('/me/sessions', getUserSessions);
router.delete('/me/sessions/:sessionId', revokeSession);
router.post('/me/avatar', uploadSingle('avatar'), uploadAvatar);

// User CRUD routes
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;