const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StaffActivityLog = sequelize.define('StaffActivityLog', {
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
  action: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'staff_activity_logs',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = StaffActivityLog;