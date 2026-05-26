const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WaiterRealtimeStatus = sequelize.define('WaiterRealtimeStatus', {
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
  status: {
    type: DataTypes.ENUM('online', 'offline', 'busy', 'break', 'away'),
    allowNull: false,
  },
  current_location: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  current_table_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  last_activity: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  battery_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  app_version: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  device_info: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'waiter_realtime_status',
  underscored: true,
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = WaiterRealtimeStatus;