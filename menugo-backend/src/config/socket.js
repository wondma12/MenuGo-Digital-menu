const { Server } = require('socket.io');
const { verifyToken } = require('../utils/helpers');
const { logger } = require('../utils/logger');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: process.env.SOCKET_PATH || '/socket.io',
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.restaurantId = decoded.restaurantId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user to their room
    socket.join(`user_${socket.userId}`);
    
    if (socket.restaurantId) {
      socket.join(`restaurant_${socket.restaurantId}`);
    }

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToRestaurant = (restaurantId, event, data) => {
  if (io) {
    io.to(`restaurant_${restaurantId}`).emit(event, data);
  }
};

const emitToWaiters = (restaurantId, event, data) => {
  if (io) {
    io.to(`restaurant_${restaurantId}`).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser, emitToRestaurant, emitToWaiters };