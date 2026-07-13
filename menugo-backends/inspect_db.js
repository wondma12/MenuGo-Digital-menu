const dotenv = require("dotenv");
dotenv.config();
const db = require("./src/config/database");
console.log("db exports", Object.keys(db));
console.log("sequelize authenticate type", typeof db.sequelize.authenticate);
console.log("cm config host", db.sequelize.connectionManager && db.sequelize.connectionManager.config && db.sequelize.connectionManager.config.host);
console.log("pool constructor", db.pool && db.pool.constructor && db.pool.constructor.name);
console.log("pool keys", db.pool && Object.keys(db.pool));
console.log("pool execute type", db.pool && typeof db.pool.execute);
console.log("callbackPool getConnection type", db.callbackPool && typeof db.callbackPool.getConnection);
(async () => {
  try {
    const [rows] = await db.pool.execute("SELECT 1");
    console.log("pool ok", rows);
  } catch (err) {
    console.error("pool execute err", err && err.stack || err);
    if (err && err.code) console.error("err.code", err.code);
  }
  try {
    await db.sequelize.authenticate();
    console.log("sequelize authenticate ok");
  } catch (err) {
    console.error("sequelize authenticate err", err && err.stack || err.message);
    if (err && err.code) console.error("err.code", err.code);
    process.exit(1);
  }
})();
