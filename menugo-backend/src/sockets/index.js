const orderSocket = require('./orderSocket');
const notificationSocket = require('./notificationSocket');
const waiterSocket = require('./waiterSocket');
const tableSocket = require('./tableSocket');
const analyticsSocket = require('./analyticsSocket');
const { logger } = require('../utils/logger');

// Initialize all socket handlers
const initSocket = (io) => {
  logger.info('Initializing Socket.io handlers...');

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const { verifyToken } = require('../utils/helpers');
      const decoded = verifyToken(token);
      
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.restaurantId = decoded.restaurantId;
      socket.waiterId = decoded.waiterId;
      
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} - User: ${socket.userId} (${socket.userRole})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    
    if (socket.restaurantId) {
      socket.join(`restaurant:${socket.restaurantId}`);
    }
    
    if (socket.waiterId) {
      socket.join(`waiter:${socket.waiterId}`);
    }

    // Initialize specific socket handlers
    orderSocket(io, socket);
    notificationSocket(io, socket);
    waiterSocket(io, socket);
    tableSocket(io, socket);
    analyticsSocket(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id} - User: ${socket.userId}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

// Emit helpers
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

const emitToRestaurant = (io, restaurantId, event, data) => {
  io.to(`restaurant:${restaurantId}`).emit(event, data);
};

const emitToWaiter = (io, waiterId, event, data) => {
  io.to(`waiter:${waiterId}`).emit(event, data);
};

const emitToRoom = (io, room, event, data) => {
  io.to(room).emit(event, data);
};

const broadcastToAll = (io, event, data) => {
  io.emit(event, data);
};

module.exports = {
  initSocket,
  emitToUser,
  emitToRestaurant,
  emitToWaiter,
  emitToRoom,
  broadcastToAll,
};
