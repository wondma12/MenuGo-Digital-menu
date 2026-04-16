const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QRCode = sequelize.define('QRCode', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  restaurant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id',
    },
  },
  identifier: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  qr_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'restaurant_tables',
      key: 'id',
    },
  },
  table_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  scan_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_scanned_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'qr_codes',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = QRCode;