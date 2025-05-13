const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const apiKeyController = require('../controllers/APIKeycontrller');
const {verifyToken,verifyToken2} = require('../middlewares/authMiddleware');


router.post('/signup', UserController.signup);
router.post('/login', UserController.login);



router.post('/generate-api-key', verifyToken, apiKeyController.generateApiKey);
router.post('/validateAdmin', verifyToken, UserController.adminvalidate);


module.exports = router;
