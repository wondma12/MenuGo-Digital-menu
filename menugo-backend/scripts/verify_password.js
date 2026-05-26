require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const { User } = require('../src/models');
(async () => {
  try {
    const email = process.argv[2] || 'haymanotwondmagegn3@gmail.com';
    const password = process.argv[3] || 'Admin@123';
    await require('../src/models').sequelize.authenticate();
    const user = await User.findOne({ where: { email } });
    if (!user) return console.log('User not found');
    const ok = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', ok);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
