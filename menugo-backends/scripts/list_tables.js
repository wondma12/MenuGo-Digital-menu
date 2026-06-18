const { sequelize } = require('../src/config/database');

(async () => {
  try {
    const result = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Raw result from sequelize.query:');
    console.log(JSON.stringify(result, null, 2));
    const rows = Array.isArray(result) ? result[0] : result;
    console.log('Tables:');
    if (Array.isArray(rows)) rows.forEach(r => console.log(' -', r.name || r.NAME || JSON.stringify(r)));
    else console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error('Error listing tables:', err.message || err);
    process.exit(1);
  }
})();
