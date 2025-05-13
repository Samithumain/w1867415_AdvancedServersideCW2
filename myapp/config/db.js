 
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('serversidecw1', 'root','', {
//   host: 'localhost', 
//   port: 3306,        
//   dialect: 'mysql',    
//   logging: false,    
// });

// module.exports = sequelize;
// 
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',  
});

sequelize.authenticate()
  .then(() => {
    sequelize.query('PRAGMA foreign_keys = ON;'); 
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;

