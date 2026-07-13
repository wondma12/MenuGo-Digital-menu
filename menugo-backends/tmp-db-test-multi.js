require('dotenv').config();
const { sequelize, User, Restaurant, Review } = require('./src/models');
(async () => {
  try {
    console.log('authenticating...');
    await sequelize.authenticate();
    console.log('authenticated');
    for (let i = 0; i < 20; i += 1) {
      const userCount = await User.count();
      const restCount = await Restaurant.count();
      const reviews = await Review.findAll({ where: { status: 'approved' }, limit: 1 });
      console.log(`iteration ${i}: userCount=${userCount}, restCount=${restCount}, reviews=${reviews.length}`);
    }
    console.log('done loops');
  } catch (e) {
    console.error('ERROR', e.stack || e.message || e);
  } finally {
    try { await sequelize.close(); console.log('closed'); } catch (e) { console.error('CLOSE ERR', e.message); }
  }
})();
