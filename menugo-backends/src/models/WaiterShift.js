const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WaiterShift = sequelize.define('WaiterShift', {
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
  shift_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  shift_start: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  shift_end: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  actual_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actual_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'active', 'completed', 'absent', 'late', 'break'),
    defaultValue: 'scheduled',
  },
  break_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  break_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  break_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'in minutes',
  },
  total_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  orders_served: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tips_earned: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
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
  tableName: 'waiter_shifts',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WaiterShift;