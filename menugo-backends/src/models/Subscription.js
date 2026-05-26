const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
  plan_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscription_plans',
      key: 'id',
    },
  },
  stripe_subscription_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tier: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
  },
  billing_interval: {
    type: DataTypes.STRING(20),
    defaultValue: 'monthly',
  },
  status: {
    type: DataTypes.ENUM('active', 'past_due', 'cancelled', 'expired', 'trial'),
    defaultValue: 'active',
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  cancel_at_period_end: {
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
  tableName: 'subscriptions',
  timestamps: false,
  underscored: true,
});

// Associations
Subscription.associate = (models) => {
  Subscription.belongsTo(models.Restaurant, {
    foreignKey: 'restaurant_id',
    as: 'restaurant',
  });
  Subscription.belongsTo(models.SubscriptionPlan, {
    foreignKey: 'plan_id',
    as: 'plan',
  });
  Subscription.hasMany(models.Invoice, {
    foreignKey: 'subscription_id',
    as: 'invoices',
  });
};

module.exports = Subscription;