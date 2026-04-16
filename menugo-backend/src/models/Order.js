const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
  },
  restaurant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  waiter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'waiters',
      key: 'id',
    },
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'restaurant_tables',
      key: 'id',
    },
  },
  table_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customer_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  service_charge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'rejected'),
    defaultValue: 'pending',
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'paid', 'refunded', 'failed', 'partial'),
    defaultValue: 'unpaid',
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'online', 'mobile_money'),
    allowNull: true,
  },
  payment_intent_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  order_type: {
    type: DataTypes.ENUM('dine_in', 'takeaway', 'delivery'),
    defaultValue: 'dine_in',
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  delivery_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  delivery_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verified_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  verified_by_waiter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verification_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  verification_code_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  prepared_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  prepared_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  preparation_started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  preparation_completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ready_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  served_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  served_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivered_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rejected_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estimated_preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  actual_preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  source: {
    type: DataTypes.ENUM('qr_code', 'waiter', 'online', 'pos'),
    defaultValue: 'qr_code',
  },
  coupon_code: {
    type: DataTypes.STRING(100),
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
  tableName: 'orders',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Order;