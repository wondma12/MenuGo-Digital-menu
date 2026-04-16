const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DailySalesSummary = sequelize.define('DailySalesSummary', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_service_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  average_order_value: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  dine_in_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  dine_in_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  takeaway_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  takeaway_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  delivery_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  delivery_revenue: {
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
  tableName: 'daily_sales_summary',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['restaurant_id', 'date'],
    },
  ],
});

module.exports = DailySalesSummary;