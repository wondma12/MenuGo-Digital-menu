const { logger } = require('../utils/logger');

const analyticsSocket = (io, socket) => {
  // Join analytics room
  socket.on('join-analytics', (restaurantId) => {
    socket.join(`analytics:${restaurantId}`);
    logger.info(`Socket ${socket.id} joined analytics room for restaurant: ${restaurantId}`);
  });

  // Leave analytics room
  socket.on('leave-analytics', (restaurantId) => {
    socket.leave(`analytics:${restaurantId}`);
    logger.info(`Socket ${socket.id} left analytics room for restaurant: ${restaurantId}`);
  });

  // Request real-time metrics
  socket.on('request-realtime-metrics', async (restaurantId) => {
    try {
      const { Order } = require('../models');
      
      // Get today's metrics
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayOrders = await Order.count({
        where: {
          restaurant_id: restaurantId,
          // eslint-disable-next-line no-undef
          created_at: { [Op.gte]: todayStart },
        },
      });
      
      const todayRevenue = await Order.sum('total_amount', {
        where: {
          restaurant_id: restaurantId,
          // eslint-disable-next-line no-undef
          created_at: { [Op.gte]: todayStart },
          status: 'completed',
        },
      });
      
      const activeOrders = await Order.count({
        where: {
          restaurant_id: restaurantId,
          status: ['pending', 'verified', 'preparing', 'ready'],
        },
      });
      
      socket.emit('realtime-metrics', {
        todayOrders,
        todayRevenue: todayRevenue || 0,
        activeOrders,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get realtime metrics error:', error);
      socket.emit('analytics-error', { message: 'Failed to get realtime metrics' });
    }
  });

  // Emit real-time metrics update
  const emitRealtimeMetrics = (restaurantId, metrics) => {
    io.to(`analytics:${restaurantId}`).emit('metrics-updated', {
      ...metrics,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Real-time metrics emitted for restaurant: ${restaurantId}`);
  };

  // Emit order volume update
  const emitOrderVolumeUpdate = (restaurantId, volume) => {
    io.to(`analytics:${restaurantId}`).emit('order-volume-updated', {
      volume,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit revenue update
  const emitRevenueUpdate = (restaurantId, revenue) => {
    io.to(`analytics:${restaurantId}`).emit('revenue-updated', {
      revenue,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit popular items update
  const emitPopularItemsUpdate = (restaurantId, popularItems) => {
    io.to(`analytics:${restaurantId}`).emit('popular-items-updated', {
      items: popularItems,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit table occupancy update
  const emitTableOccupancyUpdate = (restaurantId, occupancy) => {
    io.to(`analytics:${restaurantId}`).emit('table-occupancy-updated', {
      occupancy,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit waiter performance update
  const emitWaiterPerformanceUpdate = (restaurantId, performance) => {
    io.to(`analytics:${restaurantId}`).emit('waiter-performance-updated', {
      performance,
      timestamp: new Date().toISOString(),
    });
  };

  // Handle request for hourly breakdown
  socket.on('request-hourly-breakdown', async (restaurantId, date) => {
    try {
      const { HourlyAnalytics } = require('../models');
      const targetDate = date ? new Date(date) : new Date();
      
      const hourlyData = await HourlyAnalytics.findAll({
        where: {
          restaurant_id: restaurantId,
          date: targetDate,
        },
        order: [['hour', 'ASC']],
      });
      
      socket.emit('hourly-breakdown', { hourlyData });
    } catch (error) {
      logger.error('Get hourly breakdown error:', error);
      socket.emit('analytics-error', { message: 'Failed to get hourly breakdown' });
    }
  });

  // Attach emit functions to socket
  socket.emitRealtimeMetrics = emitRealtimeMetrics;
  socket.emitOrderVolumeUpdate = emitOrderVolumeUpdate;
  socket.emitRevenueUpdate = emitRevenueUpdate;
  socket.emitPopularItemsUpdate = emitPopularItemsUpdate;
  socket.emitTableOccupancyUpdate = emitTableOccupancyUpdate;
  socket.emitWaiterPerformanceUpdate = emitWaiterPerformanceUpdate;
};

module.exports = analyticsSocket;
