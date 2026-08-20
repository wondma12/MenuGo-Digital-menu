const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlatformSetting = sequelize.define('PlatformSetting', {
  key: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false,
    field: 'setting_key',
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'platform_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

module.exports = PlatformSetting;