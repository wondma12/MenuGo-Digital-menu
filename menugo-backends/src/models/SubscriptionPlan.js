const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tier: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price_monthly: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  price_yearly: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  limits: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  stripe_price_monthly_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  stripe_price_yearly_id: {
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
  tableName: 'subscription_plans',
  timestamps: false,
  underscored: true,
});

// Associations
SubscriptionPlan.associate = (models) => {
  SubscriptionPlan.hasMany(models.Subscription, {
    foreignKey: 'plan_id',
    as: 'subscriptions',
  });
};

module.exports = SubscriptionPlan;
