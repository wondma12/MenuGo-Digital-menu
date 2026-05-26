const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RestaurantSetting = sequelize.define('RestaurantSetting', {
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
  setting_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  setting_value: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  setting_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  tableName: 'restaurant_settings',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['restaurant_id', 'setting_key'],
    },
  ],
});

module.exports = RestaurantSetting;