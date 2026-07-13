require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: false,
    });
    const [reviewsCols] = await conn.query('SHOW COLUMNS FROM reviews');
    console.log('reviews columns:', reviewsCols.map(c => c.Field).join(', '));
    const [restaurantsCols] = await conn.query('SHOW COLUMNS FROM restaurants');
    console.log('restaurants columns sample:', restaurantsCols.slice(0, 20).map(c => c.Field).join(', '));
    const [usersCols] = await conn.query('SHOW COLUMNS FROM users');
    console.log('users columns sample:', usersCols.slice(0, 20).map(c => c.Field).join(', '));
    await conn.end();
  } catch (e) {
    console.error('ERROR', e.stack || e.message || e);
    process.exit(1);
  }
})();
