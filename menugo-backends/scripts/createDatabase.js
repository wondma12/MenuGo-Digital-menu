const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  // First connect without database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    // Create database
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'menugo_db'} 
       CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database '${process.env.DB_NAME}' created successfully`);

    // Create user if not exists
    await connection.query(
      `CREATE USER IF NOT EXISTS '${process.env.DB_USER}'@'localhost' IDENTIFIED BY '${process.env.DB_PASSWORD}'`
    );
    
    // Grant privileges
    await connection.query(
      `GRANT ALL PRIVILEGES ON ${process.env.DB_NAME}.* TO '${process.env.DB_USER}'@'localhost'`
    );
    
    await connection.query('FLUSH PRIVILEGES');
    console.log(`✅ User '${process.env.DB_USER}' configured successfully`);
    
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  } finally {
    await connection.end();
  }
}

createDatabase();