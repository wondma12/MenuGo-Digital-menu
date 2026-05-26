const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WaiterCommission = sequelize.define('WaiterCommission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  waiter_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'waiters',
      key: 'id',
    },
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  order_item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'order_items',
      key: 'id',
    },
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
    defaultValue: 'pending',
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'waiter_commissions',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = WaiterCommission;