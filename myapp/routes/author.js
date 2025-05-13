const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middlewares/authMiddleware');
const BlogController = require('../controlllers/blogController');
const authorcontroller = require('../controlllers/authorController');

router.get('/fetch',verifyToken, authorcontroller.fetchUserBlogs)
// router.post('/follow',verifyToken, authorcontroller.searchBlogs)
// router.delete('/follow',verifyToken, authorcontroller.searchBlogs)

router.post('/follow',verifyToken, authorcontroller.followAuthor)
// router.get('/fetch',verifyToken, BlogController.fetchAllBlogs)
router.delete('/follow',verifyToken, authorcontroller.unfollowAuthor)


module.exports = router;
// 