// Load full sequelize package to provide compatibility shims for older versions
const SequelizePkg = require('sequelize');
const { Sequelize } = SequelizePkg;
// Provide a minimal `Op` compatibility map for older Sequelize (<4) which
// used string-based operators. Newer code expects `Sequelize.Op` with
// symbols like Op.in / Op.gte. If running an older Sequelize, expose a
// mapping so controllers using `{ Op } = require('sequelize')` work.
if (!SequelizePkg.Op) {
  SequelizePkg.Op = {
    in: '$in',
    or: '$or',
    and: '$and',
    like: '$like',
    iLike: '$like',
    gte: '$gte',
    lte: '$lte',
    ne: '$ne',
    between: '$between',
    notBetween: '$notBetween',
    regexp: '$regexp',
  };
}
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { URL } = require('url');

const shouldLogSql =
  process.env.ENABLE_SQL_LOGS === 'true' ||
  process.env.DB_LOGGING === 'true';

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    const dialect = url.protocol.startsWith('postgres') ? 'postgres' : url.protocol.startsWith('mysql') ? 'mysql' : null;
    const config = {
      dialect,
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : dialect === 'postgres' ? 5432 : 3306,
      user: url.username || process.env.DB_USER,
      password: url.password || process.env.DB_PASSWORD,
      database: url.pathname ? url.pathname.slice(1) : process.env.DB_NAME,
      ssl: url.searchParams.get('sslmode') === 'require' || process.env.DB_SSL === 'true',
      channelBinding: url.searchParams.get('channel_binding') || process.env.DB_CHANNEL_BINDING,
      dialectFromUrl: dialect,
    };
    return config;
  }

  return {
    dialect: (process.env.DB_DIALECT || 'mysql').toLowerCase(),
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true',
    channelBinding: process.env.DB_CHANNEL_BINDING,
  };
};

const isDev = process.env.NODE_ENV !== 'production';
const isProductionLike = ['production', 'test'].includes(String(process.env.NODE_ENV || '').toLowerCase()) || Boolean(process.env.RENDER);
const explicitSqliteDialect = String(process.env.DB_DIALECT || '').toLowerCase() === 'sqlite';
let useSqliteFallback = false;

if (isDev && !isProductionLike && (process.env.SQLITE_DEV_FALLBACK === 'true' || explicitSqliteDialect)) {
  try {
    require('sqlite3');
    useSqliteFallback = true;
  } catch (error) {
    console.warn('[DB] SQLite fallback unavailable, using MySQL instead:', error && error.message ? error.message : error);
  }
}

let sequelize;
let pool = null;
let callbackPool = null;
let usingSqlite = false;
let getPromiseConnection = null;

const patchSequelizeShutdown = (sequelizeInstance) => {
  if (!sequelizeInstance || !sequelizeInstance.connectionManager) {
    return;
  }

  const connectionManager = sequelizeInstance.connectionManager;
  if (connectionManager.__menuGoSafeDisconnectPatched) {
    return;
  }

  const originalDisconnect = connectionManager.disconnect && connectionManager.disconnect.bind(connectionManager);
  connectionManager.disconnect = function disconnectSafe(connection) {
    try {
      if (!connection || !connection._protocol || typeof connection._protocol !== 'object') {
        return Promise.resolve();
      }

      if (connection._protocol._ended) {
        return Promise.resolve();
      }

      if (typeof connection.end !== 'function') {
        return Promise.resolve();
      }

      if (typeof originalDisconnect === 'function') {
        return originalDisconnect(connection);
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  };

  connectionManager.__menuGoSafeDisconnectPatched = true;
};

if (useSqliteFallback) {
  try {
    // ensure tmp directory exists
    const storageDir = path.join(__dirname, '..', '..', 'tmp');
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

    const storagePath = path.join(storageDir, 'menugo-dev.sqlite');

    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: storagePath,
      // eslint-disable-next-line no-console
      logging: shouldLogSql ? console.log : false,
    });

    usingSqlite = true;
  } catch (error) {
    console.warn('[DB] SQLite fallback failed, using MySQL instead:', error && error.message ? error.message : error);
    useSqliteFallback = false;
  }
}

if (!useSqliteFallback) {
  const dbConfig = getDatabaseConfig();
  const dialect = dbConfig.dialect || 'mysql';
  const dbPort = dbConfig.port || (dialect === 'postgres' ? 5432 : 3306);
  const useSsl = Boolean(dbConfig.ssl);

  const poolConfig = {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
  };

  if (dialect === 'postgres') {
    const { Pool } = require('pg');
    const pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || undefined,
      host: dbConfig.host,
      port: dbPort,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      max: poolConfig.max,
      idleTimeoutMillis: poolConfig.idle,
      connectionTimeoutMillis: poolConfig.acquire,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.user,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbPort,
        dialect: 'postgres',
        dialectModule: require('pg'),
        dialectModulePath: require.resolve('pg'),
        // eslint-disable-next-line no-console
        logging: shouldLogSql ? console.log : false,
        pool: poolConfig,
        dialectOptions: {
          ssl: useSsl ? { rejectUnauthorized: false } : false,
        },
        timezone: '+00:00',
      }
    );

    pool = {
      query: pgPool.query.bind(pgPool),
      execute: pgPool.query.bind(pgPool),
    };

    getPromiseConnection = async () => {
      const client = await pgPool.connect();
      return {
        query: client.query.bind(client),
        execute: client.query.bind(client),
        release: client.release.bind(client),
      };
    };

    const originalAuthenticate = sequelize.authenticate && sequelize.authenticate.bind(sequelize);
    sequelize.authenticate = async function () {
      if (pool && typeof pool.query === 'function') {
        await pool.query('SELECT 1');
        return true;
      }
      if (originalAuthenticate) {
        return originalAuthenticate();
      }
      return Promise.resolve(true);
    };
  } else {
    // MySQL configuration (use mysql2 callback-style driver)
    const mysqlNative = require('mysql2');
    const mysqlAuthPlugins = {
      caching_sha2_password: mysqlNative.authPlugins.caching_sha2_password({}),
      mysql_clear_password: mysqlNative.authPlugins.mysql_clear_password({}),
      sha256_password: mysqlNative.authPlugins.sha256_password({}),
      mysql_native_password: mysqlNative.authPlugins.mysql_native_password({}),
    };

    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: dbPort,
        dialect: 'mysql',
        dialectModule: mysqlNative,
        dialectModulePath: require.resolve('mysql2'),
        // eslint-disable-next-line no-console
        logging: shouldLogSql ? console.log : false,
        pool: poolConfig,
        dialectOptions: {
          connectTimeout: 60000,
          authPlugins: mysqlAuthPlugins,
          // Some managed MySQL services require TLS/SSL or present self-signed
          // certificates. Allow enabling SSL via the DB_SSL env var. When true,
          // we use a permissive `rejectUnauthorized: false` to accept provider
          // certificates in development; set to strict in production if needed.
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        },
        timezone: '+00:00',
      }
    );

    // Create a mysql2 callback-style pool and a promise-based wrapper.
    // Use the callback pool for Sequelize and raw query convenience.
    callbackPool = mysqlNative.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: dbPort,
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_MAX) || 10,
      queueLimit: 0,
      authPlugins: mysqlAuthPlugins,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    // Promise-based pool used by higher-level code
    pool = callbackPool.promise();

    // If Sequelize's internal connection manager cannot authenticate using the
    // older mysql driver, fallback to using the mysql2 pool for obtaining
    // connections. This wraps getConnection/connect calls to gracefully fall
    // back to the tested mysql2 pool so model queries continue to work.
    try {
      const cm = sequelize.connectionManager;
      if (cm) {
        if (typeof cm.getConnection === 'function') {
          const origGetConnection = cm.getConnection.bind(cm);
          cm.getConnection = function (...args) {
            return origGetConnection(...args).catch(() => {
              return new Promise((resolve, reject) => {
                callbackPool.getConnection((err, conn) => {
                  if (err) return reject(err);
                  resolve(conn);
                });
              });
            });
          };
        }

        if (typeof cm.releaseConnection === 'function') {
          const origRelease = cm.releaseConnection.bind(cm);
          cm.releaseConnection = function (connection) {
            if (connection && typeof connection.release === 'function') {
              try { connection.release(); } catch (e) { /* ignore */ }
              return Promise.resolve();
            }
            return origRelease(connection);
          };
        }
      }
    } catch (e) {
      // best-effort only
    }

    // Wrap callback-style pool connections with a promise-enabled interface
    getPromiseConnection = async () => {
      return await new Promise((resolve, reject) => {
        callbackPool.getConnection((err, conn) => {
          if (err) return reject(err);
          if (conn && typeof conn.promise === 'function') {
            const promiseConn = conn.promise();
            promiseConn.release = conn.release.bind(conn);
            resolve(promiseConn);
          } else {
            resolve(conn);
          }
        });
      });
    };

    // Monkey-patch sequelize.authenticate to attempt a connection via the
    // mysql2 pool when the underlying Sequelize version doesn't support
    // modern mysql2 auth options. This allows the app's startup DB health
    // check to succeed using the tested mysql2 driver even if sequelize's
    // internal auth path fails with ER_NOT_SUPPORTED_AUTH_MODE.
    const originalAuthenticate = sequelize.authenticate && sequelize.authenticate.bind(sequelize);
    sequelize.authenticate = async function () {
      // Prefer using the mysql2 promise wrapper to validate connectivity/auth
      if (pool && typeof pool.execute === 'function') {
        // run a lightweight probe
        await pool.execute('SELECT 1');
        return true;
      }
      // Fallback to original authenticate if available
      if (originalAuthenticate) {
        return originalAuthenticate();
      }
      return Promise.resolve(true);
    };
  }
}

patchSequelizeShutdown(sequelize);

// Export both Sequelize instance and a minimal db-like object with execute/getConnection/query
if (usingSqlite) {
  module.exports = {
    sequelize,
    Sequelize,
    // mimic pool.execute/query using sequelize.query
    execute: async (sql, params) => {
      return sequelize.query(sql, { replacements: params });
    },
    query: async (sql, params) => {
      return sequelize.query(sql, { replacements: params });
    },
    getConnection: async () => ({ // minimal compatible shape for callers expecting a connection
      query: async (sql, params) => sequelize.query(sql, { replacements: params }),
      release: async () => {},
    }),
    pool: null,
    callbackPool,
  };
} else {
  module.exports = {
    sequelize,
    Sequelize,
    execute: pool.execute ? pool.execute.bind(pool) : pool.query.bind(pool),
    query: pool.query ? pool.query.bind(pool) : pool.execute.bind(pool),
    getConnection: async () => {
      return await getPromiseConnection();
    },
    pool,
    callbackPool,
  };
}
