const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { execute } = require('../src/config/database');

const check = async () => {
  const db = process.env.DB_NAME;
  const [rows] = await execute(
    `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'restaurants'`,
    [db]
  );
  console.log(rows);
  process.exit(0);
};
check().catch(e => { console.error(e); process.exit(1); });
