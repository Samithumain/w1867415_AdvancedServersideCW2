const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middlewares/authMiddleware');
const BlogController = require('../controlllers/blogController');

router.post('/add',verifyToken, BlogController.add)
router.get('/search',verifyToken, BlogController.searchBlogs)
router.get('/country',verifyToken, BlogController.fetchBlogsByCountry)
router.get('/fetch',verifyToken, BlogController.fetchAllBlogs)
router.post('/reaction',verifyToken, BlogController.handleReaction)


module.exports = router;
