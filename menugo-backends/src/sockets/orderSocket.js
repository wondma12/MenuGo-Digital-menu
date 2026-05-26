const { logger } = require('../utils/logger');
const { ORDER_STATUS } = require('../utils/constants');

const orderSocket = (io, socket) => {
  // Join order room
  socket.on('join-order', (orderId) => {
    socket.join(`order:${orderId}`);
    logger.info(`Socket ${socket.id} joined order room: ${orderId}`);
  });

  // Leave order room
  socket.on('leave-order', (orderId) => {
    socket.leave(`order:${orderId}`);
    logger.info(`Socket ${socket.id} left order room: ${orderId}`);
  });

  // Track order status
  socket.on('track-order', (orderId) => {
    socket.join(`order-tracking:${orderId}`);
    logger.info(`Socket ${socket.id} started tracking order: ${orderId}`);
  });

  // Stop tracking order
  socket.on('stop-tracking-order', (orderId) => {
    socket.leave(`order-tracking:${orderId}`);
    logger.info(`Socket ${socket.id} stopped tracking order: ${orderId}`);
  });

  // Emit new order to restaurant
  const emitNewOrder = (restaurantId, orderData) => {
    io.to(`restaurant:${restaurantId}`).emit('new-order', orderData);
    logger.info(`New order emitted to restaurant: ${restaurantId}`);
  };

  // Emit order status update
  const emitOrderStatusUpdate = (orderId, restaurantId, status, data = {}) => {
    // Emit to order room
    io.to(`order:${orderId}`).emit('order-status-updated', {
      orderId,
      status,
      ...data,
      timestamp: new Date().toISOString(),
    });

    // Emit to order tracking room
    io.to(`order-tracking:${orderId}`).emit('order-tracking-updated', {
      orderId,
      status,
      ...data,
      timestamp: new Date().toISOString(),
    });

    // Emit to restaurant room
    io.to(`restaurant:${restaurantId}`).emit('order-status-changed', {
      orderId,
      status,
      ...data,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Order ${orderId} status updated to ${status}`);
  };

  // Emit order verified
  const emitOrderVerified = (orderId, restaurantId, verifiedBy) => {
    io.to(`restaurant:${restaurantId}`).emit('order-verified', {
      orderId,
      verifiedBy,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`order:${orderId}`).emit('order-verified', {
      orderId,
      verifiedBy,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit order ready
  const emitOrderReady = (orderId, restaurantId, preparationTime) => {
    io.to(`restaurant:${restaurantId}`).emit('order-ready', {
      orderId,
      preparationTime,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`order:${orderId}`).emit('order-ready', {
      orderId,
      preparationTime,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit order served
  const emitOrderServed = (orderId, restaurantId, servedBy) => {
    io.to(`restaurant:${restaurantId}`).emit('order-served', {
      orderId,
      servedBy,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`order:${orderId}`).emit('order-served', {
      orderId,
      servedBy,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit order cancelled
  const emitOrderCancelled = (orderId, restaurantId, reason) => {
    io.to(`restaurant:${restaurantId}`).emit('order-cancelled', {
      orderId,
      reason,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`order:${orderId}`).emit('order-cancelled', {
      orderId,
      reason,
      timestamp: new Date().toISOString(),
    });
  };

  // Emit kitchen display update
  const emitKitchenUpdate = (restaurantId, orders) => {
    io.to(`restaurant:${restaurantId}`).emit('kitchen-updated', {
      orders,
      timestamp: new Date().toISOString(),
    });
  };

  // Handle kitchen order status update from chef
  socket.on('kitchen-order-update', (data) => {
    const { orderId, restaurantId, status, notes } = data;
    
    // Update order status
    io.to(`restaurant:${restaurantId}`).emit('kitchen-order-status-changed', {
      orderId,
      status,
      notes,
      timestamp: new Date().toISOString(),
    });
    
    // Notify waiters
    io.to(`restaurant:${restaurantId}`).emit('order-status-for-waiter', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle order preparation start
  socket.on('start-preparation', (data) => {
    const { orderId, restaurantId, chefId } = data;
    
    io.to(`restaurant:${restaurantId}`).emit('preparation-started', {
      orderId,
      chefId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle order completion
  socket.on('complete-order', (data) => {
    const { orderId, restaurantId, completedBy } = data;
    
    io.to(`restaurant:${restaurantId}`).emit('order-completed', {
      orderId,
      completedBy,
      timestamp: new Date().toISOString(),
    });
  });

  // Attach event handlers to socket
  socket.on('emit-new-order', (data) => {
    const { restaurantId, orderData } = data;
    emitNewOrder(restaurantId, orderData);
  });

  socket.on('emit-order-status-update', (data) => {
    const { orderId, restaurantId, status, additionalData } = data;
    emitOrderStatusUpdate(orderId, restaurantId, status, additionalData);
  });

  // Export emit functions for use in controllers
  socket.emitNewOrder = emitNewOrder;
  socket.emitOrderStatusUpdate = emitOrderStatusUpdate;
  socket.emitOrderVerified = emitOrderVerified;
  socket.emitOrderReady = emitOrderReady;
  socket.emitOrderServed = emitOrderServed;
  socket.emitOrderCancelled = emitOrderCancelled;
  socket.emitKitchenUpdate = emitKitchenUpdate;
};

module.exports = orderSocket;
