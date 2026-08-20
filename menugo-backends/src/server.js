// Load environment early
require('dotenv').config();
const http = require('http');
const net = require('net');
const { Server } = require('socket.io');
const { logger } = require('./utils/logger');

const isProductionRuntime = String(process.env.NODE_ENV || '').toLowerCase() === 'production' || Boolean(process.env.RENDER);
const normalizeApiBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '').replace(/\/api$/i, '');

let currentPort = parseInt(process.env.PORT, 10) || 5000;
// Allow automatic schema alteration during local development for convenience.
// Keep destructive changes opt-in for non-development environments.
// Only enable automatic schema alteration when explicitly requested via env vars.
// This avoids unexpected ALTER operations (which can fail) during normal development boots.
const shouldAlterSchema =
  process.env.DB_SYNC_ALTER === 'true' ||
  process.env.SEQUELIZE_SYNC_ALTER === 'true';
let server;
let sequelize;
let isShuttingDown = false;

// Database connection
const startServer = async () => {
  try {
    // Require modules that are safe to load now and used below. We delay
    // requiring `app` until after the port probe so `process.env.API_URL`
    // is correct for Passport callback generation.
    // eslint-disable-next-line global-require
    const db = require('./models');
    sequelize = db.sequelize;
    // eslint-disable-next-line global-require
    const { initRedis } = require('./config/redis');
    // eslint-disable-next-line global-require
    const { initSocket } = require('./sockets');

    // Test database connection. If it fails we log a warning and continue
    // starting the server to make local development easier when DB isn't
    // available or uses incompatible auth. Feature flags or env vars can
    // re-enable strict behavior in CI/prod.
    let dbConnected = false;
    try {
      await sequelize.authenticate();
      dbConnected = true;
      logger.info('Database connected successfully');
    } catch (dbErr) {
      logger.warn('Database connection failed on startup (continuing without DB):', dbErr && dbErr.message ? dbErr.message : dbErr);
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
        // Provide DB-specific CREATE statements. MySQL-compatible statements
        // are used by default; SQLite and PostgreSQL use their own compatible
        // variants so startup does not try to run the wrong DDL dialect.
        const creates = [];
        if (dialect === 'sqlite') {
          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_orders (
              id SERIAL PRIMARY KEY,
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
            )`,
          );
        } else if (dialect === 'postgres') {
          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_orders (
              id SERIAL PRIMARY KEY,
              order_id UUID NOT NULL,
              restaurant_id UUID NOT NULL,
              order_number VARCHAR(50) NOT NULL,
              table_number VARCHAR(20) DEFAULT NULL,
              customer_name VARCHAR(100) DEFAULT 'Guest',
              waiter_id UUID NULL,
              waiter_name VARCHAR(100) NULL,
              status VARCHAR(255) CHECK (status IN ('pending','preparing','ready','completed','cancelled')) DEFAULT 'pending',
              station VARCHAR(50) DEFAULT 'all',
              priority VARCHAR(255) CHECK (priority IN ('low','normal','high','urgent')) DEFAULT 'normal',
              started_at TIMESTAMP NULL,
              ready_at TIMESTAMP NULL,
              completed_at TIMESTAMP NULL,
              estimated_time INT DEFAULT 0,
              notes TEXT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_order_items (
              id SERIAL PRIMARY KEY,
              kitchen_order_id INT NOT NULL,
              item_id UUID NOT NULL,
              item_name VARCHAR(200) NOT NULL,
              quantity INT NOT NULL DEFAULT 1,
              preparation_time INT DEFAULT 5,
              special_instructions TEXT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_order_item_modifiers (
              id SERIAL PRIMARY KEY,
              kitchen_order_item_id INT NOT NULL,
              modifier_name VARCHAR(100) NOT NULL,
              modifier_price DECIMAL(10, 2) DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_stations (
              id SERIAL PRIMARY KEY,
              restaurant_id UUID NOT NULL,
              name VARCHAR(100) NOT NULL,
              station_type VARCHAR(255) CHECK (station_type IN ('grill','pizza','salad','dessert','prep','expo','all')) NOT NULL,
              chef_id UUID NULL,
              is_active BOOLEAN DEFAULT TRUE,
              display_order INT DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_station_assignments (
              id SERIAL PRIMARY KEY,
              station_id INT NOT NULL,
              kitchen_order_id INT NOT NULL,
              started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              completed_at TIMESTAMP NULL
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_activity_logs (
              id SERIAL PRIMARY KEY,
              restaurant_id UUID NOT NULL,
              kitchen_order_id INT NULL,
              chef_id UUID NULL,
              action VARCHAR(50) NOT NULL,
              old_status VARCHAR(50) NULL,
              new_status VARCHAR(50) NULL,
              notes TEXT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_performance_metrics (
              id SERIAL PRIMARY KEY,
              restaurant_id UUID NOT NULL,
              date DATE NOT NULL,
              total_orders_completed INT DEFAULT 0,
              average_prep_time_minutes DECIMAL(10, 2) DEFAULT 0,
              average_wait_time_minutes DECIMAL(10, 2) DEFAULT 0,
              peak_hour_orders INT DEFAULT 0,
              cancelled_orders INT DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_inventory_alerts (
              id SERIAL PRIMARY KEY,
              restaurant_id UUID NOT NULL,
              item_id UUID NOT NULL,
              item_name VARCHAR(200) NOT NULL,
              current_stock DECIMAL(10, 2) NOT NULL,
              threshold_level DECIMAL(10, 2) NOT NULL,
              status VARCHAR(255) CHECK (status IN ('low','critical','out_of_stock')) DEFAULT 'low',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              resolved_at TIMESTAMP NULL
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS subscription_plans (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              tier VARCHAR(50) NOT NULL UNIQUE,
              description TEXT,
              price_monthly DECIMAL(10, 2) DEFAULT 0,
              price_yearly DECIMAL(10, 2) DEFAULT 0,
              features JSONB,
              limits JSONB,
              is_active BOOLEAN DEFAULT TRUE,
              stripe_price_monthly_id VARCHAR(255),
              stripe_price_yearly_id VARCHAR(255),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
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
            )`,
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
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_order_item_modifiers (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              kitchen_order_item_id INT NOT NULL,
              modifier_name VARCHAR(100) NOT NULL,
              modifier_price DECIMAL(10,2) DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
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
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS kitchen_station_assignments (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              station_id INT NOT NULL,
              kitchen_order_id INT NOT NULL,
              started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              completed_at DATETIME NULL
            )`,
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
            )`,
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
            )`,
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
            )`,
          );

          creates.push(
            `CREATE TABLE IF NOT EXISTS subscription_plans (
              id CHAR(36) NOT NULL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              tier VARCHAR(50) NOT NULL UNIQUE,
              description TEXT,
              price_monthly DECIMAL(10,2) DEFAULT 0,
              price_yearly DECIMAL(10,2) DEFAULT 0,
              features JSON,
              limits JSON,
              is_active BOOLEAN DEFAULT TRUE,
              stripe_price_monthly_id VARCHAR(255),
              stripe_price_yearly_id VARCHAR(255),
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
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

    // If we're running with SQLite in development, proactively run `sequelize.sync()`
    // to create any missing tables (non-destructive) so lightweight dev setups
    // without migrations don't fail on simple model.create() calls.
    try {
      const db = require('./config/database');
      const dialect = (db && db.sequelize && typeof db.sequelize.getDialect === 'function') ? db.sequelize.getDialect() : null;
      if (dialect === 'sqlite') {
        try {
          await db.sequelize.sync();
          logger.info('SQLite development DB synced: created missing tables');
        } catch (syncErr) {
          logger.warn('SQLite sync failed:', syncErr && syncErr.message ? syncErr.message : syncErr);
        }
      }
    } catch (e) {
      // ignore
    }

    try {
      const { ensureRestaurantSchema } = require('./utils/ensureRestaurantSchema');
      const schemaResult = await ensureRestaurantSchema();
      if (schemaResult && schemaResult.applied && schemaResult.applied.length) {
        logger.info(`Ensured restaurant columns on startup: ${schemaResult.applied.join(', ')}`);
      } else if (!schemaResult || schemaResult.skipped) {
        logger.info('Restaurant schema ensure skipped or table missing');
      }
    } catch (schemaEnsureErr) {
      logger.warn('Could not ensure restaurant columns on startup:', schemaEnsureErr && schemaEnsureErr.message ? schemaEnsureErr.message : schemaEnsureErr);
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

    // Probe for an available port before starting the HTTP server to avoid
    // noisy EADDRINUSE errors and ensure predictable fallback behavior.
    const findAvailablePort = async (startPort, maxAttempts = 20) => {
      let port = Number(startPort) || 5000;
      for (let i = 0; i < maxAttempts; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const ok = await new Promise((resolve) => {
          const tester = net.createServer()
            .once('error', (err) => {
              tester.close?.();
              resolve(false);
            })
            .once('listening', () => {
              tester.close(() => resolve(true));
            })
            .listen(port);
        });

        if (ok) {
          return port;
        }
        port += 1;
      }
      return null;
    };

    const requestedPort = Number.parseInt(process.env.PORT, 10) || currentPort;
    const preferredPort = Number.isFinite(requestedPort) && requestedPort > 0 ? requestedPort : currentPort;
    const portToUse = await findAvailablePort(preferredPort, 1);
    if (!portToUse) {
      logger.warn(`Preferred port ${preferredPort} is unavailable; falling back to the current port ${currentPort}`);
      currentPort = preferredPort;
    } else {
      currentPort = portToUse;
    }

    // Keep the public Render URL in production so Passport generates a usable
    // OAuth callback. Local development should continue to follow the port
    // selected above.
    if (isProductionRuntime) {
      const publicApiUrl = normalizeApiBaseUrl(process.env.API_URL || process.env.RENDER_EXTERNAL_URL);
      if (publicApiUrl) process.env.API_URL = publicApiUrl;
    } else {
      process.env.API_URL = `http://localhost:${currentPort}`;
    }
    // If GOOGLE_CALLBACK_URL wasn't explicitly set, derive it from API_URL
    if (!process.env.GOOGLE_CALLBACK_URL) {
      process.env.GOOGLE_CALLBACK_URL = `${process.env.API_URL}/api/auth/google/callback`;
    }

    // Now require app which may depend on process.env.API_URL (passport)
    // Delayed require avoids reading stale env values at module-init time.
    // eslint-disable-next-line global-require
    const app = require('./app');

    // Create HTTP server now that `app` is available
    server = http.createServer(app);

    // Socket.io setup
    const configuredOrigins = (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean) : []);
    const defaultOrigins = process.env.NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:5173']
      : ['http://localhost:3000'];
    const corsOrigins = [...new Set([...configuredOrigins, ...defaultOrigins])];
    const io = new Server(server, {
      cors: {
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST'],
        allowEIO3: true,
      },
      transports: ['websocket', 'polling'],
      path: process.env.SOCKET_PATH || '/socket.io',
      pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
      pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
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
        if (!isProductionRuntime && process.env.ALLOW_PORT_FALLBACK === 'true') {
          const maxAttemptsFallback = parseInt(process.env.PORT_FALLBACK_ATTEMPTS, 10) || 5;
          let attempts = 0;

          const tryNextPort = () => {
            if (attempts >= maxAttemptsFallback) {
              logger.error('Port fallback exhausted, exiting.');
              process.exit(1);
            }
            attempts += 1;
            currentPort += 1;
            process.env.API_URL = `http://localhost:${currentPort}`;
            if (!process.env.GOOGLE_CALLBACK_URL) {
              process.env.GOOGLE_CALLBACK_URL = `${process.env.API_URL}/api/auth/google/callback`;
            }
            logger.warn(`Attempting to listen on fallback port ${currentPort} (attempt ${attempts}/${maxAttemptsFallback})`);
            logger.info(`Updated API URL to ${process.env.API_URL} for fallback port`);
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

    // Start server on discovered available port
    server.listen(currentPort, () => {
      logger.info(`Server running on port ${currentPort}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: ${process.env.API_URL}`);
      // Write runtime API URL to a file so frontend dev server can pick it up
      try {
        // Write to repository root 'runtime_api_url.txt'
        // __dirname -> menugo-backends/src, go up two levels to repo root
        const fs = require('fs');
        const path = require('path');
        const outPath = path.resolve(__dirname, '..', '..', 'runtime_api_url.txt');
        fs.writeFileSync(outPath, process.env.API_URL, { encoding: 'utf8' });
        logger.info(`Wrote runtime API URL to ${outPath}`);
      } catch (writeErr) {
        logger.warn('Could not write runtime API URL file:', writeErr && writeErr.message ? writeErr.message : writeErr);
      }
      // If a static GOOGLE_CALLBACK_URL is configured and does not match
      // the runtime API URL, warn the developer so they can update the
      // registered redirect URI in Google Cloud Console or adjust .env.
      try {
        const configured = process.env.GOOGLE_CALLBACK_URL || null;
        const expected = `${process.env.API_URL}/api/auth/google/callback`;
        if (configured && configured !== expected) {
          logger.warn('GOOGLE_CALLBACK_URL differs from runtime API URL. Ensure the redirect URI registered in Google Cloud matches the callback used by this server.', { configured, expected });
        }
      } catch (e) {
        // ignore any inspection errors
      }
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

  const closeServer = () => {
    if (server && typeof server.close === 'function') {
      server.close(() => {
        logger.info('HTTP server closed');
        void shutdownDatabaseAndExit();
      });
      return;
    }

    logger.info('HTTP server was not initialized; skipping server close');
    void shutdownDatabaseAndExit();
  };

  const shutdownDatabaseAndExit = async () => {
    try {
      if (sequelize && typeof sequelize.close === 'function') {
        try {
          await sequelize.close();
          logger.info('Database connection closed');
        } catch (closeError) {
          logger.warn('Database shutdown warning:', closeError && closeError.message ? closeError.message : closeError);
        }
      } else {
        logger.info('No Sequelize instance available during shutdown');
      }
    } catch (shutdownError) {
      logger.warn('Unexpected shutdown error:', shutdownError && shutdownError.message ? shutdownError.message : shutdownError);
    } finally {
      try {
        process.exit(0);
      } catch (processExitError) {
        logger.warn('Process exit warning:', processExitError && processExitError.message ? processExitError.message : processExitError);
      }
    }
  };

  closeServer();
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
