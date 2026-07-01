const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unread',
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  replied_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  reply_from_restaurant: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'contact_messages',
  timestamps: false,
  underscored: true,
});

module.exports = ContactMessage;
