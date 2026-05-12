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

    const [createRows] = await conn.query('SHOW CREATE TABLE notifications');
    console.log('\n---- SHOW CREATE TABLE notifications ----');
    console.log(createRows[0]['Create Table']);

    const [cols] = await conn.execute(
      `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('notifications','users')
       ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [database]
    );

    console.log('\n---- COLUMNS (notifications & users) ----');
    cols.forEach(c => console.log(`${c.TABLE_NAME}.${c.COLUMN_NAME} | ${c.COLUMN_TYPE} | nullable=${c.IS_NULLABLE} | default=${c.COLUMN_DEFAULT}`));

    const [fks] = await conn.execute(
      `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications' AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [database]
    );

    console.log('\n---- FOREIGN KEYS ON notifications ----');
    fks.forEach(f => console.log(`${f.CONSTRAINT_NAME} : ${f.COLUMN_NAME} -> ${f.REFERENCED_TABLE_NAME}.${f.REFERENCED_COLUMN_NAME}`));

    process.exit(0);
  } catch (err) {
    console.error('Inspect failed:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
