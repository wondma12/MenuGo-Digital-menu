require('dotenv').config({ path: __dirname + '/../.env' });
const { User } = require('../src/models');

(async () => {
  try {
    const identifier = process.argv[2] || 'haymanotwondmagegn5@gmail.com';
    await require('../src/models').sequelize.authenticate();

    let user = null;
    if (identifier.includes('@')) {
      user = await User.findOne({ where: { email: identifier } });
    } else {
      user = await User.findByPk(identifier);
    }

    if (!user) {
      console.log('User not found:', identifier);
      process.exit(1);
    }

    await user.update({ is_active: true });
    console.log('User activated:', { id: user.id, email: user.email });
    process.exit(0);
  } catch (err) {
    console.error('Error activating user:', err);
    process.exit(1);
  }
})();
