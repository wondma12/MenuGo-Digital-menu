require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

(async () => {
  try {
    const DB_HOST = process.env.DB_HOST || 'hayabusa.proxy.rlwy.net';
    const DB_PORT = process.env.DB_PORT || 45537;
    const DB_USER = process.env.DB_USER || 'root';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'KbEWdlIgUugfGZeQgDxDDfyfkyHEPJpD';
    const DB_NAME = process.env.DB_NAME || 'menugo_db';

    const email = process.env.PLATFORM_ADMIN_EMAIL || 'haymanotwondmagegn3@gmail.com';
    const password = process.env.PLATFORM_ADMIN_PASSWORD || 'ChangeMe@1234';

    console.log('mysql2/promise loaded. authPlugins present?', typeof require('mysql2').authPlugins !== 'undefined');

    const opts = {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10000,
    };

    console.log('Connecting with options (redacted) host=%s port=%s database=%s user=%s', opts.host, opts.port, opts.database, opts.user);

    let connection;
    try {
      connection = await mysql.createConnection(opts);
    } catch (cErr) {
      console.error('CONNECT ERROR', cErr && cErr.message ? cErr.message : cErr);
      process.exit(1);
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    try {
      const [rows] = await connection.execute('SELECT id,email,role FROM users WHERE email = ? LIMIT 1', [email]);
      if (rows && rows.length) {
        const id = rows[0].id;
        console.log('Found existing user, updating password and flags for', email);
        await connection.execute('UPDATE users SET password_hash = ?, role = ?, is_active = 1, is_verified = 1, email_verified = 1, updated_at = NOW() WHERE id = ?', [password_hash, 'platform_admin', id]);
        console.log('Updated platform admin:', email, 'password:', password);
      } else {
        const id = uuidv4();
        console.log('Creating new platform admin', email);
        const insertSql = `INSERT INTO users (id, email, password_hash, full_name, role, is_active, is_verified, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, 1, 1, NOW(), NOW())`;
        await connection.execute(insertSql, [id, email, password_hash, 'Platform Admin', 'platform_admin']);
        console.log('Created platform admin:', email, 'password:', password);
      }
    } catch (qErr) {
      console.error('QUERY ERROR', qErr && qErr.message ? qErr.message : qErr);
      await connection.end();
      process.exit(1);
    }

    await connection.end();
    process.exit(0);
  } catch (e) {
    console.error('Script error', e && e.message ? e.message : e);
    process.exit(1);
  }
})();