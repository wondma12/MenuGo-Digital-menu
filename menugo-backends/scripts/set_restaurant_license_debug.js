const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.DB_LOGGING = 'true';
const { sequelize, Restaurant } = require('../src/models');

const setLicense = async (restaurantId, url) => {
  try {
    await sequelize.authenticate();
    let r = await Restaurant.findByPk(restaurantId);
    console.log('Before settings:', JSON.stringify(r.settings, null, 2));
    const settings = r.settings || {};
    settings.business_license = { url, uploadedAt: new Date().toISOString(), originalName: 'sample-license.png' };
    r.settings = settings;
    console.log('Changed fields before save:', r.changed());
    const saved = await r.save();
    console.log('After save instance settings:', JSON.stringify(saved.settings, null, 2));
    // reload from DB
    r = await Restaurant.findByPk(restaurantId);
    console.log('Reloaded settings:', JSON.stringify(r.settings, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
};

const [,, id, url] = process.argv;
if (!id || !url) {
  console.error('Usage: node set_restaurant_license_debug.js <restaurantId> <url>');
  process.exit(1);
}
setLicense(id, url);
