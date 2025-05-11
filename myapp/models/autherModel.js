const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  followers: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = Author;