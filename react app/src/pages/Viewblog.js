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
          setBlogs(data); 
          if (country) {
          }
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
    
    console.log(`Author clicked - ID: ${authorId}, Username: ${username}`);
    
    
    navigate(`/authors/${authorId}/${username}`);
  };

  const handleReaction = async (blogId, reaction) => {
    let isliked = 0;
    // window.alert(reaction)
    if (reaction === 'like') {
      isliked = 1;
    }
    else {
      isliked = 2;
    }

    if (!user) return;
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
const data = await response.json();
 if (data.reactionadded == 0){
  isliked = 0 
  // window.alert(isliked)
 }
      setBlogs((prevBlogs) => {
        const updatedBlogs = { ...prevBlogs };
      
        const listKey = 
          filters.sortBy === 'recent' ? 'mostRecent' :
          filters.sortBy === 'popular' ? 'mostPopular' :
          'mostLiked';
      
        updatedBlogs[listKey] = updatedBlogs[listKey].map(blog => {
          if (blog.id === blogId) {
          //  window.alert(data.likes)
          //  window.alert(data.dislikes)      
          //  window.alert(blog.dislikes.length + 1)
          //  window.alert(blog.dislikes.length)
            return {
              
              ...blog,
              userReaction: reaction,
            likes:data.likes,
              dislikes: data.dislikes,
              likestatus:isliked,
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
class = "search-input"
  type="text"
  placeholder="Search blogs..."
  value={filters.searchQuery}
  onChange={(e) =>
    setFilters({ ...filters, searchQuery: e.target.value })
  }
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
    }
  }}
/>

      </div>

      {loading ? (
        <p>Loading blogs...</p>
      ) : (




        
        <div className="blog-list">





{blogs.countrydata && Object.keys(blogs.countrydata).length > 0 ? (
  <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '8px', maxWidth: '400px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
    {blogs.countrydata.flag ? (
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <img
          src={blogs.countrydata.flag}
          alt={`${blogs.countrydata.name || 'Country'} flag`}
          style={{ width: '120px', height: 'auto', borderRadius: '4px' }}
        />
      </div>
    ) : null}

    {blogs.countrydata.currency && typeof blogs.countrydata.currency === 'object' ? (
      <p>
        <strong>Currency:</strong>{' '}
        {Object.values(blogs.countrydata.currency)
          .map((curr) => `${curr?.name || 'Unknown'} (${curr?.symbol || '-'})`)
          .join(', ')}
      </p>
    ) : null}

    {blogs.countrydata.languages && typeof blogs.countrydata.languages === 'object' && Object.keys(blogs.countrydata.languages).length > 0 ? (
      <p>
        <strong>Languages:</strong>{' '}
        {Object.values(blogs.countrydata.languages).join(', ')}
      </p>
    ) : null}

    {blogs.countrydata.capital && blogs.countrydata.capital.length > 0 ? (
      <p style={{ marginTop: '15px' }}>
        <strong>Capital:</strong> {blogs.countrydata.capital[0] || 'N/A'}
      </p>
    ) : null}
  </div>
) : (
  <p style={{ textAlign: 'center', color: 'gray' }}></p>
)}



          {filters.sortBy === 'recent' && blogs.mostRecent.map(blog => (
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
              <p>{blog.content}</p>
            
              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction(blog.id, 'like')}
 className={`${
                blog.userReaction === 'like' ? 'active' : ''
              } ${blog.likestatus === 1 ? 'disabled' : 'enabled'}`}                  >
                  👍 {blog.likes.length || 0}
                </button>
                <button
                  onClick={() => handleReaction(blog.id, 'dislike')}
        className={`${
                blog.userReaction === 'dislike' ? 'active' : ''
              } ${blog.likestatus === 2 ? 'disabled' : ''}`}                >
                  👎 {blog.dislikes.length || 0}
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
              <p>{blog.content}</p>

              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction(blog.id, 'like')}
        className={`${
                blog.userReaction === 'like' ? 'active' : ''
              } ${blog.likestatus === 1 ? 'disabled' : 'enabled'}`}                >
                  👍 {blog.likes.length || 0}
                </button>
                <button
                  onClick={() => handleReaction(blog.id, 'dislike')}
        className={`${
                blog.userReaction === 'dislike' ? 'active' : ''
              } ${blog.likestatus === 2 ? 'disabled' : 'enabled'}`}                >
                  👎 {blog.dislikes.length || 0}
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
              <p>{blog.content}</p>

              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction(blog.id, 'like')}
                         className={`${
                blog.userReaction === 'like' ? 'active' : ''
              } ${blog.likestatus === 1 ? 'disabled' : 'enabled'}`}
                >
                  👍 {blog.likes.length || 0}
                </button>
                <button
                  onClick={() => handleReaction(blog.id, 'dislike')}
                         className={`${
                blog.userReaction === 'dislike' ? 'active' : ''
              } ${blog.likestatus === 2 ? 'disabled' : 'enabled'}`}
                >
                  👎 {blog.dislikes.length || 0}
                </button>
              </div>
            </div>
          ))}



        </div>
      )}
    </div>
  );
};

export default ViewBlog;
// 