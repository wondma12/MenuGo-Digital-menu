const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'menugo_db',
  multipleStatements: true,
};

const createTable = async () => {
  const connection = await mysql.createConnection(dbConfig);
  const sql = `
  CREATE TABLE IF NOT EXISTS subscription_plans (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    features JSON,
    limits JSON,
    is_active BOOLEAN DEFAULT true,
    stripe_price_monthly_id VARCHAR(255),
    stripe_price_yearly_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
  `;

  try {
    await connection.query(sql);
    console.log('✓ subscription_plans table ensured');
  } catch (err) {
    console.error('Failed to create subscription_plans table:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

createTable();
