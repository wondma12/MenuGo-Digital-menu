const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TableReservation = sequelize.define('TableReservation', {
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
  table_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'restaurant_tables',
      key: 'id',
    },
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  customer_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  party_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reservation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reservation_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 120,
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'seated', 'cancelled', 'no_show', 'completed'),
    defaultValue: 'confirmed',
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
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
}, {
  tableName: 'table_reservations',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = TableReservation;