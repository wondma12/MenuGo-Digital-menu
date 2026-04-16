const { Server } = require('socket.io');
const { verifyToken } = require('../utils/helpers');
const { logger } = require('../utils/logger');

let io = null;

// Initialize socket.io
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
      socket.waiterId = decoded.waiterId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their room
    socket.join(`user_${socket.userId}`);
    
    if (socket.restaurantId) {
      socket.join(`restaurant_${socket.restaurantId}`);
    }
    
    if (socket.waiterId) {
      socket.join(`waiter_${socket.waiterId}`);
    }

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });

    // Join waiter room
    socket.on('join-waiter', (waiterId) => {
      socket.join(`waiter_${waiterId}`);
    });

    // Join restaurant room
    socket.on('join-restaurant', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
    });

    // Leave room
    socket.on('leave-room', (room) => {
      socket.leave(room);
    });
  });

  return io;
};

// Get socket.io instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Emit to restaurant
const emitToRestaurant = (restaurantId, event, data) => {
  if (io) {
    io.to(`restaurant_${restaurantId}`).emit(event, data);
  }
};

// Emit to waiter
const emitToWaiter = (waiterId, event, data) => {
  if (io) {
    io.to(`waiter_${waiterId}`).emit(event, data);
  }
};

// Emit new order
const emitNewOrder = (restaurantId, orderData) => {
  emitToRestaurant(restaurantId, 'new_order', orderData);
};

// Emit order status update
const emitOrderStatusUpdate = (restaurantId, orderId, status) => {
  emitToRestaurant(restaurantId, 'order_status_updated', { orderId, status });
};

// Emit table status update
const emitTableStatusUpdate = (restaurantId, tableId, status) => {
  emitToRestaurant(restaurantId, 'table_status_updated', { tableId, status });
};

// Emit waiter notification
const emitWaiterNotification = (waiterId, notification) => {
  emitToWaiter(waiterId, 'notification', notification);
};

// Broadcast to all connected clients
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRestaurant,
  emitToWaiter,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitTableStatusUpdate,
  emitWaiterNotification,
  broadcast,
};