require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const { User } = require('../src/models');
(async () => {
  try {
    const email = process.argv[2] || 'haymanotwondmagegn3@gmail.com';
    const newPassword = process.argv[3] || 'Admin@123';
    await require('../src/models').sequelize.authenticate();
    const user = await User.findOne({ where: { email } });
    if (!user) return console.log('User not found');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await user.update({ password_hash: hash, login_attempts: 0 });
    console.log('Password updated for', email);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
