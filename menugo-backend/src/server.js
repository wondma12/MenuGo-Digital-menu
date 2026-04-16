const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize } = require('./models');
const { initRedis } = require('./config/redis');
const { initSocket } = require('./sockets');
const { logger } = require('./utils/logger');

let currentPort = parseInt(process.env.PORT, 10) || 5000;
const shouldAlterSchema =
  process.env.DB_SYNC_ALTER === 'true' || process.env.SEQUELIZE_SYNC_ALTER === 'true';
const server = http.createServer(app);
let isShuttingDown = false;

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  },
  path: process.env.SOCKET_PATH || '/socket.io',
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000
});

// Initialize socket handlers
initSocket(io);

// Handle server errors such as EADDRINUSE so they don't surface as uncaught exceptions
server.on('error', (err) => {
  if (!err) {
    return;
}
  if (err.code === 'EADDRINUSE') {
    logger.error(`EADDRINUSE: Port ${currentPort} is already in use. Another process is bound to this port.`);

    // Optional fallback: try next ports when ALLOW_PORT_FALLBACK=true
    if (process.env.ALLOW_PORT_FALLBACK === 'true') {
      const maxAttempts = parseInt(process.env.PORT_FALLBACK_ATTEMPTS, 10) || 5;
      let attempts = 0;

      const tryNextPort = () => {
        if (attempts >= maxAttempts) {
          logger.error('Port fallback exhausted, exiting.');
          process.exit(1);
        }
        attempts += 1;
        currentPort += 1;
        logger.warn(`Attempting to listen on fallback port ${currentPort} (attempt ${attempts}/${maxAttempts})`);
        server.listen(currentPort);
      };

      tryNextPort();
      return;
    }

    logger.error('Hint: stop the other process or set a different PORT in your environment (.env).');
    process.exit(1);
  }

  // For other server errors, log and allow the existing uncaughtException handler to manage shutdown
  logger.error('Server error:', err);
});

// Database connection
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    // Keep destructive schema alteration opt-in to avoid long dev boots and port collisions.
    if (shouldAlterSchema) {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    } else {
      logger.info('Skipping sequelize sync on startup');
    }

    // Initialize Redis
    await initRedis();

    // Start server
    server.listen(currentPort, () => {
      logger.info(`Server running on port ${currentPort}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: ${process.env.API_URL || `http://localhost:${currentPort}`}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  if (isShuttingDown) {
    return;

  }
  isShuttingDown = true;

  logger.info('Received shutdown signal, closing server...');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await sequelize.close();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  gracefulShutdown();
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

startServer();
