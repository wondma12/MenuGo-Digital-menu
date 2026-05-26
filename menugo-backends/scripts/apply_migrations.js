// apply_migrations.js
// Usage: node apply_migrations.js <path-to-sql-file>
// Loads DB credentials from environment (.env) and applies the SQL file

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function apply(sqlPath) {
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(2);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const connConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || undefined,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    multipleStatements: true,
  };

  const conn = await mysql.createConnection(connConfig);
  try {
    console.log('Applying SQL file:', sqlPath);
    const [result] = await conn.query(sql);
    console.log('Migration applied successfully.');
  } finally {
    await conn.end();
  }
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node apply_migrations.js <path-to-sql-file>');
  process.exit(1);
}

apply(arg).catch((err) => {
  console.error('Failed to apply migration:', err.message || err);
  process.exit(1);
});
