require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: false,
    });
    for (const table of ['users','reviews','restaurants']) {
      const [rows] = await conn.query('SHOW CREATE TABLE ??', [table]);
      console.log('TABLE', table, '\n', rows[0]['Create Table']);
      console.log('---');
    }
    await conn.end();
  } catch (e) {
    console.error('ERROR', e.stack || e.message || e);
    process.exit(1);
  }
})();
