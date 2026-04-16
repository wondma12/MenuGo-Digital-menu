const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItemModifier = sequelize.define('OrderItemModifier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'order_items',
      key: 'id',
    },
  },
  modifier_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price_adjustment: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'order_item_modifiers',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = OrderItemModifier;