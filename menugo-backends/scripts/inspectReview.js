require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'menugo_db',
  });

  const slug = 'haymanotwondmagegn-1778137307965';
  const [rests] = await conn.query('SELECT id, name FROM restaurants WHERE qr_code_identifier = ? LIMIT 1', [slug]);
  if (rests.length === 0) {
    console.log('Restaurant not found for slug', slug);
    process.exit(0);
  }
  const rid = rests[0].id;
  console.log('Found restaurant', rests[0].name, rid);

  const [rows] = await conn.query('SELECT id, user_id, customer_name, customer_email, comment, rating, created_at FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 10', [rid]);
  console.log('Recent reviews:');
  console.table(rows);
  await conn.end();
  process.exit(0);
})();