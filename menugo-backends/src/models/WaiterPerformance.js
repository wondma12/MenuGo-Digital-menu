const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WaiterPerformance = sequelize.define('WaiterPerformance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  orders_served: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tables_served: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  average_response_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'in seconds',
  },
  average_preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'in seconds',
  },
  customer_satisfaction: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
  },
  total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_tips: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  upsell_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  upsell_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
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
  tableName: 'waiter_performance',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['waiter_id', 'date'],
    },
  ],
});

module.exports = WaiterPerformance;