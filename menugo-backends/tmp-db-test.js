require('dotenv').config();
const { sequelize, Restaurant } = require('./src/models');
(async () => {
  try {
    console.log('authenticating...');
    await sequelize.authenticate();
    console.log('authenticated');
    const restaurant = await Restaurant.findOne({ where: { qr_code_identifier: 'beles', is_active: true } });
    console.log('restaurant', restaurant && typeof restaurant.toJSON === 'function' ? restaurant.toJSON() : restaurant);
    const count = await Restaurant.count();
    console.log('count', count);
  } catch (e) {
    console.error('ERROR', e.stack || e.message || e);
  } finally {
    try {
      await sequelize.close();
      console.log('closed');
    } catch (e) {
      console.error('CLOSE ERR', e.message);
    }
  }
})();
