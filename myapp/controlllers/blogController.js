const blogmodel = require('../models/blogPostModel');
const usermodel = require('../models/userModel'); 

class BlogController {
  static async add(req, res) {
    const { title, content, country, visit_date, author_id } = req.body;

    if (!title || !content || !country || !visit_date || !author_id) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
      const newPost = await blogmodel.create({
        title,
        content,
        country,
        visit_date,
        author_id
      });

      const user = await BlogController.getUser(newPost.author_id); // Get the author user details
      newPost.author_username = user.username;

      res.status(201).json({ message: 'Blog post created.', blog: newPost });
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Server error while creating blog post.' });
    }
  }

  static async searchBlogs(req, res) {
    const { search, limit = 10 } = req.query;
    const safeLimit = Math.min(parseInt(limit), 20);
    const searchQuery = search || '';

    try {
      const baseQuery = {
        where: {
          title: {
            [require('sequelize').Op.iLike]: `%${searchQuery}%`
          }
        },
        limit: safeLimit
      };

      var mostRecent = await blogmodel.findAll({
        ...baseQuery,
        order: [['createdAt', 'DESC']]
      });

      // Get user details and add to each blog's data
      mostRecent = await BlogController.addUsernamesToBlogs(mostRecent);

      var mostLiked = await blogmodel.findAll({
        ...baseQuery,
        order: [['likes', 'DESC']]
      });

      // Get user details and add to each blog's data
      mostLiked = await BlogController.addUsernamesToBlogs(mostLiked);

      const recencyThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const potentialPopular = await blogmodel.findAll({
        where: {
          ...baseQuery.where,
          createdAt: { [require('sequelize').Op.gte]: recencyThreshold }
        },
        order: [['likes', 'DESC']],
        limit: 100
      });

      var mostPopular = potentialPopular
        .map(blog => ({
          ...blog.toJSON(),
          popularityScore: BlogController.calculatePopularity(blog)
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, safeLimit);

      // Get user details and add to each blog's data
      mostPopular = await BlogController.addUsernamesToBlogs(mostPopular);

      res.status(200).json({ mostRecent, mostLiked, mostPopular });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error searching blogs' });
    }
  }

  static async fetchBlogsByCountry(req, res) {
    const { country, limit = 10 } = req.query;
    const safeLimit = Math.min(parseInt(limit), 20);

    try {
      const baseQuery = {
        where: { country },
        limit: safeLimit
      };

      var mostRecent = await blogmodel.findAll({
        ...baseQuery,
        order: [['createdAt', 'DESC']]
      });

      // Get user details and add to each blog's data
      mostRecent = await BlogController.addUsernamesToBlogs(mostRecent);

      var mostLiked = await blogmodel.findAll({
        ...baseQuery,
        order: [['likes', 'DESC']]
      });

      // Get user details and add to each blog's data
      mostLiked = await BlogController.addUsernamesToBlogs(mostLiked);

      const recencyThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const potentialPopular = await blogmodel.findAll({
        where: {
          country,
          createdAt: { [require('sequelize').Op.gte]: recencyThreshold }
        },
        order: [['likes', 'DESC']],
        limit: 100
      });

      var mostPopular = potentialPopular
        .map(blog => ({
          ...blog.toJSON(),
          popularityScore: BlogController.calculatePopularity(blog)
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, safeLimit);

      // Get user details and add to each blog's data
      mostPopular = await BlogController.addUsernamesToBlogs(mostPopular);

      res.status(200).json({ mostRecent, mostLiked, mostPopular });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching blogs by country' });
    }
  }

  static async fetchAllBlogs(req, res) {
    const { limit = 10 } = req.query;
    const safeLimit = Math.min(parseInt(limit), 20);
  
    try {
      // Fetch all data first
      const mostRecent = await blogmodel.findAll({
        order: [['createdAt', 'DESC']],
        limit: safeLimit
      });
  
      const mostLiked = await blogmodel.findAll({
        order: [['likes', 'DESC']],
        limit: safeLimit
      });
  
      const potentialPopular = await blogmodel.findAll({
        where: {
          createdAt: { [require('sequelize').Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        order: [['likes', 'DESC']],
        limit: 100
      });
  
      // Convert to plain objects and add usernames
      const processedRecent = await BlogController.addUsernamesToBlogs(mostRecent);
      const processedLiked = await BlogController.addUsernamesToBlogs(mostLiked);
      const processedPopular = await BlogController.addUsernamesToBlogs(
        potentialPopular
          .map(blog => ({
            ...blog.get({ plain: true }),
            popularityScore: BlogController.calculatePopularity(blog)
          }))
          .sort((a, b) => b.popularityScore - a.popularityScore)
          .slice(0, safeLimit)
      );
  
      // Debug check
      console.log("First Recent username:", processedRecent[0]?.author_username);
      console.log("First Liked username:", processedLiked[0]?.author_username);
      console.log("First Popular username:", processedPopular[0]?.author_username);
  
      res.status(200).json({
        mostRecent: processedRecent,
        mostLiked: processedLiked,
        mostPopular: processedPopular
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching blogs' });
    }
  }
  
  static calculatePopularity(blog) {
    const currentTime = new Date();
    const blogDate = new Date(blog.createdAt);
    const timeDifference = (currentTime - blogDate) / (1000 * 3600 * 24);

    const likeWeight = 1;
    const dislikeWeight = 0.5;

    const timeWeight = timeDifference <= 1
      ? 1
      : 1 / Math.log(timeDifference + 1);

    return (blog.likes || 0) * likeWeight +
           (blog.dislikes || 0) * dislikeWeight * timeWeight;
  }

  
static async addUsernamesToBlogs(blogs) {
  return Promise.all(blogs.map(async (blog) => {
    // Convert to plain object if it's a Sequelize instance
    const blogData = blog.get ? blog.get({ plain: true }) : blog;
    
    const user = await usermodel.findByPk(blogData.author_id);
    return {
      ...blogData,
      author_username: user?.username || 'Unknown'
    };
  }));
}
    
  
 

  static async handleReaction(req, res) {
    const { blogId, reaction } = req.query;
    const email = req.body.email;
    
    try {
      const blog = await blogmodel.findByPk(blogId);
      if (!blog) return res.status(404).json({ message: 'Blog not found' });

      let { likes, dislikes } = blog;

      if (reaction === 'like') {
        likes += 1;
      } else if (reaction === 'dislike') {
        dislikes += 1;
      } else {
        return res.status(400).json({ message: 'Invalid reaction type' });
      }

      blog.likes = likes;
      blog.dislikes = dislikes;

      await blog.save();

      res.status(200).json({
        message: 'Blog reaction updated successfully',
        likes: blog.likes,
        dislikes: blog.dislikes
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error handling reaction' });
    }
  }

  static async getUser(authorId) {
    try {
      const user = await usermodel.findOne({ where: { id: authorId } });
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('User not found');
    }
  }
}

module.exports = BlogController;
