const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function runFile(filePath, conn) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log('Running', filePath);
  await conn.query(sql);
  console.log('Done', filePath);
}

async function main() {
  const files = [
    path.join(__dirname, '..', 'db-migrations', '005_create_invoices.sql'),
    path.join(__dirname, '..', 'db-migrations', '006_create_subscriptions.sql'),
    path.join(__dirname, '..', 'db-migrations', '007_create_date_trunc.sql'),
    path.join(__dirname, '..', 'db-migrations', '012_add_contact_message_status_fields.sql'),
  ];

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    for (const f of files) {
      if (!fs.existsSync(f)) {
        console.warn('File not found:', f);
        continue;
      }
      await runFile(f, conn);
    }
    console.log('All done');
  } catch (err) {
    console.error('Error running SQL files:', err.message || err);
    process.exitCode = 2;
  } finally {
    await conn.end();
  }
}

main();
