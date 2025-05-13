const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
require('dotenv').config();
  

class UserController {
  static async signup(req, res) {
    
    const { username, email, password } = req.body;
    // if (email === process.env.RESTRICTED_EMAIL) {
    //     return res.status(400).json({ error: 'Invalid email' });
    // }

    try {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: email },
            { username: username }
          ]
        }
      });

      if (existingUser) {
        return UserController.login(req,res)

        // return res.status(400).json({ error: 'Username or Email already in use' });
      }

      const newUser = await User.create({
        username,
        email,
        password
      });
  
      const token = jwt.sign({ userId: newUser.id, email: email}, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      res.status(201).json({ message: 'User created successfully', user: newUser, token:token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }

  static async login(req, res) {
    const { email, password  } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: 'Invalid email' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, email: email},process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
  
      res.status(200).json({ message: 'Login successful', token , user:user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
  
}

module.exports = UserController;
