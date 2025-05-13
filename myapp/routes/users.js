const express = require('express');
const router = express.Router();
const UserController = require('../controlllers/userController');
const {verifyToken,verifyToken2} = require('../middlewares/authMiddleware');


router.post('/signup', UserController.signup);
router.post('/login', UserController.login);




module.exports = router;
