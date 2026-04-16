const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
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
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cover_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cuisine_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cuisine_types: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  operating_hours: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  delivery_radius_km: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  minimum_order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  service_charge: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  qr_code_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  qr_code_identifier: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verification_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verified_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subscription_tier: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    defaultValue: 'basic',
  },
  subscription_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  subscription_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  subscription_status: {
    type: DataTypes.ENUM('trial', 'active', 'past_due', 'cancelled', 'expired'),
    defaultValue: 'trial',
  },
  max_menu_items: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  max_users: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  max_orders_per_day: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      auto_accept_orders: false,
      allow_online_payment: true,
      allow_cash_payment: true,
      enable_delivery: false,
      enable_takeaway: true,
      table_management: true,
      order_notifications: true,
      email_notifications: true,
      sms_notifications: false,
      loyalty_program: false,
      happy_hour: false,
    },
  },
  onboarding_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  onboarding_step: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  total_reviews: {
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
  tableName: 'restaurants',
  underscored: true,
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

module.exports = Restaurant;