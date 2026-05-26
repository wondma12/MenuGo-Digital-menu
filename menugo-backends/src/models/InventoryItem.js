const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  reorder_level: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  reorder_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  cost_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  supplier: {
    type: DataTypes.STRING(255),
    allowNull: true,
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
  tableName: 'inventory_items',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = InventoryItem;