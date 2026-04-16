const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
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
  subscription_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscriptions',
      key: 'id',
    },
  },
  stripe_invoice_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  invoice_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  pdf_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'invoices',
  timestamps: false,
  underscored: true,
});

// Associations
Invoice.associate = (models) => {
  Invoice.belongsTo(models.Restaurant, {
    foreignKey: 'restaurant_id',
    as: 'restaurant',
  });
  Invoice.belongsTo(models.Subscription, {
    foreignKey: 'subscription_id',
    as: 'subscription',
  });
};

module.exports = Invoice;