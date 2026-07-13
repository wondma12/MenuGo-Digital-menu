const FALLBACK_RESTAURANT_REQUIRED_COLUMNS = [
  'sub_city',
  'whatsapp_number',
  'slogan',
  'business_license_number',
  'tin_number',
  'owner_name',
  'business_license_url',
  'logo_url',
  'cover_image_url',
  'cuisine_type',
  'cuisine_types',
  'operating_hours',
];

function getRestaurantModelColumnNames() {
  try {
    const Restaurant = require('../models/Restaurant');
    const columns = Object.keys(Restaurant.rawAttributes || {});
    return columns.filter((column) => !['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(column));
  } catch (error) {
    return FALLBACK_RESTAURANT_REQUIRED_COLUMNS;
  }
}
const RESTAURANT_REQUIRED_COLUMNS = FALLBACK_RESTAURANT_REQUIRED_COLUMNS;

function getMissingRestaurantColumns(existingColumns = [], requiredColumns = RESTAURANT_REQUIRED_COLUMNS) {
  const normalized = new Set((existingColumns || []).map((column) => String(column).toLowerCase()));

  return (requiredColumns || []).filter((column) => !normalized.has(String(column).toLowerCase()));
}

async function ensureRestaurantSchema() {
  const db = require('../config/database');
  const sequelize = db && db.sequelize;

  if (!sequelize || typeof sequelize.getQueryInterface !== 'function') {
    return { applied: [], skipped: true };
  }

  const Restaurant = require('../models/Restaurant');
  const queryInterface = sequelize.getQueryInterface();
  const tableName = 'restaurants';
  const tableInfo = await queryInterface.describeTable(tableName).catch(() => null);

  if (!tableInfo) {
    return { applied: [], skipped: true };
  }

  const requiredColumns = getRestaurantModelColumnNames();
  const missingColumns = getMissingRestaurantColumns(Object.keys(tableInfo), requiredColumns);
  if (!missingColumns.length) {
    return { applied: [], skipped: false };
  }

  const applied = [];
  for (const column of missingColumns) {
    const attribute = Restaurant.rawAttributes && Restaurant.rawAttributes[column];
    if (!attribute) {
      continue;
    }

    const columnDefinition = {
      type: attribute.type,
      allowNull: attribute.allowNull !== false,
    };

    if (typeof attribute.defaultValue !== 'undefined') {
      columnDefinition.defaultValue = attribute.defaultValue;
    }

    await queryInterface.addColumn(tableName, column, columnDefinition);
    applied.push(column);
  }

  return { applied, skipped: false };
}

module.exports = {
  ensureRestaurantSchema,
  getMissingRestaurantColumns,
  getRestaurantModelColumnNames,
  RESTAURANT_REQUIRED_COLUMNS,
};
