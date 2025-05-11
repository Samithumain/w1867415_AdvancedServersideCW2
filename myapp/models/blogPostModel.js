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
    type: DataTypes.INTEGER,
    defaultValue: 0,  
    allowNull: false
  },
  dislikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  
    allowNull: false
  }
}, {
  timestamps: true
});

BlogPost.associate = (models) => {
  BlogPost.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
};

// sequelize.sync({ force: true })  // This will drop and recreate the tables
//   .then(() => {
//     console.log('Database synced successfully!');
//   })
//   .catch((error) => {
//     console.error('Error syncing database:', error);
//   });

module.exports = BlogPost;
