const { Sequelize } = require('sequelize');
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

module.exports = { sequelize };
