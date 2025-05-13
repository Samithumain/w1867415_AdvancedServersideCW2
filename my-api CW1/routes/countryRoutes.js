 
const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const {verifyToken,verifyToken2} = require('../middlewares/authMiddleware');

router.get('/api/countries', verifyToken2, countryController.getCountries);
router.get('/api/countriesMicro', verifyToken2, countryController.getCountriesMicro);
module.exports = router;
