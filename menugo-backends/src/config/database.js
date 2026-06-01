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

const shouldLogSql =
  process.env.ENABLE_SQL_LOGS === 'true' ||
  process.env.DB_LOGGING === 'true';

const isDev = process.env.NODE_ENV !== 'production';
const useSqliteFallback = isDev && process.env.SQLITE_DEV_FALLBACK === 'true';

let sequelize;
let pool = null;
let usingSqlite = false;

if (useSqliteFallback) {
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
} else {
  // MySQL configuration (use mysql2 driver)
  const mysql = require('mysql2/promise');

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      dialectModule: require('mysql2'),
      // eslint-disable-next-line no-console
      logging: shouldLogSql ? console.log : false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 0,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      },
      dialectOptions: {
        connectTimeout: 60000,
      },
      timezone: '+00:00',
    },
  );

  // Create a mysql2 promise pool for raw queries used by some modules (db.execute/getConnection)
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_MAX) || 10,
    queueLimit: 0,
  });
}

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
  };
} else {
  module.exports = {
    sequelize,
    Sequelize,
    execute: pool.execute.bind(pool),
    query: pool.query.bind(pool),
    getConnection: pool.getConnection.bind(pool),
    pool,
  };
}
