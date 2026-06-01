// Load environment early
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize } = require('./models');
const { initRedis } = require('./config/redis');
const { initSocket } = require('./sockets');
const { logger } = require('./utils/logger');

let currentPort = parseInt(process.env.PORT, 10) || 5000;
// Allow automatic schema alteration during local development for convenience.
// Keep destructive changes opt-in for non-development environments.
// Only enable automatic schema alteration when explicitly requested via env vars.
// This avoids unexpected ALTER operations (which can fail) during normal development boots.
let shouldAlterSchema =
  process.env.DB_SYNC_ALTER === 'true' ||
  process.env.SEQUELIZE_SYNC_ALTER === 'true';
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
    // Test database connection. If it fails we log a warning and continue
    // starting the server to make local development easier when DB isn't
    // available or uses incompatible auth. Feature flags or env vars can
    // re-enable strict behavior in CI/prod.
    let dbConnected = false
    try {
      await sequelize.authenticate();
      dbConnected = true
      logger.info('Database connected successfully');
    } catch (dbErr) {
      logger.warn('Database connection failed on startup (continuing without DB):', dbErr && dbErr.message ? dbErr.message : dbErr)
    }

    // Ensure kitchen-related tables exist to avoid runtime errors when migrations
    // haven't been applied. These are non-destructive CREATE TABLE IF NOT EXISTS
    // statements and intentionally avoid strict FOREIGN KEY constraints so they
    // can be created even if referenced tables are not present in some dev setups.
    if (dbConnected) {
      try {
        const db = require('./config/database');
        const dialect = (db && db.sequelize && typeof db.sequelize.getDialect === 'function') ? db.sequelize.getDialect() : null;

        // Provide DB-specific CREATE statements. MySQL-compatible statements
        // are used by default; when running SQLite (dev fallback) use a
        // compatible variant to avoid syntax errors like AUTOINCREMENT/ENUM.
        const creates = [];
        if (dialect === 'sqlite') {
          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_orders (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              order_id TEXT NOT NULL,
              restaurant_id TEXT NOT NULL,
              order_number TEXT NOT NULL,
              table_number TEXT DEFAULT NULL,
              customer_name TEXT DEFAULT 'Guest',
              waiter_id TEXT NULL,
              waiter_name TEXT NULL,
              status TEXT DEFAULT 'pending',
              station TEXT DEFAULT 'all',
              priority TEXT DEFAULT 'normal',
              started_at DATETIME NULL,
              ready_at DATETIME NULL,
              completed_at DATETIME NULL,
              estimated_time INTEGER DEFAULT 0,
              notes TEXT NULL,
              created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
              updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_order_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              kitchen_order_id INTEGER NOT NULL,
              item_id TEXT NOT NULL,
              item_name TEXT NOT NULL,
              quantity INTEGER NOT NULL DEFAULT 1,
              preparation_time INTEGER DEFAULT 5,
              special_instructions TEXT NULL,
              created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_order_item_modifiers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              kitchen_order_item_id INTEGER NOT NULL,
              modifier_name TEXT NOT NULL,
              modifier_price REAL DEFAULT 0,
              created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_stations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              restaurant_id TEXT NOT NULL,
              name TEXT NOT NULL,
              station_type TEXT NOT NULL,
              chef_id TEXT NULL,
              is_active INTEGER DEFAULT 1,
              display_order INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_station_assignments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              station_id INTEGER NOT NULL,
              kitchen_order_id INTEGER NOT NULL,
              started_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
              completed_at DATETIME NULL
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_activity_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              restaurant_id TEXT NOT NULL,
              kitchen_order_id INTEGER NULL,
              chef_id TEXT NULL,
              action TEXT NOT NULL,
              old_status TEXT NULL,
              new_status TEXT NULL,
              notes TEXT NULL,
              created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_performance_metrics (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              restaurant_id TEXT NOT NULL,
              date DATE NOT NULL,
              total_orders_completed INTEGER DEFAULT 0,
              average_prep_time_minutes REAL DEFAULT 0,
              average_wait_time_minutes REAL DEFAULT 0,
              peak_hour_orders INTEGER DEFAULT 0,
              cancelled_orders INTEGER DEFAULT 0,
              created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_inventory_alerts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              restaurant_id TEXT NOT NULL,
              item_id TEXT NOT NULL,
              item_name TEXT NOT NULL,
              current_stock REAL NOT NULL,
              threshold_level REAL NOT NULL,
              status TEXT DEFAULT 'low',
              created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
              resolved_at DATETIME NULL
            )`
          );
        } else {
          // MySQL-compatible statements (existing behavior)
          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_orders (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              order_id CHAR(36) NOT NULL,
              restaurant_id CHAR(36) NOT NULL,
              order_number VARCHAR(50) NOT NULL,
              table_number VARCHAR(20) DEFAULT NULL,
              customer_name VARCHAR(100) DEFAULT 'Guest',
              waiter_id CHAR(36) NULL,
              waiter_name VARCHAR(100) NULL,
              status ENUM('pending','preparing','ready','completed','cancelled') DEFAULT 'pending',
              station VARCHAR(50) DEFAULT 'all',
              priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
              started_at DATETIME NULL,
              ready_at DATETIME NULL,
              completed_at DATETIME NULL,
              estimated_time INT DEFAULT 0,
              notes TEXT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_order_items (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              kitchen_order_id INT NOT NULL,
              item_id CHAR(36) NOT NULL,
              item_name VARCHAR(200) NOT NULL,
              quantity INT NOT NULL DEFAULT 1,
              preparation_time INT DEFAULT 5,
              special_instructions TEXT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_order_item_modifiers (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              kitchen_order_item_id INT NOT NULL,
              modifier_name VARCHAR(100) NOT NULL,
              modifier_price DECIMAL(10,2) DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_stations (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              restaurant_id CHAR(36) NOT NULL,
              name VARCHAR(100) NOT NULL,
              station_type ENUM('grill','pizza','salad','dessert','prep','expo','all') NOT NULL,
              chef_id CHAR(36) NULL,
              is_active BOOLEAN DEFAULT TRUE,
              display_order INT DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_station_assignments (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              station_id INT NOT NULL,
              kitchen_order_id INT NOT NULL,
              started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              completed_at DATETIME NULL
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_activity_logs (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              restaurant_id CHAR(36) NOT NULL,
              kitchen_order_id INT NULL,
              chef_id CHAR(36) NULL,
              action VARCHAR(50) NOT NULL,
              old_status VARCHAR(50) NULL,
              new_status VARCHAR(50) NULL,
              notes TEXT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_performance_metrics (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              restaurant_id CHAR(36) NOT NULL,
              date DATE NOT NULL,
              total_orders_completed INT DEFAULT 0,
              average_prep_time_minutes DECIMAL(10,2) DEFAULT 0,
              average_wait_time_minutes DECIMAL(10,2) DEFAULT 0,
              peak_hour_orders INT DEFAULT 0,
              cancelled_orders INT DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_inventory_alerts (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              restaurant_id CHAR(36) NOT NULL,
              item_id CHAR(36) NOT NULL,
              item_name VARCHAR(200) NOT NULL,
              current_stock DECIMAL(10,2) NOT NULL,
              threshold_level DECIMAL(10,2) NOT NULL,
              status ENUM('low','critical','out_of_stock') DEFAULT 'low',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              resolved_at DATETIME NULL
            )`
          );
        }

        for (const stmt of creates) {
          try {
            await db.execute(stmt);
          } catch (errStmt) {
            // Log individual statement errors but continue; some dev DBs
            // might not support certain types or enums. We'll warn with detail.
            logger.warn('Could not run ensure-statement for kitchen table:', errStmt && errStmt.message ? errStmt.message : errStmt);
          }
        }
        logger.info('Ensured kitchen-related tables exist (CREATE TABLE IF NOT EXISTS individual statements).');
      } catch (ensureError) {
        logger.warn('Could not ensure kitchen tables on startup:', ensureError && ensureError.message ? ensureError.message : ensureError);
      }
    } else {
      logger.info('Skipping DB table ensures because database is not connected');
    }

    // Keep destructive schema alteration opt-in to avoid long dev boots and port collisions.
    if (shouldAlterSchema && dbConnected) {
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
      // Ensure process.env.API_URL reflects actual listening port so generated URLs (local uploads) are correct
      process.env.API_URL = `http://localhost:${currentPort}`;
      logger.info(`API URL: ${process.env.API_URL}`);
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
