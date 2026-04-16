const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WaiterTip = sequelize.define('WaiterTip', {
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
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tip_type: {
    type: DataTypes.ENUM('cash', 'card', 'digital'),
    allowNull: false,
  },
  transaction_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  recorded_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'waiter_tips',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = WaiterTip;