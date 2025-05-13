const express = require('express');
const cors = require('cors');
const countryRoutes = require('./routes/countryRoutes');
const userRoutes = require('./routes/users');
const adminroutes = require('./routes/adminroutes');

const sequelize = require('./config/db');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.use(express.json());


const User = require('./models/userModel');
const ApiKey = require('./models/apiKeyModel');

User.associate({ ApiKey });
ApiKey.associate({ User });
  

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(adminroutes)
app.use(countryRoutes);
app.use(userRoutes);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database connected and synced');
    app.listen(4000, () => {
      console.log('Server running on http://localhost:4000');
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
