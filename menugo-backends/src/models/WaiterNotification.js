const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WaiterNotification = sequelize.define('WaiterNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  waiter_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'waiters',
      key: 'id',
    },
  },
  restaurant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id',
    },
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  notification_type: {
    type: DataTypes.ENUM('new_order', 'order_verified', 'order_ready', 'order_served', 'table_assigned', 'table_released', 'customer_call', 'system_alert'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },
  action_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  action_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  action_taken: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'waiter_notifications',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = WaiterNotification;