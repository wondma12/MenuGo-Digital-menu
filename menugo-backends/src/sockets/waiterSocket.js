const { logger } = require('../utils/logger');
const { WAITER_REALTIME_STATUS } = require('../utils/constants');

const waiterSocket = (io, socket) => {
  // Join waiter room
  socket.on('join-waiter', (waiterId) => {
    socket.join(`waiter:${waiterId}`);
    logger.info(`Socket ${socket.id} joined waiter room: ${waiterId}`);
  });

  // Leave waiter room
  socket.on('leave-waiter', (waiterId) => {
    socket.leave(`waiter:${waiterId}`);
    logger.info(`Socket ${socket.id} left waiter room: ${waiterId}`);
  });

  // Update waiter status
  socket.on('update-waiter-status', async (data) => {
    const { waiterId, status, location, currentTableId } = data;
    
    try {
      const { WaiterRealtimeStatus } = require('../models');
      await WaiterRealtimeStatus.upsert({
        waiter_id: waiterId,
        status,
        current_location: location,
        current_table_id: currentTableId,
        last_activity: new Date(),
      });
      
      // Emit status update to restaurant
      io.to(`restaurant:${socket.restaurantId}`).emit('waiter-status-changed', {
        waiterId,
        status,
        timestamp: new Date().toISOString(),
      });
      
      logger.info(`Waiter ${waiterId} status updated to ${status}`);
    } catch (error) {
      logger.error('Update waiter status error:', error);
      socket.emit('waiter-error', { message: 'Failed to update status' });
    }
  });

  // Handle waiter call from customer
  socket.on('waiter-call', (data) => {
    const { tableId, tableNumber, callType, customerName, notes } = data;
    
    // Find available waiter or broadcast to all waiters
    io.to(`restaurant:${socket.restaurantId}`).emit('customer-call', {
      tableId,
      tableNumber,
      callType,
      customerName,
      notes,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Customer call from table ${tableNumber} at restaurant ${socket.restaurantId}`);
  });

  // Acknowledge waiter call
  socket.on('acknowledge-call', (data) => {
    const { callId, waiterId, tableId } = data;
    
    io.to(`restaurant:${socket.restaurantId}`).emit('call-acknowledged', {
      callId,
      waiterId,
      tableId,
      timestamp: new Date().toISOString(),
    });
    
    // Notify the specific table
    io.to(`table:${tableId}`).emit('call-acknowledged', {
      waiterId,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Call ${callId} acknowledged by waiter ${waiterId}`);
  });

  // Resolve waiter call
  socket.on('resolve-call', (data) => {
    const { callId, waiterId, tableId } = data;
    
    io.to(`restaurant:${socket.restaurantId}`).emit('call-resolved', {
      callId,
      waiterId,
      tableId,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Call ${callId} resolved by waiter ${waiterId}`);
  });

  // Assign table to waiter
  socket.on('assign-table-to-waiter', (data) => {
    const { tableId, waiterId, tableNumber } = data;
    
    // Notify the assigned waiter
    io.to(`waiter:${waiterId}`).emit('table-assigned', {
      tableId,
      tableNumber,
      timestamp: new Date().toISOString(),
    });
    
    // Notify restaurant
    io.to(`restaurant:${socket.restaurantId}`).emit('table-assigned-to-waiter', {
      tableId,
      waiterId,
      tableNumber,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Table ${tableNumber} assigned to waiter ${waiterId}`);
  });

  // Release table from waiter
  socket.on('release-table', (data) => {
    const { tableId, waiterId, tableNumber } = data;
    
    io.to(`waiter:${waiterId}`).emit('table-released', {
      tableId,
      tableNumber,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`restaurant:${socket.restaurantId}`).emit('table-released-from-waiter', {
      tableId,
      waiterId,
      tableNumber,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Table ${tableNumber} released from waiter ${waiterId}`);
  });

  // Get waiter's assigned tables
  socket.on('get-waiter-tables', async (waiterId) => {
    try {
      const { Table } = require('../models');
      const tables = await Table.findAll({
        where: { current_waiter_id: waiterId, status: 'occupied' },
      });
      
      socket.emit('waiter-tables', { tables });
    } catch (error) {
      logger.error('Get waiter tables error:', error);
      socket.emit('waiter-error', { message: 'Failed to get assigned tables' });
    }
  });

  // Emit new order to waiter
  const emitNewOrderToWaiter = (waiterId, orderData) => {
    io.to(`waiter:${waiterId}`).emit('new-order-for-waiter', {
      ...orderData,
      timestamp: new Date().toISOString(),
    });
    logger.info(`New order emitted to waiter: ${waiterId}`);
  };

  // Emit order status to waiter
  const emitOrderStatusToWaiter = (waiterId, orderId, status) => {
    io.to(`waiter:${waiterId}`).emit('order-status-for-waiter', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Order ${orderId} status ${status} emitted to waiter: ${waiterId}`);
  };

  // Emit order ready to waiter
  const emitOrderReadyToWaiter = (waiterId, orderId, orderNumber, tableNumber) => {
    io.to(`waiter:${waiterId}`).emit('order-ready-for-serving', {
      orderId,
      orderNumber,
      tableNumber,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Order ${orderId} ready emitted to waiter: ${waiterId}`);
  };

  // Attach emit functions to socket
  socket.emitNewOrderToWaiter = emitNewOrderToWaiter;
  socket.emitOrderStatusToWaiter = emitOrderStatusToWaiter;
  socket.emitOrderReadyToWaiter = emitOrderReadyToWaiter;
};

module.exports = waiterSocket;
