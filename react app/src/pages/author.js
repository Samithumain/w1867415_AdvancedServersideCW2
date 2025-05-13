import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AuthorProfile = () => {
  const { user } = useAuth();
  const { authorId,username } = useParams();
  const navigate = useNavigate();

  const [author, setAuthor] = useState(null);
  const [blogs, setBlogs] = useState({ mostRecent: [], mostPopular: [], mostLiked: [] });
  const [isFollowing, setIsFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    postCount: 5,
    sortBy: 'recent'
  });

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/author/fetch?authorID=${authorId}&email=${encodeURIComponent(user.email)}`,
          {
            method: 'GET',
            headers: {
              'authorization': `Bearer ${user.token}`
            }
          }
        );

        const result = await response.json();
        setAuthor(username);
        setBlogs({
          mostRecent: result.mostRecent || [],
          mostPopular: result.mostPopular || [],
          mostLiked: result.mostLiked || []
          
        });
        setIsFollowing(result.isFollowing);
        // window.alert(result.isFollowing ? "Following" : "Not Following"+"   "+  isFollowing);
      } catch (error) {
        console.error('Error loading author data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [authorId, user.token, user.email]);

  const handleFollowToggle = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/author/follow?email=${encodeURIComponent(user.email)}`,
        {
          method: isFollowing ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            followerId: user.id,
            authorId
          })
        }
      );

      if (response.ok) {

        setIsFollowing(prev => prev ? 0 : 1);
        // window.alert(isFollowing ? "Unfollowed" : "Followed");
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
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



  if (loading) return <div>Loading author profile...</div>;
  if (!author) return <div>Author not found</div>;

  const selectedBlogs = blogs[
    filters.sortBy === 'recent'
      ? 'mostRecent'
      : filters.sortBy === 'popular'
      ? 'mostPopular'
      : 'mostLiked'
  ];

  return (
    <div className="blog-container">
      <div className="author-header">
        <h1>{author}</h1>
        <button
          onClick={handleFollowToggle}
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      </div>

      <div className="filter-section">
        <select
          value={filters.postCount}
          onChange={(e) => setFilters({ ...filters, postCount: Number(e.target.value) })}
        >
          {[3, 5, 10, 15, 20].map(num => (
            <option key={num} value={num}>Show {num} posts</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="mostLiked">Most Liked</option>
        </select>
      </div>

      <div className="author-blogs">
        {selectedBlogs.length === 0 ? (
          <p>No blogs found for this author</p>
        ) : (
          selectedBlogs.slice(0, filters.postCount).map(blog => (
            <div key={blog.id} className="blog-card">
              <h3>{blog.title}</h3>
              <div className="blog-meta">
                <span>📍 {blog.country}</span>
                <span>🗓 {format(new Date(blog.visit_date), 'MMMM yyyy')}</span>
              </div>
              <p>{blog.content.substring(0, 200)}...</p>
              <div className="reaction-buttons">
                <button
                  onClick={() => handleReaction(blog.id, 'like')}
                        className={`${
                blog.userReaction === 'like' ? 'active' : ''
              } ${blog.likestatus === 1 ? 'disabled' : ''}`}
                >
                  👍 {blog.likes.length || 0}
                </button>
                <button
                  onClick={() => handleReaction(blog.id, 'dislike')}
                            
                              className={`${
                blog.userReaction === 'dislike' ? 'active' : ''
              } ${blog.likestatus === 2 ? 'disabled' : ''}`}

                >
                  👎 {blog.dislikes.length || 0}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;
