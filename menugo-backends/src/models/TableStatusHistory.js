const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TableStatusHistory = sequelize.define('TableStatusHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurant_tables',
      key: 'id',
    },
  },
  previous_status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  new_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  changed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'table_status_history',
  underscored: true,
  timestamps: true,
  createdAt: 'changed_at',
  updatedAt: false,
});

module.exports = TableStatusHistory;