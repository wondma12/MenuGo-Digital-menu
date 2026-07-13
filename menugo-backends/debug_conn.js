const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2');
const cfg = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  authPlugins: {
    caching_sha2_password: mysql.authPlugins.caching_sha2_password({}),
    mysql_clear_password: mysql.authPlugins.mysql_clear_password({}),
    sha256_password: mysql.authPlugins.sha256_password({}),
    mysql_native_password: mysql.authPlugins.mysql_native_password({}),
  },
  ssl: false,
};
console.log('config', cfg);
const conn = mysql.createConnection(cfg);
conn.connect((err) => {
  if (err) {
    console.error('connect err', err && err.stack || err.message);
    console.error('err code', err && err.code);
    conn.destroy();
    return;
  }
  conn.query('SELECT 1', (qerr, rows) => {
    if (qerr) {
      console.error('query err', qerr && qerr.stack || qerr.message);
      console.error('qerr code', qerr && qerr.code);
    } else {
      console.log('rows', rows);
    }
    conn.end();
  });
});
