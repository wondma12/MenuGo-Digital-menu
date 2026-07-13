const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2');
console.log('authPlugins keys', Object.keys(mysql.authPlugins || {}));
console.log('authPlugins caching_sha2_password', typeof mysql.authPlugins.caching_sha2_password);
console.log('authPlugins mysql_native_password', typeof mysql.authPlugins.mysql_native_password);
console.log('authPlugins mysql_clear_password', typeof mysql.authPlugins.mysql_clear_password);
console.log('authPlugins sha256_password', typeof mysql.authPlugins.sha256_password);
const cfg = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  authPlugins: {
    caching_sha2_password: mysql.authPlugins.caching_sha2_password,
    mysql_clear_password: mysql.authPlugins.mysql_clear_password,
    sha256_password: mysql.authPlugins.sha256_password,
    mysql_native_password: mysql.authPlugins.mysql_native_password,
  },
  ssl: false,
};
console.log('cfg authPlugins keys', Object.keys(cfg.authPlugins));
const pool = mysql.createPool(cfg);
const promisePool = pool.promise();
(async () => {
  try {
    const [rows] = await promisePool.execute('SELECT 1');
    console.log('SELECT 1 rows', rows);
  } catch (err) {
    console.error('execute error name', err && err.name);
    console.error('execute error code', err && err.code);
    console.error('execute error message', err && err.message);
    console.error('execute error stack', err && err.stack);
  } finally {
    pool.end();
  }
})();
