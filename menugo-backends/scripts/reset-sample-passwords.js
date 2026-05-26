/**
 * Reset known sample users to bcrypt-hashed passwords so login works
 * Usage: node -r dotenv/config scripts/reset-sample-passwords.js
 */
const bcrypt = require('bcryptjs');
const db = require('../src/models');

const samples = [
  { email: 'restaurant.owner@menugo.com', password: 'Owner@123' },
  { email: 'waiter1@menugo.com', password: 'Waiter@123' },
  { email: 'chef1@menugo.com', password: 'Chef@123' },
  { email: 'customer@example.com', password: 'Customer@123' },
];

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');

    for (const s of samples) {
      const user = await db.User.findOne({ where: { email: s.email } });
      if (!user) {
        console.warn('User not found, skipping:', s.email);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(s.password, salt);
      await user.update({ password_hash: hash });
      console.log('Updated password for', s.email);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
