const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
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
  category_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'menu_categories',
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
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_public_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  thumbnail_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_recommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_popular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_vegetarian: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_vegan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_gluten_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_halal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  spice_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  },
  preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  serving_size: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  allergens: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  low_stock_threshold: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sales_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  review_count: {
    type: DataTypes.INTEGER,
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
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'menu_items',
  underscored: true,
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

module.exports = MenuItem;