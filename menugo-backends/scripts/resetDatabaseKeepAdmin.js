/**
 * Reset database: truncate all tables and recreate a single platform admin user.
 * USAGE (safe):
 *  - Create a .env file or set env vars DB_* for your database connection.
 *  - Set FORCE_RESET=true to allow the script to run (safety guard).
 *  - Optionally set ADMIN_EMAIL and ADMIN_PASSWORD to override defaults.
 *  - Run: node scripts/resetDatabaseKeepAdmin.js
 *
 * WARNING: This will remove ALL data in the configured database except the created
 * platform admin. Use only on development or with a verified backup.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const SequelizePkg = require('sequelize');
const { sequelize } = require('../src/config/database');
const models = require('../src/models');
const { USER_ROLES } = require('../src/utils/constants');

const FORCE = process.env.FORCE_RESET === 'true' || process.argv.includes('--force');
// FULL mode will remove all users as well. Default behavior is to TRUNCATE everything
// but recreate a platform admin. Set FULL_RESET=true or pass --full to remove users too.
const FULL = process.env.FULL_RESET === 'true' || process.argv.includes('--full');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'haymanotwondmagegn3@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123??';
const SKIP_TABLES = ['SequelizeMeta', 'migrations'];

async function run() {
  if (!FORCE) {
    console.error('\nRefusing to run: set environment variable FORCE_RESET=true or pass --force to proceed.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();

    // List tables in current schema
    const dbName = process.env.DB_NAME;
    if (!dbName) throw new Error('DB_NAME environment variable is not set');

    console.log('Fetching table list...');
    const tables = await sequelize.query(
      "SELECT table_name AS tableName FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'",
      { replacements: [dbName], type: SequelizePkg.QueryTypes.SELECT }
    );

    const tableNames = tables.map(t => t.tableName).filter(Boolean).filter(t => !SKIP_TABLES.includes(t));
    console.log('Tables to truncate:', tableNames.join(', '));

    console.log('Disabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate all tables. If FULL is false we will recreate an admin later.
    for (const t of tableNames) {
      // When not full-reset, keep users until we explicitly recreate admin below
      if (!FULL && t === 'users') continue;
      console.log(`Truncating ${t}...`);
      await sequelize.query(`TRUNCATE TABLE \`${t}\``);
    }

    // If not full reset, clear users and recreate platform admin
    if (!FULL) {
      console.log('Clearing users table...');
      await sequelize.query('DELETE FROM `users`');

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(ADMIN_PASSWORD, salt);

      console.log(`Creating platform admin (${ADMIN_EMAIL})...`);
      const { User } = models;
      // Try to use model create (honors hooks/columns)
      await User.create({
        email: ADMIN_EMAIL,
        password_hash,
        full_name: 'Platform Admin',
        role: USER_ROLES.PLATFORM_ADMIN,
        is_verified: true,
        email_verified: true,
      });
    } else {
      console.log('FULL reset: users table was truncated and no admin was recreated.');
    }

    console.log('Re-enabling foreign key checks...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\nDatabase reset complete. Only platform admin account remains.');
    console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (err) {
    console.error('Error during reset:', err);
  } finally {
    try { await sequelize.close(); } catch (e) {}
    process.exit(0);
  }
}

run();
