const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QRCodeScan = sequelize.define('QRCodeScan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  qr_code_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'qr_codes',
      key: 'id',
    },
  },
  restaurant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id',
    },
  },
  scanned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  device_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  browser: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  os: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'qr_code_scans',
  underscored: true,
  timestamps: true,
  createdAt: 'scanned_at',
  updatedAt: false,
});

module.exports = QRCodeScan;