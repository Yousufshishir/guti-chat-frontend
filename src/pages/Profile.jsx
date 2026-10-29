import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { toast } from 'react-toastify';
import PostCard from '../components/posts/PostCard';
import Navbar from '../components/layout/Navbar'; // 👈 নতুন
import Sidebar from '../components/layout/Sidebar'; // 👈 নতুন
import '../styles/profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState(() => {
    const cachedPosts = localStorage.getItem(`guti_profile_${user?._id}`);
    return cachedPosts ? JSON.parse(cachedPosts) : [];
  });
  const [loading, setLoading] = useState(posts.length === 0);
  
  // 👈 মোবাইল মেনুর স্টেট
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      localStorage.setItem(`guti_profile_${user._id}`, JSON.stringify(newPosts)); 
    } catch (err) {
      toast.error('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => {
      const updated = prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost, user: p.user } : p));
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
      {/* 👈 Dashboard এর মতো Navbar যুক্ত করা হলো */}
      <Navbar toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="fb-main-container">
        {/* 👈 Sidebar যুক্ত করা হলো */}
        <Sidebar isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />
        
        <main className="fb-feed-area" style={{ width: '50%', margin: '0 auto' }}>
          <div className="profile-container" style={{ marginTop: '10px', maxWidth: '100%' }}>
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
                  <PostCard key={post._id} post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;