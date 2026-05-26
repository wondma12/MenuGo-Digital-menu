const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderVerificationAttempt = sequelize.define('OrderVerificationAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  waiter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'waiters',
      key: 'id',
    },
  },
  verification_method: {
    type: DataTypes.ENUM('qr_code', 'manual', 'table_check'),
    allowNull: false,
  },
  verification_code_entered: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  failure_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attempted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  device_info: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'order_verification_attempts',
  underscored: true,
  timestamps: true,
  createdAt: 'attempted_at',
  updatedAt: false,
});

module.exports = OrderVerificationAttempt;