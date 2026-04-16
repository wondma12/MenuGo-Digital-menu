const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderRejectionReason = sequelize.define('OrderRejectionReason', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reason_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  reason_text: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'order_rejection_reasons',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = OrderRejectionReason;