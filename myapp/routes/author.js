const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middlewares/authMiddleware');
const BlogController = require('../controlllers/blogController');
const authorcontroller = require('../controlllers/authorController');

router.get('/fetch',verifyToken, authorcontroller.fetchUserBlogs)
// router.post('/follow',verifyToken, authorcontroller.searchBlogs)
// router.delete('/follow',verifyToken, authorcontroller.searchBlogs)

router.get('/country',verifyToken, BlogController.fetchBlogsByCountry)
// router.get('/fetch',verifyToken, BlogController.fetchAllBlogs)
router.post('/reaction',verifyToken, BlogController.handleReaction)


module.exports = router;
