const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2');
const authPlugins = {
  caching_sha2_password: mysql.authPlugins.caching_sha2_password({}),
  mysql_clear_password: mysql.authPlugins.mysql_clear_password({}),
  sha256_password: mysql.authPlugins.sha256_password({}),
  mysql_native_password: mysql.authPlugins.mysql_native_password({}),
};
console.log('authPlugins ready', Object.keys(authPlugins));
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  authPlugins,
  ssl: false,
});
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
