const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Table = sequelize.define('Table', {
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
  table_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  table_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
  },
  qr_code_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  qr_code_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  section: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  x_position: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  y_position: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shape: {
    type: DataTypes.ENUM('rectangle', 'circle', 'square'),
    defaultValue: 'rectangle',
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning', 'maintenance'),
    defaultValue: 'available',
  },
  current_order_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  current_waiter_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'waiters',
      key: 'id',
    },
  },
  current_customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  occupied_since: {
    type: DataTypes.DATE,
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
  tableName: 'restaurant_tables',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['restaurant_id', 'table_number'],
    },
  ],
});

module.exports = Table;