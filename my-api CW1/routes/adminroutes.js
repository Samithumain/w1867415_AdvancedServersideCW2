const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { deleteUserAndApiKey, getAllUsersWithApiData,deletekey,regenkey} = require('../controllers/admincontroller');

const apiKeyController = require('../controllers/APIKeycontrller');
const {verifyToken,verifyToken2} = require('../middlewares/authMiddleware');





// router.post('/validateAdmin', verifyToken, UserController.adminvalidate);
router.post('/getAllAdmin', verifyToken, getAllUsersWithApiData);
router.delete('/deleteAdmin/:userId', verifyToken, deleteUserAndApiKey);
router.delete('/deleteApiKey/:apikey', verifyToken, deletekey);
router.post('/regenApiKey/:userId', verifyToken, regenkey);




module.exports = router;
