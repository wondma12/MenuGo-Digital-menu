const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Waiter = sequelize.define('Waiter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  staff_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurant_staff',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
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
  employee_id: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  shift_start: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  shift_end: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  assigned_sections: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  assigned_tables: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  max_tables: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_on_duty: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  current_shift_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  current_shift_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  total_orders_served: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_tips: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_revenue_generated: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  preferred_language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
  },
  notification_preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      sound_enabled: true,
      vibration_enabled: true,
      new_order_notification: true,
      order_ready_notification: true,
      push_notifications: true,
    },
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
  tableName: 'waiters',
  underscored: true,
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

module.exports = Waiter;