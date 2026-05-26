const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { execute } = require('../src/config/database');

const run = async (id, url) => {
  const settings = {
    auto_accept_orders: false,
    allow_online_payment: true,
    allow_cash_payment: true,
    enable_delivery: false,
    enable_takeaway: true,
    table_management: true,
    order_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    loyalty_program: false,
    happy_hour: false,
    business_license: {
      url,
      uploadedAt: new Date().toISOString(),
      originalName: 'raw-sample.png'
    }
  };
  const [res] = await execute('UPDATE restaurants SET settings = ? WHERE id = ?', [JSON.stringify(settings), id]);
  console.log('Raw update result:', res);
  const [rows] = await execute('SELECT settings FROM restaurants WHERE id = ?', [id]);
  console.log('DB settings after raw update:', rows[0].settings);
  process.exit(0);
};

const [,, id, url] = process.argv;
if (!id || !url) { console.error('Usage: node raw_update_settings.js <id> <url>'); process.exit(1); }
run(id, url).catch(e => { console.error(e); process.exit(1); });
