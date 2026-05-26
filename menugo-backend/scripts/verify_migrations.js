const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    const [r1] = await conn.query("SHOW TABLES LIKE 'invoices'");
    const [r2] = await conn.query("SHOW TABLES LIKE 'subscriptions'");
    const [r3] = await conn.query("SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=DATABASE() AND ROUTINE_NAME='DATE_TRUNC' AND ROUTINE_TYPE='FUNCTION'");
    console.log('invoices:', r1.length > 0);
    console.log('subscriptions:', r2.length > 0);
    console.log('date_trunc function:', r3.length > 0);
  } catch (err) {
    console.error('Verify error:', err.message || err);
    process.exitCode = 2;
  } finally {
    await conn.end();
  }
})();
