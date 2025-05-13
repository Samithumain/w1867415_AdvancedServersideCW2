const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlogPost = sequelize.define('BlogPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  visit_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  likes: {
  type: DataTypes.TEXT, 
  defaultValue: '[]',
  get() {
    const raw = this.getDataValue('likes');
    return raw ? JSON.parse(raw) : [];
  },
  set(value) {
    this.setDataValue('likes', JSON.stringify(value));
  }
},

dislikes: {
  type: DataTypes.TEXT,
  defaultValue: '[]',
  get() {
    const raw = this.getDataValue('dislikes');
    return raw ? JSON.parse(raw) : [];
  },
  set(value) {
    this.setDataValue('dislikes', JSON.stringify(value));
  }
},

 image: { 
    type: DataTypes.STRING,
    allowNull: true,
  }


}, {
  timestamps: true
});

BlogPost.associate = (models) => {
  BlogPost.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
};


module.exports = BlogPost;
// 