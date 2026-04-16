const { logger } = require('../utils/logger');

const notificationSocket = (io, socket) => {
  // Join notification room
  socket.on('join-notifications', () => {
    socket.join(`notifications:${socket.userId}`);
    logger.info(`Socket ${socket.id} joined notifications room for user: ${socket.userId}`);
  });

  // Leave notification room
  socket.on('leave-notifications', () => {
    socket.leave(`notifications:${socket.userId}`);
    logger.info(`Socket ${socket.id} left notifications room for user: ${socket.userId}`);
  });

  // Mark notification as read
  socket.on('mark-notification-read', async (notificationId) => {
    try {
      const { Notification } = require('../models');
      await Notification.update(
        { is_read: true, read_at: new Date() },
        { where: { id: notificationId, user_id: socket.userId } },
      );
      
      socket.emit('notification-marked-read', { notificationId });
    } catch (error) {
      logger.error('Mark notification read error:', error);
      socket.emit('notification-error', { message: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  socket.on('mark-all-notifications-read', async () => {
    try {
      const { Notification } = require('../models');
      await Notification.update(
        { is_read: true, read_at: new Date() },
        { where: { user_id: socket.userId, is_read: false } },
      );
      
      socket.emit('all-notifications-marked-read');
    } catch (error) {
      logger.error('Mark all notifications read error:', error);
      socket.emit('notification-error', { message: 'Failed to mark all notifications as read' });
    }
  });

  // Get unread count
  socket.on('get-unread-count', async () => {
    try {
      const { Notification } = require('../models');
      const count = await Notification.count({
        where: { user_id: socket.userId, is_read: false },
      });
      
      socket.emit('unread-count', { count });
    } catch (error) {
      logger.error('Get unread count error:', error);
      socket.emit('notification-error', { message: 'Failed to get unread count' });
    }
  });

  // Emit new notification
  const emitNewNotification = (userId, notification) => {
    io.to(`notifications:${userId}`).emit('new-notification', notification);
    io.to(`user:${userId}`).emit('notification', notification);
    logger.info(`New notification emitted to user: ${userId}`);
  };

  // Emit notification to restaurant staff
  const emitToRestaurantStaff = (restaurantId, notification) => {
    io.to(`restaurant:${restaurantId}`).emit('restaurant-notification', notification);
    logger.info(`Notification emitted to restaurant: ${restaurantId}`);
  };

  // Emit notification to waiters
  const emitToWaiters = (restaurantId, notification) => {
    io.to(`restaurant:${restaurantId}`).emit('waiter-notification', notification);
    logger.info(`Notification emitted to waiters at restaurant: ${restaurantId}`);
  };

  // Emit low stock alert
  const emitLowStockAlert = (restaurantId, inventoryData) => {
    io.to(`restaurant:${restaurantId}`).emit('low-stock-alert', {
      ...inventoryData,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Low stock alert emitted to restaurant: ${restaurantId}`);
  };

  // Emit system notification
  const emitSystemNotification = (userId, notification) => {
    io.to(`user:${userId}`).emit('system-notification', notification);
    logger.info(`System notification emitted to user: ${userId}`);
  };

  // Emit broadcast notification
  const emitBroadcastNotification = (notification) => {
    io.emit('broadcast-notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
    logger.info('Broadcast notification emitted to all users');
  };

  // Handle acknowledge notification
  socket.on('acknowledge-notification', (notificationId) => {
    socket.emit('notification-acknowledged', { notificationId });
    logger.info(`Notification ${notificationId} acknowledged by user: ${socket.userId}`);
  });

  // Attach emit functions to socket
  socket.emitNewNotification = emitNewNotification;
  socket.emitToRestaurantStaff = emitToRestaurantStaff;
  socket.emitToWaiters = emitToWaiters;
  socket.emitLowStockAlert = emitLowStockAlert;
  socket.emitSystemNotification = emitSystemNotification;
  socket.emitBroadcastNotification = emitBroadcastNotification;
};

module.exports = notificationSocket;
