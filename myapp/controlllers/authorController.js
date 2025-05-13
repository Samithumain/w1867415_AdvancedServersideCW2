const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const blogmodel = require('../models/blogPostModel');
const usermodel = require('../models/userModel');
const BlogController = require('../controlllers/blogController');
const Sequelize = require('../config/db');
// 
authormodel = require('../models/autherModel');

class authorController {
  

  static async fetchUserBlogs(req, res) {
    const { authorID, email } = req.query;
    const safeLimit = 10;
  
    try {
      if (!authorID) return res.status(400).json({ message: 'Author ID is required' });
  
 
  
      const requesterId = req.user.userId;
  
      const mostRecent = await blogmodel.findAll({
        where: { author_id: authorID },
        order: [['createdAt', 'DESC']],
        limit: safeLimit
      });
  
      const mostLiked = await blogmodel.findAll({
        where: { author_id: authorID },
        order: [[Sequelize.literal('json_array_length(likes)'), 'DESC']],
        limit: safeLimit
      });
  
      const potentialPopular = await blogmodel.findAll({
        where: {
          author_id: authorID,
          createdAt: {
            [require('sequelize').Op.gte]: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000)
          }
        },
        order: [[Sequelize.literal('json_array_length(likes)'), 'DESC']],
        limit: 100
      });
  
     
      const processedPopular =(
        potentialPopular
          .map(blog => ({
            ...blog.get({ plain: true }),
            popularityScore: BlogController.calculatePopularity(blog)
          }))
          .sort((a, b) => b.popularityScore - a.popularityScore)
          .slice(0, safeLimit)
      );
  
      const user = await usermodel.findByPk(authorID);
      let isFollowing = false;
      let following = 0 
  
      if (user && user.followers.includes(requesterId)) {
            following  =1

        
      }
      
     const mostRecent2 = await BlogController.addUsernamesToBlogs(mostRecent);
     const mostLiked2 = await BlogController.addUsernamesToBlogs(mostLiked);
     const processedPopular2 = await BlogController.addUsernamesToBlogs(processedPopular);
      console.log(processedPopular)
      res.status(200).json({
        mostRecent: (mostRecent2),
        mostLiked: (mostLiked2),
        mostPopular: (processedPopular2),
        isFollowing: following
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching user blogs' });
    }
  }
    static async fetchUserDetails(req, res) {
        const { authorID } = req.query;
    
        try {
        if (!authorID) return res.status(400).json({ message: 'Author ID is required' });
    
        const user = await usermodel.findByPk(authorID);
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        res.status(200).json({
            username: user.username,
            email: user.email,
            followers: JSON.parse(user.followers || '[]')
        });
    
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching user details' });
        }
    }

  static  followAuthor = async (req, res) => {
  const { followerId, authorId } = req.body;

  try {
    const author = await usermodel.findByPk(authorId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    if (author.followers && author.followers.includes(followerId)) {
      return res.status(200).json({ message: 'Already following this author' });
    }

    author.followers = [...author.followers, followerId];
    
    await author.save();

    return res.status(200).json({ message: 'Successfully followed the author' });
  } catch (error) {
    console.error('Error following author:', error);
    return res.status(500).json({ message: 'Failed to follow author' });
  }
};


  static unfollowAuthor = async (req, res) => {
  const { followerId, authorId } = req.body;

  try {
    const author = await usermodel.findByPk(authorId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    if (!author.followers || !author.followers.includes(followerId)) {
      return res.status(400).json({ message: 'Not following this author' });
    }

    author.followers = author.followers.filter(id => id !== followerId);
    
    await author.save();

    return res.status(200).json({ message: 'Successfully unfollowed the author' });
  } catch (error) {
    console.error('Error unfollowing author:', error);
    return res.status(500).json({ message: 'Failed to unfollow author' });
  }
};


}

module.exports = authorController;
