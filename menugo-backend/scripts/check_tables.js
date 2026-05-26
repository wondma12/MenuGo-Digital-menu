// check_tables.js
require('dotenv').config();
const db = require('../src/config/database');
(async()=>{
  try {
    const [rows] = await db.query("SHOW TABLES LIKE 'kitchen_orders'");
    if (rows && rows.length) {
      console.log('kitchen_orders exists');
    } else {
      console.log('kitchen_orders NOT found');
    }
    process.exit(0);
  } catch (e) {
    console.error('Error checking tables:', e.message || e);
    process.exit(1);
  }
})();
