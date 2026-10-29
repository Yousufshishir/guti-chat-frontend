import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { toast } from 'react-toastify';
import PostCard from '../components/posts/PostCard';
import '../styles/profile.css';

const Profile = () => {
  const { user } = useAuth();
  
  // 👈 ১. প্রোফাইলের জন্য আলাদা ক্যাশে
  const [posts, setPosts] = useState(() => {
    const cachedPosts = localStorage.getItem(`guti_profile_${user?._id}`);
    return cachedPosts ? JSON.parse(cachedPosts) : [];
  });
  
  const [loading, setLoading] = useState(posts.length === 0);

  useEffect(() => {
    if (user?._id) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await postApi.getUserPosts(user._id);
      const newPosts = response.data.data || response.data;
      
      setPosts(newPosts);
      // 👈 ২. প্রোফাইলের ডেটা সেভ করা
      localStorage.setItem(`guti_profile_${user._id}`, JSON.stringify(newPosts)); 
    } catch (err) {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p._id === updatedPost._id) {
          return { ...p, ...updatedPost, user: p.user };
        }
        return p;
      });
      localStorage.setItem(`guti_profile_${user._id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => {
      const filtered = prev.filter((p) => p._id !== postId);
      localStorage.setItem(`guti_profile_${user._id}`, JSON.stringify(filtered));
      return filtered;
    });
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