require('dotenv').config({ path: __dirname + '/../.env' });
const { User } = require('../src/models');

(async () => {
  try {
    const email = process.argv[2] || 'haymanotwondmagegn3@gmail.com';
    await require('../src/models').sequelize.authenticate();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    console.log('User:', {
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      role: user.role,
      login_attempts: user.login_attempts,
      createdAt: user.createdAt,
      password_hash: user.password_hash ? (user.password_hash.length > 20 ? user.password_hash.slice(0, 20) + '...' : user.password_hash) : null,
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
