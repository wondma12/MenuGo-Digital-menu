#!/usr/bin/env node
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;
const email = process.argv[3] || process.env.PLATFORM_ADMIN_EMAIL;
const password = process.argv[4] || process.env.PLATFORM_ADMIN_PASSWORD;

if (!DATABASE_URL || !email || !password) {
  console.error('Usage: node scripts/create_platform_admin_neon.js <DATABASE_URL> <EMAIL> <PASSWORD>');
  process.exit(1);
}

(async () => {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const password_hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  try {
    await pool.query('BEGIN');
    const result = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (result.rowCount > 0) {
      console.log('Existing user found, updating platform_admin credentials for', email);
      await pool.query(
        'UPDATE users SET password_hash=$1, role=$2, is_active=TRUE, is_verified=TRUE, email_verified=TRUE, updated_at=NOW() WHERE email=$3',
        [password_hash, 'platform_admin', email]
      );
      console.log('Updated platform admin:', email);
    } else {
      console.log('Creating platform admin user', email);
      await pool.query(
        'INSERT INTO users (id, email, password_hash, full_name, role, is_active, is_verified, email_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, TRUE, TRUE, TRUE, NOW(), NOW())',
        [randomUUID(), email, password_hash, 'Platform Admin', 'platform_admin']
      );
      console.log('Created platform admin:', email);
    }
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('Error creating or updating platform admin:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
