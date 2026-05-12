require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const MIGRATION_PATH = path.join(__dirname, '../db-migrations/001_add_customer_columns_reviews.sql');

(async () => {
  try {
    console.log('Reading SQL file:', MIGRATION_PATH);
    const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'menugo_db',
      multipleStatements: true,
    });

    console.log('Connected to DB; checking existing columns...');

    // Check if customer_name / customer_email columns exist
    const [rows] = await connection.query(
      'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = \'reviews\' AND COLUMN_NAME IN (\'customer_name\',\'customer_email\')',
      [process.env.DB_NAME || 'menugo_db'],
    );

    const existing = rows.map(r => r.COLUMN_NAME);

    const alterations = [];
    if (!existing.includes('customer_name')) {alterations.push("ADD COLUMN customer_name VARCHAR(255) NULL");}
    if (!existing.includes('customer_email')) {alterations.push("ADD COLUMN customer_email VARCHAR(255) NULL");}

    if (alterations.length === 0) {
      console.log('Columns already exist; nothing to do.');
    } else {
      const alterSql = `ALTER TABLE reviews ${alterations.join(', ')};`;
      console.log('Applying:', alterSql);
      await connection.query(alterSql);
      console.log('\nMigration executed successfully.');
    }
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('\nMigration failed:', err.message || err);
    process.exit(1);
  }
})();
