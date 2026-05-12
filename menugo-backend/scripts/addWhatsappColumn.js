/*
  Script: addWhatsappColumn.js
  Purpose: Add `whatsapp_number` column to `restaurants` table if it doesn't exist.
  Usage: from menugo-backend folder run `node scripts/addWhatsappColumn.js`
  Requires: DB env vars (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
*/
const mysql = require('mysql2/promise');

(async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'Haymi@mysql1';
  const database = process.env.DB_NAME || 'menugo_db';

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, database });
    console.log('Connected to MySQL', host, database);

    const [rows] = await conn.execute(
      'SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = \'restaurants\' AND COLUMN_NAME = \'whatsapp_number\'',
      [database],
    );

    if (rows[0].cnt && rows[0].cnt > 0) {
      console.log('Column `whatsapp_number` already exists on restaurants table. No action taken.');
      process.exit(0);
    }

    console.log('Adding column `whatsapp_number` to restaurants table...');
    await conn.execute('ALTER TABLE restaurants ADD COLUMN whatsapp_number VARCHAR(50) NULL AFTER phone');
    console.log('Column added successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add column:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
