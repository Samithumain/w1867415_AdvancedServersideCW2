import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ViewBlog = () => {
    const navigate = useNavigate();


  const { user } = useAuth();
  const [blogs, setBlogs] = useState({ mostRecent: [], mostLiked: [], mostPopular: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    postCount: 5,
    sortBy: 'recent',
    country: '',
    searchQuery: ''
  });

  const countries = ['USA', 'Canada', 'UK', 'Japan', 'Australia', 'France', 'Germany'];

  useEffect(() => {
    const fetchBlogs = async () => {
      let url = "";
      const { searchQuery, country, postCount, sortBy } = filters;

      if (searchQuery) {
        url = `http://localhost:5000/api/blog/search?search=${searchQuery}&limit=${postCount}&email=${encodeURIComponent(user.email)}`;
      } else if (country) {
        url = `http://localhost:5000/api/blog/country?country=${country}&limit=${postCount}&email=${encodeURIComponent(user.email)}`;
      } else {
        url = `http://localhost:5000/api/blog/fetch?limit=${postCount}&email=${encodeURIComponent(user.email)}`;
      }

      try {
        setLoading(true);
        const res = await fetch(url, {
            method: 'GET', 
            headers: {
              'authorization': `Bearer ${user.token}`, 
              'Content-Type': 'application/json'
            }
          });
          
          const data = await res.json();
          // Save each category of blogs separately
          setBlogs(data); 
      } catch (e) {
        console.error('Error loading blogs:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [filters]);


  const handleAuthorClick = (e, authorId, username) => {

    e.preventDefault();
    
    // 1. Your custom logic here
    console.log(`Author clicked - ID: ${authorId}, Username: ${username}`);
    
    // 2. Example: Track analytics
    
    // 3. Navigate to author page
    navigate(`/authors/${authorId}`);
  };

  const handleReaction = async (blogId, reaction) => {
    if (!user) return;
    window.alert("blogid: " + blogId);
    try {
      const response = await fetch(`http://localhost:5000/api/blog/reaction?blogId=${blogId}&reaction=${reaction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      setBlogs((prevBlogs) => {
        const updatedBlogs = { ...prevBlogs };
      
        const listKey = 
          filters.sortBy === 'recent' ? 'mostRecent' :
          filters.sortBy === 'popular' ? 'mostPopular' :
          'mostLiked';
      
        updatedBlogs[listKey] = updatedBlogs[listKey].map(blog => {
          if (blog.id === blogId) {
            return {
              ...blog,
              userReaction: reaction,
              likes: reaction === 'like' ? blog.likes + 1 : blog.likes,
              dislikes: reaction === 'dislike' ? blog.dislikes + 1 : blog.dislikes,
            };
          }
          return blog;
        });
      
        return updatedBlogs;
      });
    } catch (error) {
      console.error(`Error ${reaction} blog:`, error);
    }
  };

  return (
    <div className="blog-container">
      <div className="filter-section">
        <select
          value={filters.postCount}
          onChange={(e) => setFilters({...filters, postCount: e.target.value})}
        >
          {[3, 5, 10, 15, 20].map(num => (
            <option key={num} value={num}>Show {num} posts</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="most_liked">Most Liked</option>
        </select>

        <select
          value={filters.country}
          onChange={(e) => setFilters({...filters, country: e.target.value})}
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search blogs..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
        />
      </div>

      {loading ? (
        <p>Loading blogs...</p>
      ) : (
        <div className="blog-list">
          {/* Render the blogs based on the filter type */}
          {filters.sortBy === 'recent' && blogs.mostRecent.map(blog => (
            <div key={blog.id} className="blog-card">
              <h3>{blog.title}</h3>
              {/* <p>{blog.author_username}</p> */}
      
              <p>
  Posted by: {' '}
  <a 
    href="#" 
    onClick={(e) => handleAuthorClick(e, blog.author_id, blog.author_username)}
    className="author-link"
  >
    {blog.author_username}
  </a>
</p>



              <div className="blog-meta">
                <span>📍 {blog.country}</span>
                <span>🗓 {format(new Date(blog.visit_date), 'MMMM yyyy')}</span>
              </div>
              <p>{blog.content.substring(0, 200)}...</p>
            
              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction(blog.id, 'like')}
                  className={blog.userReaction === 'like' ? 'active' : ''}
                >
                  👍 {blog.likes || 0}
                </button>
                <button
                  onClick={() => handleReaction(blog.id, 'dislike')}
                  className={blog.userReaction === 'dislike' ? 'active' : ''}
                >
                  👎 {blog.dislikes || 0}
                </button>
              </div>
            </div>
          ))}

          {filters.sortBy === 'popular' && blogs.mostPopular.map(blog => (
            <div key={blog.id} className="blog-card">
              <h3>{blog.title}</h3>


              <p>
  Posted by: {' '}
  <a 
    href="#" 
    onClick={(e) => handleAuthorClick(e, blog.author_id, blog.author_username)}
    className="author-link"
  >
    {blog.author_username}
  </a>
</p>


              <div className="blog-meta">
                <span>📍 {blog.country}</span>
                <span>🗓 {format(new Date(blog.visit_date), 'MMMM yyyy')}</span>
              </div>
              <p>{blog.content.substring(0, 200)}...</p>

              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction(blog.id, 'like')}
                  className={blog.userReaction === 'like' ? 'active' : ''}
                >
                  👍 {blog.likes || 0}
                </button>
                <button
                  onClick={() => handleReaction(blog.id, 'dislike')}
                  className={blog.userReaction === 'dislike' ? 'active' : ''}
                >
                  👎 {blog.dislikes || 0}
                </button>
              </div>
            </div>
          ))}


        {filters.sortBy === 'most_liked' && blogs.mostLiked.map(blog => (
            <div key={blog.id} className="blog-card">
              <h3>{blog.title}</h3>


                <p>
    Posted by: {' '}
    <a 
        href="#" 
        onClick={(e) => handleAuthorClick(e, blog.author_id, blog.author_username)}
        className="author-link"
    >
        {blog.author_username}
    </a>
    </p>


              <div className="blog-meta">
                <span>📍 {blog.country}</span>
                <span>🗓 {format(new Date(blog.visit_date), 'MMMM yyyy')}</span>
              </div>
              <p>{blog.content.substring(0, 200)}...</p>

              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction(blog.id, 'like')}
                  className={blog.userReaction === 'like' ? 'active' : ''}
                >
                  👍 {blog.likes || 0}
                </button>
                <button
                  onClick={() => handleReaction(blog.id, 'dislike')}
                  className={blog.userReaction === 'dislike' ? 'active' : ''}
                >
                  👎 {blog.dislikes || 0}
                </button>
              </div>
            </div>
          ))}



          {/* Similarly render for other filters like mostLiked */}
        </div>
      )}
    </div>
  );
};

export default ViewBlog;
