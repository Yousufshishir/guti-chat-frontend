import { useState, useEffect } from 'react';
import { postApi } from '../api/postApi';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import RightSidebar from '../components/layout/RightSidebar';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoadingFeed(true);
      const response = await postApi.getFeed();
      setPosts(response.data.data || response.data);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoadingFeed(false);
    }
  };

  // 👈 পোস্ট আপডেট হলে (এডিট বা রিঅ্যাক্ট) ফিডের নির্দিষ্ট পোস্ট আপডেট করা
  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  // 👈 পোস্ট ডিলিট হলে ফিড থেকে বাদ দেওয়া
  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div>
      <Navbar />
      <div className="fb-main-container">
        <Sidebar />
        
        <main className="fb-feed-area">
          <CreatePost onPostCreated={fetchFeed} />

          {loadingFeed ? (
            <div className="fb-feed-placeholder">Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="fb-card fb-feed-placeholder">No posts yet. Be the first to post!</div>
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
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default Dashboard;