const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  sendNotification,
  getPreferences,
  updatePreferences,
} = require('../controllers/notificationController');

// Protected routes
router.use(protect);

// User notifications
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Push notifications
router.post('/push-token', registerPushToken);
router.delete('/push-token', unregisterPushToken);

// Preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Admin only - send notification
router.post('/send', restrictTo('platform_admin', 'restaurant_admin'), sendNotification);

module.exports = router;