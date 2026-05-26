#!/usr/bin/env node
require('dotenv').config();
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const db = require('../src/models');
    const { sequelize, User } = db;

    const email = process.env.PLATFORM_ADMIN_EMAIL || 'haymanotwondmagegn3@gmail.com';
    const password = process.env.PLATFORM_ADMIN_PASSWORD || 'Admin@123';

    console.log('Setting platform admin to', email);

    await sequelize.authenticate();

    let admin = await User.findOne({ where: { role: 'platform_admin' } });
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    if (!admin) {
      console.log('No platform_admin found — creating new user');
      admin = await User.create({
        email,
        password_hash,
        full_name: 'Platform Admin',
        role: 'platform_admin',
        is_active: true,
        is_verified: true,
        email_verified: true,
      });
      console.log('Created platform_admin:', admin.email);
    } else {
      console.log('Found existing platform_admin (id=', admin.id, '). Updating...');
      await admin.update({ email, password_hash, is_active: true, is_verified: true, email_verified: true });
      console.log('Updated platform_admin to', email);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error setting platform admin:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
