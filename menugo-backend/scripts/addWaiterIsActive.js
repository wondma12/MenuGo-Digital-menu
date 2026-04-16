require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menugo_db',
  multipleStatements: true,
};

(async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`Connected to database ${dbConfig.database}`);

    // Try ADD COLUMN IF NOT EXISTS (MySQL 8+). If it fails, try without IF NOT EXISTS and handle duplicate column error.
    try {
      await connection.query('ALTER TABLE waiters ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;');
      console.log('Ensured waiters.is_active exists (IF NOT EXISTS path).');
    } catch (err) {
      // If IF NOT EXISTS is not supported, fall back to trying without it and catch duplicate column error
      if (err && err.message && err.message.toLowerCase().includes('syntax')) {
        try {
          await connection.query('ALTER TABLE waiters ADD COLUMN is_active BOOLEAN DEFAULT true;');
          console.log('Added is_active column to waiters.');
        } catch (err2) {
          if (err2 && err2.message && err2.message.toLowerCase().includes('duplicate')) {
            console.log('Column is_active already exists on waiters.');
          } else {
            throw err2;
          }
        }
      } else if (err && err.message && err.message.toLowerCase().includes('duplicate')) {
        console.log('Column is_active already exists on waiters.');
      } else {
        throw err;
      }
    }

    await connection.end();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    if (connection) await connection.end().catch(() => {});
    console.error('Error ensuring waiters.is_active:', error && error.message ? error.message : error);
    process.exit(1);
  }
})();
