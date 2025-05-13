const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class ApiKey extends Model {}

ApiKey.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', 
      key: 'id'
    }
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  apiCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ApiKey',
});

ApiKey.associate = (models) => {
  ApiKey.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = ApiKey;
