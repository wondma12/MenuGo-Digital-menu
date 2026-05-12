/*
  Script: makeNotificationUserNullable.js
  Purpose: ALTER `notifications` table to make `user_id` column nullable
  Usage: from menugo-backend folder run `node scripts/makeNotificationUserNullable.js`
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

    // Drop existing foreign key (if present), alter column to nullable, then re-add FK with ON DELETE SET NULL
    console.log('Preparing to alter `notifications.user_id` to be NULLABLE');

    // Attempt to drop FK if it exists
    try {
      await conn.execute('ALTER TABLE notifications DROP FOREIGN KEY notifications_ibfk_2');
      console.log('Dropped foreign key notifications_ibfk_2');
    } catch (e) {
      console.log('Foreign key notifications_ibfk_2 not present or could not be dropped:', e.message || e);
    }

    // Modify column with explicit charset/collation to match existing table definition
    console.log('Altering column to be nullable...');
    await conn.execute("ALTER TABLE notifications MODIFY COLUMN user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL");

    // Re-add foreign key with ON DELETE SET NULL so notifications persist when users are removed
    try {
      await conn.execute('ALTER TABLE notifications ADD CONSTRAINT notifications_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE');
      console.log('Re-added foreign key notifications_ibfk_2 with ON DELETE SET NULL');
    } catch (e) {
      console.log('Failed to re-add foreign key (non-fatal):', e.message || e);
    }

    console.log('Column altered successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to alter column:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
