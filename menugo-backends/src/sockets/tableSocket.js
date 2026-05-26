const { logger } = require('../utils/logger');
const { TABLE_STATUS } = require('../utils/constants');

const tableSocket = (io, socket) => {
  // Join table room
  socket.on('join-table', (tableId) => {
    socket.join(`table:${tableId}`);
    logger.info(`Socket ${socket.id} joined table room: ${tableId}`);
  });

  // Leave table room
  socket.on('leave-table', (tableId) => {
    socket.leave(`table:${tableId}`);
    logger.info(`Socket ${socket.id} left table room: ${tableId}`);
  });

  // Update table status
  socket.on('update-table-status', async (data) => {
    const { tableId, status, customerName, orderId } = data;
    
    try {
      const { Table } = require('../models');
      await Table.update(
        {
          status,
          current_customer_name: customerName || null,
          current_order_id: orderId || null,
          occupied_since: status === TABLE_STATUS.OCCUPIED ? new Date() : null,
          updated_at: new Date(),
        },
        { where: { id: tableId } },
      );
      
      // Emit to table room
      io.to(`table:${tableId}`).emit('table-status-updated', {
        tableId,
        status,
        timestamp: new Date().toISOString(),
      });
      
      // Emit to restaurant
      io.to(`restaurant:${socket.restaurantId}`).emit('table-status-changed', {
        tableId,
        status,
        timestamp: new Date().toISOString(),
      });
      
      logger.info(`Table ${tableId} status updated to ${status}`);
    } catch (error) {
      logger.error('Update table status error:', error);
      socket.emit('table-error', { message: 'Failed to update table status' });
    }
  });

  // Reserve table
  socket.on('reserve-table', (data) => {
    const { tableId, reservationId, customerName, partySize, reservationTime } = data;
    
    io.to(`table:${tableId}`).emit('table-reserved', {
      tableId,
      reservationId,
      customerName,
      partySize,
      reservationTime,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`restaurant:${socket.restaurantId}`).emit('table-reserved', {
      tableId,
      reservationId,
      customerName,
      partySize,
      reservationTime,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Table ${tableId} reserved for ${customerName}`);
  });

  // Cancel table reservation
  socket.on('cancel-reservation', (data) => {
    const { tableId, reservationId } = data;
    
    io.to(`table:${tableId}`).emit('reservation-cancelled', {
      tableId,
      reservationId,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`restaurant:${socket.restaurantId}`).emit('reservation-cancelled', {
      tableId,
      reservationId,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Reservation ${reservationId} for table ${tableId} cancelled`);
  });

  // Complete table reservation (customer seated)
  socket.on('complete-reservation', (data) => {
    const { tableId, reservationId, customerName } = data;
    
    io.to(`table:${tableId}`).emit('reservation-completed', {
      tableId,
      reservationId,
      customerName,
      timestamp: new Date().toISOString(),
    });
    
    io.to(`restaurant:${socket.restaurantId}`).emit('reservation-completed', {
      tableId,
      reservationId,
      customerName,
      timestamp: new Date().toISOString(),
    });
    
    logger.info(`Reservation ${reservationId} for table ${tableId} completed (customer seated)`);
  });

  // Emit table layout update
  const emitTableLayoutUpdate = (restaurantId, tables) => {
    io.to(`restaurant:${restaurantId}`).emit('table-layout-updated', {
      tables,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Table layout updated for restaurant: ${restaurantId}`);
  };

  // Emit single table update
  const emitTableUpdate = (restaurantId, tableData) => {
    io.to(`restaurant:${restaurantId}`).emit('table-updated', {
      ...tableData,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Table ${tableData.tableId} updated for restaurant: ${restaurantId}`);
  };

  // Emit table occupancy change
  const emitTableOccupancyChange = (restaurantId, tableId, status, customerName) => {
    io.to(`restaurant:${restaurantId}`).emit('table-occupancy-changed', {
      tableId,
      status,
      customerName,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Table ${tableId} occupancy changed to ${status}`);
  };

  // Handle request for table info
  socket.on('get-table-info', async (tableId) => {
    try {
      const { Table, Order } = require('../models');
      const table = await Table.findByPk(tableId, {
        include: [{ model: Order, as: 'current_order' }],
      });
      
      socket.emit('table-info', { table });
    } catch (error) {
      logger.error('Get table info error:', error);
      socket.emit('table-error', { message: 'Failed to get table information' });
    }
  });

  // Attach emit functions to socket
  socket.emitTableLayoutUpdate = emitTableLayoutUpdate;
  socket.emitTableUpdate = emitTableUpdate;
  socket.emitTableOccupancyChange = emitTableOccupancyChange;
};

module.exports = tableSocket;
