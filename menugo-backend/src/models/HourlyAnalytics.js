const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HourlyAnalytics = sequelize.define('HourlyAnalytics', {
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
  hour: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orders_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'hourly_analytics',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['restaurant_id', 'date', 'hour'],
    },
  ],
});

module.exports = HourlyAnalytics;