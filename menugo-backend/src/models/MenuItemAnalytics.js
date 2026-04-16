const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItemAnalytics = sequelize.define('MenuItemAnalytics', {
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
  menu_item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'menu_items',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  add_to_cart_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  order_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  quantity_sold: {
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
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'menu_item_analytics',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['restaurant_id', 'menu_item_id', 'date'],
    },
  ],
});

module.exports = MenuItemAnalytics;