import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { toast } from 'react-toastify';
import PostCard from '../components/posts/PostCard'; // 👈 PostCard কম্পোনেন্ট ইমপোর্ট করুন
import '../styles/profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div>
      <nav className="fb-navbar">
        <Link to="/dashboard" className="fb-logo">Guti Chat</Link>
        <div className="fb-nav-right">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1877f2', fontWeight: 'bold' }}>Home</Link>
        </div>
      </nav>

      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          <div className="profile-info-section">
            <img src={user?.avatarUrl || 'https://via.placeholder.com/150'} alt="Profile" className="profile-avatar-large" />
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-username">@{user?.username}</p>
            <p className="profile-bio">{user?.bio || 'No bio added yet.'}</p>
            <div className="profile-stats">
              <span><strong>{posts.length}</strong> Posts</span>
            </div>
            <div className="profile-actions">
              <Link to="/edit-profile" className="btn-edit-profile">Edit Profile</Link>
            </div>
          </div>
        </div>

        <div className="profile-posts-section">
          <h3 className="section-title">Your Posts</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : posts.length === 0 ? (
            <div className="fb-card" style={{ textAlign: 'center', padding: '20px', color: '#65676b' }}>No posts yet.</div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onPostUpdated={handlePostUpdated} 
                onPostDeleted={handlePostDeleted} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;