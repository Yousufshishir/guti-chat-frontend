import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultAvatar = 'https://via.placeholder.com/150';

  useEffect(() => {
    if (user?._id) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getUserPosts(user._id);
      setPosts(response.data.data || response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  // পোস্টের সময় ফরম্যাট করার ফাংশন
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div>
      {/* Top Navbar (সিম্পল ভার্সন) */}
      <nav className="fb-navbar">
        <Link to="/dashboard" className="fb-logo">Guti Chat</Link>
        <div className="fb-nav-right">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1877f2', fontWeight: 'bold' }}>Home</Link>
        </div>
      </nav>

      <div className="profile-container">
        {/* প্রোফাইল হেডার সেকশন */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          <div className="profile-info-section">
            <img 
              src={user?.avatarUrl || defaultAvatar} 
              alt="Profile" 
              className="profile-avatar-large" 
            />
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-username">@{user?.username}</p>
            
            <p className="profile-bio">{user?.bio || 'No bio added yet.'}</p>
            
            <div className="profile-stats">
              <span><strong>{posts.length}</strong> Posts</span>
              <span><strong>{user?.friends?.length || 0}</strong> Friends</span>
            </div>

            <div className="profile-actions">
              {/* এখানে ক্লিক করলে এডিট প্রোফাইল পেজে যাবে */}
              <Link to="/edit-profile" className="btn-edit-profile">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* প্রোফাইলের পোস্ট সেকশন */}
        <div className="profile-posts-section">
          <h3 className="section-title">Your Posts</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading your posts...</div>
          ) : posts.length === 0 ? (
            <div className="fb-card" style={{ textAlign: 'center', padding: '20px', color: '#65676b' }}>
              You haven't posted anything yet.
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="fb-card">
                <div className="fb-post-header">
                  <img 
                    src={user?.avatarUrl || defaultAvatar} 
                    alt="Author" 
                    className="fb-avatar-small" 
                  />
                  <div>
                    <h4 className="fb-post-author">{user?.name}</h4>
                    <span className="fb-post-time">
                      {timeAgo(post.createdAt)} · {post.visibility === 'public' ? '🌍 Public' : '👥 Friends'}
                    </span>
                  </div>
                </div>

                <div className="fb-post-content">
                  <p>{post.textContent}</p>
                </div>

                <div className="fb-post-actions">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>↗️ Share</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;