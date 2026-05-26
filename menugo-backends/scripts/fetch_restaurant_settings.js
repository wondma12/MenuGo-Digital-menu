const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize, Restaurant } = require('../src/models');

const id = process.argv[2];
(async () => {
  try {
    await sequelize.authenticate();
    const r = await Restaurant.findByPk(id);
    if (!r) {
      console.error('Not found'); process.exit(1);
    }
    console.log('settings:', JSON.stringify(r.settings, null, 2));
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
})();
