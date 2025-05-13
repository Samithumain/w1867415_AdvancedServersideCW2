const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  followers: {
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('followers');
      return raw ? JSON.parse(raw) : [];
    },
    set(value) {
      this.setDataValue('followers', JSON.stringify(value));
    }
  }
}, {
  timestamps: true
});

User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
});

User.associate = (models) => {
  User.hasOne(models.ApiKey, { foreignKey: 'userId' });
};

// sequelize.sync({ alter: true })
//   .then(() => {
//     console.log('Database synced with altered tables');
//   })
//   .catch(err => {
//     console.error('Failed to sync database:', err);
//   });


module.exports = User;
