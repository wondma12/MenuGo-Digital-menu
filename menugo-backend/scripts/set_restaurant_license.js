const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize, Restaurant } = require('../src/models');

const setLicense = async (restaurantId, url) => {
  try {
    await sequelize.authenticate();
    const r = await Restaurant.findByPk(restaurantId);
    if (!r) {
      console.error('Restaurant not found:', restaurantId);
      process.exit(1);
    }
    const settings = r.settings || {};
    settings.business_license = {
      url,
      uploadedAt: new Date(),
      originalName: 'sample-license.png'
    };
    r.settings = settings;
    await r.save();
    console.log('Updated restaurant settings for', restaurantId);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
};

const [,, id, url] = process.argv;
if (!id || !url) {
  console.error('Usage: node set_restaurant_license.js <restaurantId> <url>');
  process.exit(1);
}
setLicense(id, url);
