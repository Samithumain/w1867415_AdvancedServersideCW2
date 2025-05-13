const blogmodel = require('../models/blogPostModel');
const usermodel = require('../models/userModel'); 
const jwt = require('jsonwebtoken');
const Sequelize = require('../config/db');
const upload = require('../middlewares/multer'); 
  const { Op } = require('sequelize');
// 
class BlogController {
  static requesterId = 0  


  static async add(req, res) {
  const { title, content, country, visit_date, author_id } = req.body;
  const imageFile = req.file; 

  if (!title || !content || !country || !visit_date || !author_id) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    let imagePath = '';
    if (imageFile) {
      imagePath = `/uploads/blog_images/${imageFile.filename}`;
    }

    const newPost = await blogmodel.create({
      title,
      content,
      country,
      visit_date,
      author_id,
      image: imagePath 
    });

    const user = await BlogController.getUser(newPost.author_id);
    newPost.author_username = user.username;

    res.status(201).json({ message: 'Blog post created.', blog: newPost });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({error, error: 'Server error while creating blog post.' });
  }
}

static async searchBlogs(req, res) {
  let token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization token missing' });

  let decoded;
  try {
    decoded = jwt.verify(token, 'jwt');
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  BlogController.requesterId = decoded.userId;

  const { search, limit = 10 } = req.query;
  const parsedLimit = parseInt(limit);
  const safeLimit = Math.min(isNaN(parsedLimit) ? 10 : parsedLimit, 20);
  const searchQuery = search || '';

  try {
    // Step 1: Find user IDs based on the search query
    let userIds = [];
    if (search) { // Only perform this query if there's a search term
      const users = await usermodel.findAll({
        where: {
          username: {
            [Op.like]: `%${search}%`
          }
        }
      });
      userIds = users.map(user => user.id);
    }
    console.log("userIds", userIds, "username", search, userIds.length);


    // Step 2: Define the base query and the conditions.
    const baseQuery = {
      limit: safeLimit,
      where: {} // Start with an empty where clause
    };

    // Define the OR condition for title search and author_id.  This is the key change.
    const orConditions = [];
    if (searchQuery) {
      orConditions.push({ title: { [Op.like]: `%${searchQuery}%` } });
    }
    if (userIds.length > 0) {
      orConditions.push({ author_id: { [Op.in]: userIds } });
    }

    // If there are any OR conditions, add them to the base query
    if (orConditions.length > 0) {
      baseQuery.where[Op.or] = orConditions;
    }
    // If both search and userIds are empty,  return all blogs.
    if (orConditions.length === 0){
        delete baseQuery.where[Op.or];
    }


    // Step 3: Fetch blogs with the combined conditions
    let mostRecent = await blogmodel.findAll({
      ...baseQuery,
      order: [['createdAt', 'DESC']]
    });
    mostRecent = await BlogController.addUsernamesToBlogs(mostRecent);

    let mostLiked = await blogmodel.findAll({
      ...baseQuery,
      order: [['likes', 'DESC']]
    });
    mostLiked = await BlogController.addUsernamesToBlogs(mostLiked);

    const recencyThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let potentialPopular = await blogmodel.findAll({
      ...baseQuery,
      where: {
        ...baseQuery.where, // Include any existing where conditions
        createdAt: { [Op.gte]: recencyThreshold }
      },
      order: [['likes', 'DESC']],
      limit: 100
    });


    let mostPopular = potentialPopular
      .map(blog => ({
        ...blog.toJSON(),
        popularityScore: BlogController.calculatePopularity(blog)
      }))
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, safeLimit);

    mostPopular = await BlogController.addUsernamesToBlogs(mostPopular);

    return res.status(200).json({ mostRecent, mostLiked, mostPopular });

  } catch (err) {
    console.error('Full searchBlogs error:', err);
    return res.status(500).json({ message: 'Error searching blogs' });
  }
}



  static async fetchBlogsByCountry(req, res) {

 let token = req.headers['authorization']?.split(' ')[1];
          if (!token) return res.status(401).json({ message: 'Authorization token missing' });
      
          let decoded;
          try {
            decoded = jwt.verify(token, 'jwt'); 
          } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
          }
      
          BlogController.requesterId = decoded.userId;
      

    const { country, limit = 10 } = req.query;
    const safeLimit = Math.min(parseInt(limit), 20);
    const countrydata = await BlogController.getcountrydata(country)

    try {
      const baseQuery = {
        where: { country },
        limit: safeLimit
      };

      var mostRecent = await blogmodel.findAll({
        ...baseQuery,
        order: [['createdAt', 'DESC']]
      });

      mostRecent = await BlogController.addUsernamesToBlogs(mostRecent);

      var mostLiked = await blogmodel.findAll({
        ...baseQuery,
        order: [[Sequelize.literal('json_array_length(likes)'), 'DESC']]
      });

      mostLiked = await BlogController.addUsernamesToBlogs(mostLiked);

      const recencyThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const potentialPopular = await blogmodel.findAll({
        where: {
          country,
          createdAt: { [require('sequelize').Op.gte]: recencyThreshold }
        },
        order: [[Sequelize.literal('json_array_length(likes)'), 'DESC']],
        limit: 100
      });

      var mostPopular = potentialPopular
        .map(blog => ({
          ...blog.toJSON(),
          popularityScore: BlogController.calculatePopularity(blog)
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, safeLimit);

      mostPopular = await BlogController.addUsernamesToBlogs(mostPopular);

      res.status(200).json({ mostRecent, mostLiked, mostPopular,countrydata });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching blogs by country' });
    }
  }

  static async fetchAllBlogs(req, res) {

 let token = req.headers['authorization']?.split(' ')[1];
          if (!token) return res.status(401).json({ message: 'Authorization token missing' });
      
          let decoded;
          try {
            decoded = jwt.verify(token, 'jwt'); 
          } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
          }
      
          BlogController.requesterId = decoded.userId;
      

    const { limit = 10 } = req.query;
    const safeLimit = Math.min(parseInt(limit), 20);
  
    try {
      const mostRecent = await blogmodel.findAll({
        order: [['createdAt', 'DESC']],
        limit: safeLimit
      });
  
      const mostLiked = await blogmodel.findAll({
        order: [[Sequelize.literal('json_array_length(likes)'), 'DESC']],
        limit: safeLimit
      });
  
      const potentialPopular = await blogmodel.findAll({
        where: {
          createdAt: { [require('sequelize').Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        order: [[Sequelize.literal('json_array_length(likes)'), 'DESC']],
        limit: 100
      });
  
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

static async getcountrydata(country) {
  console.log("country",country);
  let countrydata = "";
    try {

      const response = await fetch(`http://my_microservice:4000/api/countriesMicro?country=${country}`, {
        method: 'GET',
        headers: {
          // put env
          // 'authorization': `Bearer ${token}`,
          'authorization': `Microkey`,
          
        },
      });
      const data = await response.json();
      console.log("data",data);
  if (data && data.length > 0) {
        countrydata = (data[0]);
      } 
      else if (data.error) {
        console.log("error",data.error);
                countrydata = "";

      }
      else{
                countrydata = "";
      }
    } catch (error) {
      console.error('Error fetching country data:', error);
                countrydata = "";
    }
   return countrydata;
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

    return (blog.likes.length || 0) * likeWeight +
           (blog.dislikes.length || 0) * dislikeWeight * timeWeight;
  }

  static async addUsernamesToBlogs(blogs) {
  return Promise.all(blogs.map(async (blog) => {
    const blogData = blog.get ? blog.get({ plain: true }) : blog;
    // 0 non / 1 like / 2 dislike
       
    var likestatus = 0
    if (blogData.likes && blogData.likes.includes(BlogController.requesterId)) {
      likestatus = 1
    }
    else if (blogData.dislikes && blogData.dislikes.includes(BlogController.requesterId)) {
      likestatus = 2
    }
    const user = await usermodel.findByPk(blogData.author_id);
    return {
      ...blogData,
      author_username: user?.username || 'Unknown',
      likestatus: likestatus
    };
  }));
}
    static async handleReaction(req, res) {


  const { blogId, reaction } = req.query;
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization token missing' });

  let decoded;
  try {
    decoded = jwt.verify(token, 'jwt'); 
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const userId = decoded.userId;

  try {
    const blog = await blogmodel.findByPk(blogId);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    let likes = blog.likes || [];
    let dislikes = blog.dislikes || [];

    if (typeof likes === 'string') likes = JSON.parse(likes);
    if (typeof dislikes === 'string') dislikes = JSON.parse(dislikes);

const preLiked = likes.includes(userId) ? 1 : 0;
const preDisliked = dislikes.includes(userId) ? 1 : 0;
    console.log("preLiked", preLiked);
    let reactionadded = 0
    likes = likes.filter(id => id !== userId);
    dislikes = dislikes.filter(id => id !== userId);

    if (reaction === 'like' && preLiked == 0) {
      likes.push(userId);
      reactionadded = 1
    } else if (reaction === 'dislike' && preDisliked == 0) {
      dislikes.push(userId);
      reactionadded = 1
    } else {
      // return res.status(400).json({ message: 'Invalid reaction type' });
    }
    console.log("reactionadded", reactionadded);
    blog.likes = likes;
    blog.dislikes = dislikes;

    await blog.save();

    return res.status(200).json({
      message: 'Blog reaction updated successfully',
      likesCount: likes.length,
      dislikesCount: dislikes.length,
      likes: likes,
      dislikes: dislikes,
      reactionadded: reactionadded
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error handling reaction' });
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
