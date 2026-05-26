#!/usr/bin/env node
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'menugo_db';

  console.log(`Connecting to MySQL ${host}:${port} as ${user} to recreate database '${dbName}'`);

  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password });
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`Dropped database ${dbName}`);
    await conn.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Created database ${dbName} with utf8mb4`);
    process.exit(0);
  } catch (err) {
    console.error('Error dropping/creating database:', err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
})();
