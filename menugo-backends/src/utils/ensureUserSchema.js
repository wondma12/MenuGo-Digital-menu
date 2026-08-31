function getMissingUserColumns(existingColumns = []) {
  const normalized = new Set(existingColumns.map((column) => String(column).toLowerCase()));
  return normalized.has('login_blocked') ? [] : ['login_blocked'];
}

async function ensureUserSchema() {
  const db = require('../config/database');
  const sequelize = db && db.sequelize;

  if (!sequelize || typeof sequelize.getQueryInterface !== 'function') {
    return { applied: [], skipped: true };
  }

  const User = require('../models/User');
  const queryInterface = sequelize.getQueryInterface();
  const tableInfo = await queryInterface.describeTable('users').catch(() => null);

  if (!tableInfo || getMissingUserColumns(Object.keys(tableInfo)).length === 0) {
    return { applied: [], skipped: !tableInfo };
  }

  const attribute = User.rawAttributes.login_blocked;
  await queryInterface.addColumn('users', 'login_blocked', {
    type: attribute.type,
    allowNull: attribute.allowNull !== false,
    defaultValue: attribute.defaultValue,
  });

  return { applied: ['login_blocked'], skipped: false };
}

module.exports = { ensureUserSchema, getMissingUserColumns };