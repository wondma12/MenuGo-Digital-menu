const orderSocket = require('./orderSocket');
const notificationSocket = require('./notificationSocket');
const waiterSocket = require('./waiterSocket');
const tableSocket = require('./tableSocket');
const analyticsSocket = require('./analyticsSocket');
const kitchenSocket = require('./kitchenSocket');
const { logger } = require('../utils/logger');

let socketIO = null;

// Initialize all socket handlers
const initSocket = (io) => {
  socketIO = io;
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

      // Try to infer restaurant/waiter association from decoded token if present
      socket.restaurantId = decoded.restaurantId || null;
      socket.waiterId = decoded.waiterId || null;

      // If token doesn't carry restaurant or waiter info, query DB associations
      if (!socket.restaurantId || !socket.waiterId) {
        try {
          const { RestaurantStaff, Waiter } = require('../models');

          if (!socket.restaurantId) {
            const staff = await RestaurantStaff.findOne({ where: { user_id: socket.userId, is_active: true } }).catch(() => null);
            if (staff) socket.restaurantId = staff.restaurant_id;
          }

          if (!socket.waiterId) {
            const waiter = await Waiter.findOne({ where: { user_id: socket.userId } }).catch(() => null);
            if (waiter) {
              socket.waiterId = waiter.id;
              if (!socket.restaurantId) socket.restaurantId = waiter.restaurant_id;
            }
          }
        } catch (e) {
          // swallow DB lookup errors to avoid blocking socket connection
        }
      }

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });
  // Initialize kitchen namespace and handlers once (not per-connection)
  try {
    kitchenSocket(io);
  } catch (e) {
    logger.warn('Failed to initialize kitchen namespace', e);
  }

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

    // Allow clients to explicitly join/leave the kitchen room from root namespace
    socket.on('join-kitchen', async (restaurantId) => {
      try {
        socket.join(`kitchen:${restaurantId}`);
        socket.join(`restaurant:${restaurantId}`);
        const KitchenService = require('../services/kitchenService');
        const stats = await KitchenService.getRealtimeStats(restaurantId).catch(() => null);
        socket.emit('initial-stats', stats);
        logger.info(`Socket ${socket.id} joined kitchen:${restaurantId}`);
      } catch (e) {
        logger.warn('join-kitchen error', e);
      }
    });

    socket.on('leave-kitchen', (restaurantId) => {
      try {
        socket.leave(`kitchen:${restaurantId}`);
        socket.leave(`restaurant:${restaurantId}`);
        logger.info(`Socket ${socket.id} left kitchen:${restaurantId}`);
      } catch (e) {
        logger.warn('leave-kitchen error', e);
      }
    });

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

// Emit helpers (use module-scoped socketIO once initialized)
const ensureIO = () => {
  if (!socketIO) throw new Error('Socket.io not initialized');
  return socketIO;
};

const emitToUser = (userId, event, data) => {
  const io = ensureIO();
  io.to(`user:${userId}`).emit(event, data);
};

const emitToRestaurant = (restaurantId, event, data) => {
  const io = ensureIO();
  io.to(`restaurant:${restaurantId}`).emit(event, data);
};

const emitToWaiter = (waiterId, event, data) => {
  const io = ensureIO();
  io.to(`waiter:${waiterId}`).emit(event, data);
};

const emitToRoom = (room, event, data) => {
  const io = ensureIO();
  io.to(room).emit(event, data);
};

const broadcastToAll = (event, data) => {
  const io = ensureIO();
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
