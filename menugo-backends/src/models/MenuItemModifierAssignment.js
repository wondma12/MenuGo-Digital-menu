const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItemModifierAssignment = sequelize.define('MenuItemModifierAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  menu_item_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'menu_items',
      key: 'id',
    },
  },
  modifier_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'menu_item_modifiers',
      key: 'id',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'menu_item_modifier_assignments',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['menu_item_id', 'modifier_id'],
    },
  ],
});

module.exports = MenuItemModifierAssignment;