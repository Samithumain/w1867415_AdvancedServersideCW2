const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const blogmodel = require('../models/blogPostModel'); // adjust as needed
const usermodel = require('../models/userModel');
const BlogController = require('../controlllers/blogController');



class authorController {
  static async addUsernamesToBlogs(blogs) {
    const blogIds = blogs.map(blog => blog.id);
    const users = await usermodel.findAll({
      where: {
        id: {
          [Op.in]: blogs.map(blog => blog.author_id)
        }
      }
    });

    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user.username;
    });

    return blogs.map(blog => ({
      ...blog,
      author_username: userMap[blog.author_id] || 'Unknown'
    }));
  }


  static async fetchUserBlogs(req, res) {
    const { authorID, email } = req.query;
    const safeLimit = 10;
  
    try {
      if (!authorID) return res.status(400).json({ message: 'Author ID is required' });
  
      // Decode JWT from headers
      let token = req.headers['authorization']?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Authorization token missing' });
  
      let decoded;
      try {
        decoded = jwt.verify(token, 'jwt'); // Replace 'jwt' with process.env.JWT_SECRET in production
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      const requesterId = decoded.userId;
  
      // Fetch blogs by author
      const mostRecent = await blogmodel.findAll({
        where: { author_id: authorID },
        order: [['createdAt', 'DESC']],
        limit: safeLimit
      });
  
      const mostLiked = await blogmodel.findAll({
        where: { author_id: authorID },
        order: [['likes', 'DESC']],
        limit: safeLimit
      });
  
      const potentialPopular = await blogmodel.findAll({
        where: {
          author_id: authorID,
          createdAt: {
            [require('sequelize').Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        order: [['likes', 'DESC']],
        limit: 100
      });
  
      // Add author usernames
      const processedRecent = await authorController.addUsernamesToBlogs(mostRecent);
      const processedLiked = await authorController.addUsernamesToBlogs(mostLiked);
      const processedPopular = await authorController.addUsernamesToBlogs(
        potentialPopular
          .map(blog => ({
            ...blog.get({ plain: true }),
            popularityScore: BlogController.calculatePopularity(blog)
          }))
          .sort((a, b) => b.popularityScore - a.popularityScore)
          .slice(0, safeLimit)
      );
  
      // Check if current user follows the author
      const user = await usermodel.findByPk(authorID);
      let isFollowing = false;
      let following = 0 
  
      if (user && user.followers) {
        try {
          const followers = JSON.parse(user.followers);
          isFollowing = followers.includes(requesterId);
          if (isFollowing) {
            following  = 1
        }
        } catch (err) {
          console.error("Error parsing followers:", err);
        }
      }
  
      // Add isFollowing to each blog
    //   const enrich = blogs => blogs.map(blog => ({ ...blog, isFollowing }));
  
      res.status(200).json({
        mostRecent: (processedRecent),
        mostLiked: (processedLiked),
        mostPopular: (processedPopular),
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
}

module.exports = authorController;
