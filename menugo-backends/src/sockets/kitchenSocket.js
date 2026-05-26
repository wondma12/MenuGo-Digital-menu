// src/sockets/kitchenSocket.js
const db = require('../config/database');
const KitchenService = require('../services/kitchenService');
const KitchenOrder = require('../models/KitchenOrder');
const { logger } = require('../utils/logger');

module.exports = (io) => {
  const kitchenNamespace = io.of('/kitchen');
  
  kitchenNamespace.on('connection', (socket) => {
    logger.info('Kitchen socket connected:', socket.id);
    let currentRestaurantId = null;
    
    // Join kitchen room
    socket.on('join-kitchen', async (restaurantId) => {
      try {
        currentRestaurantId = restaurantId;
        socket.join(`kitchen:${restaurantId}`);
        socket.join(`restaurant:${restaurantId}`);

        // Send initial stats
        const stats = await KitchenService.getRealtimeStats(restaurantId).catch(() => null);
        socket.emit('initial-stats', stats);

        logger.info(`Socket ${socket.id} joined kitchen:${restaurantId}`);
      } catch (e) {
        logger.warn('Error in join-kitchen', e.message || e);
      }
    });
    
    // Leave kitchen room
    socket.on('leave-kitchen', () => {
      try {
        if (currentRestaurantId) {
          socket.leave(`kitchen:${currentRestaurantId}`);
          socket.leave(`restaurant:${currentRestaurantId}`);
          logger.info(`Socket ${socket.id} left kitchen:${currentRestaurantId}`);
        }
      } catch (e) {
        logger.warn('leave-kitchen error', e.message || e);
      }
    });
    
    // New order notification
    socket.on('new-order', async (data) => {
      const { restaurantId, order } = data || {};
      try {
        const kitchenOrder = await KitchenService.createKitchenOrder(order);

        // Notify all kitchen staff on the kitchen namespace
        const payload = { type: 'new-order', order: kitchenOrder, timestamp: new Date() };
        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('order-received', payload);
        // Also notify restaurant room so interested clients (waiter/owner UIs) receive it
        kitchenNamespace.to(`restaurant:${restaurantId}`).emit('order-received', payload);

        const stats = await KitchenService.getRealtimeStats(restaurantId).catch(() => null);
        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('stats-update', stats);
        kitchenNamespace.to(`restaurant:${restaurantId}`).emit('stats-update', stats);

        // Trigger sound notification (kitchen only)
        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('play-sound', 'new-order.mp3');
      } catch (e) {
        logger.error('Error handling new-order', e.message || e);
      }
    });
    
    // Order status update
    socket.on('update-status', async (data) => {
      const { orderId, status, restaurantId, notes } = data || {};
      try {
        const updatedOrder = await KitchenOrder.updateStatus(orderId, status, notes);

        // Notify kitchen
        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('order-status-changed', {
          orderId,
          status,
          order: updatedOrder,
          timestamp: new Date()
        });

        // Notify restaurant/channel
        kitchenNamespace.to(`restaurant:${restaurantId}`).emit('kitchen-status-update', {
          orderId,
          status,
          type: 'kitchen-update'
        });

        // Update stats and emit
        const stats = await KitchenService.getRealtimeStats(restaurantId).catch(() => null);
        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('stats-update', stats);

        // Play ready sound
        if (status === 'ready') {
          kitchenNamespace.to(`kitchen:${restaurantId}`).emit('play-sound', 'order-ready.mp3');
        }
      } catch (e) {
        logger.error('Error handling update-status', e.message || e);
      }
    });
    
    // Bulk status update
    socket.on('bulk-update', async (data) => {
      const { orderIds, status, restaurantId } = data || {};
      try {
        await KitchenOrder.bulkUpdateStatus(orderIds, status);

        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('bulk-update-complete', {
          orderIds,
          status,
          count: orderIds.length,
          timestamp: new Date()
        });

        const stats = await KitchenService.getRealtimeStats(restaurantId).catch(() => null);
        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('stats-update', stats);
      } catch (e) {
        logger.error('Error handling bulk-update', e.message || e);
      }
    });
    
    // Station assignment
    socket.on('assign-station', async (data) => {
      const { orderId, stationId, restaurantId } = data || {};
      try {
        await db.execute(
          `INSERT INTO kitchen_station_assignments (station_id, kitchen_order_id)
           VALUES (?, ?)`,
          [stationId, orderId]
        );

        kitchenNamespace.to(`kitchen:${restaurantId}`).emit('station-assigned', {
          orderId,
          stationId,
          timestamp: new Date()
        });
      } catch (e) {
        logger.error('Error handling assign-station', e.message || e);
      }
    });
    
    // Request current orders
    socket.on('request-orders', async () => {
      try {
        if (currentRestaurantId) {
          const dashboard = await KitchenOrder.getDashboardData(currentRestaurantId);
          socket.emit('current-orders', dashboard);
        }
      } catch (e) {
        logger.error('Error handling request-orders', e.message || e);
      }
    });
    
    // Kitchen activity broadcast
    socket.on('kitchen-activity', (data) => {
      const { restaurantId, activity, message } = data || {};
      try {
        socket.to(`kitchen:${restaurantId}`).emit('activity-log', {
          activity,
          message,
          user: socket.user?.name || 'Kitchen Staff',
          timestamp: new Date()
        });
      } catch (e) {
        logger.warn('Error broadcasting kitchen-activity', e.message || e);
      }
    });
    
    // Typing indicator
    socket.on('chef-typing', (data) => {
      const { restaurantId, isTyping } = data || {};
      try {
        socket.to(`kitchen:${restaurantId}`).emit('chef-typing-status', {
          isTyping,
          chef: socket.user?.name || 'Chef'
        });
      } catch (e) {
        logger.warn('Error broadcasting chef-typing', e.message || e);
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Kitchen socket disconnected: ${socket.id}`);
      try {
        if (currentRestaurantId) {
          socket.to(`kitchen:${currentRestaurantId}`).emit('chef-offline', {
            chefId: socket.user?.id,
            timestamp: new Date()
          });
        }
      } catch (e) {
        logger.warn('Error on disconnect broadcast', e.message || e);
      }
    });
  });
};