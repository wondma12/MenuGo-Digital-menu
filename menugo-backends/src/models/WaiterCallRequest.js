const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WaiterCallRequest = sequelize.define('WaiterCallRequest', {
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
  table_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurant_tables',
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
  call_type: {
    type: DataTypes.ENUM('service', 'bill', 'help', 'food_issue', 'other'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'acknowledged', 'resolved', 'cancelled'),
    defaultValue: 'pending',
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  acknowledged_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  acknowledged_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'waiter_call_requests',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = WaiterCallRequest;