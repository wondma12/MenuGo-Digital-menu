const { Notification, PushNotificationToken, User } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');

// Get user notifications
const getNotifications = catchAsync(async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, is_read, type } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;

    const where = { user_id: userId };
    if (is_read !== undefined) where.is_read = is_read === 'true';
    if (type) where.type = type;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: { user_id: userId, is_read: false },
    });

    return res.json(ApiResponse.success({
      notifications: rows,
      total: count,
      unread_count: unreadCount,
      page: parsedPage,
      totalPages: Math.ceil(count / parsedLimit),
    }, 'Notifications retrieved'));
  } catch (error) {
    // Notifications are optional UI data. A missing/out-of-date notification
    // table must not make the authenticated dashboard fail with HTTP 500.
    console.warn('[notifications] Falling back to an empty list:', error?.message || error);
    return res.json(ApiResponse.success({
      notifications: [],
      total: 0,
      unread_count: 0,
      page: 1,
      totalPages: 0,
    }, 'Notifications unavailable'));
  }
});

// Mark notification as read
const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    where: { id, user_id: userId },
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await notification.update({ is_read: true, read_at: new Date() });

  res.json(ApiResponse.success(null, 'Notification marked as read'));
});

// Mark all notifications as read
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;

  await Notification.update(
    { is_read: true, read_at: new Date() },
    { where: { user_id: userId, is_read: false } }
  );

  res.json(ApiResponse.success(null, 'All notifications marked as read'));
});

// Delete notification
const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    where: { id, user_id: userId },
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await notification.destroy();

  res.json(ApiResponse.success(null, 'Notification deleted'));
});

// Register push notification token
const registerPushToken = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { token, device_type, device_id } = req.body;

  // Check if token already exists
  const existingToken = await PushNotificationToken.findOne({
    where: { token, user_id: userId },
  });

  if (existingToken) {
    await existingToken.update({ is_active: true, device_type, device_id });
  } else {
    await PushNotificationToken.create({
      user_id: userId,
      token,
      device_type,
      device_id,
      is_active: true,
    });
  }

  res.json(ApiResponse.success(null, 'Push token registered'));
});

// Unregister push notification token
const unregisterPushToken = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  await PushNotificationToken.update(
    { is_active: false },
    { where: { user_id: userId, token } }
  );

  res.json(ApiResponse.success(null, 'Push token unregistered'));
});

// Send notification (admin only)
const sendNotification = catchAsync(async (req, res) => {
  const { user_id, restaurant_id, type, title, message, data } = req.body;

  if (req.user.role !== 'platform_admin' && req.user.role !== 'restaurant_admin') {
    throw new ApiError(403, 'Only admins can send notifications');
  }

  const notification = await Notification.create({
    user_id,
    restaurant_id,
    type,
    title,
    message,
    data,
  });

  res.status(201).json(ApiResponse.success(notification, 'Notification sent'));
});

// Get notification preferences
const getPreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId, {
    attributes: ['preferences'],
  });

  res.json(ApiResponse.success(user?.preferences?.notifications || {}, 'Preferences retrieved'));
});

// Update notification preferences
const updatePreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { preferences } = req.body;

  const user = await User.findByPk(userId);
  const updatedPreferences = {
    ...user.preferences,
    notifications: { ...user.preferences?.notifications, ...preferences },
  };

  await user.update({ preferences: updatedPreferences });

  res.json(ApiResponse.success(updatedPreferences.notifications, 'Preferences updated'));
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  sendNotification,
  getPreferences,
  updatePreferences,
};