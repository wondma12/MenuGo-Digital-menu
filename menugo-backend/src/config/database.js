const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const shouldLogSql =
  process.env.ENABLE_SQL_LOGS === 'true' ||
  process.env.DB_LOGGING === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
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
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_MAX) || 10,
  queueLimit: 0,
  // set named placeholer behavior consistent with mysql2 default
});

// Export both Sequelize instance and a minimal db-like object with execute/getConnection/query
module.exports = {
  sequelize,
  // provide the commonly used methods preserving `this` binding
  execute: pool.execute.bind(pool),
  query: pool.query.bind(pool),
  getConnection: pool.getConnection.bind(pool),
  // also expose the underlying pool in case callers need it
  pool,
};
