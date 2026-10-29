import { useState, useEffect } from 'react';
import { postApi } from '../api/postApi';
import { toast } from 'react-toastify';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import RightSidebar from '../components/layout/RightSidebar';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import SkeletonPostCard from '../components/posts/SkeletonPostCard';
import '../styles/dashboard.css';

const Dashboard = () => {
  // 👈 ১. localStorage থেকে আগের ডেটা রিড করা (যদি থাকে)
  const [posts, setPosts] = useState(() => {
    const cachedPosts = localStorage.getItem('guti_feed');
    return cachedPosts ? JSON.parse(cachedPosts) : [];
  });
  
  // 👈 ২. যদি ক্যাশে ডেটা থাকে, তবে loading false হবে (সাথে সাথে পোস্ট দেখাবে)
  const [loadingFeed, setLoadingFeed] = useState(posts.length === 0);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await postApi.getFeed();
      const newPosts = response.data.data || response.data;
      
      setPosts(newPosts);
      // 👈 ৩. নতুন ডেটা localStorage-এ সেভ করে রাখা
      localStorage.setItem('guti_feed', JSON.stringify(newPosts)); 
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoadingFeed(false);
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
      localStorage.setItem('guti_feed', JSON.stringify(updated)); // ক্যাশে আপডেট
      return updated;
    });
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => {
      const filtered = prev.filter((p) => p._id !== postId);
      localStorage.setItem('guti_feed', JSON.stringify(filtered)); // ক্যাশে আপডেট
      return filtered;
    });
  };

  return (
    <div>
      <Navbar />
      <div className="fb-main-container">
        <Sidebar />
        
        <main className="fb-feed-area">
          <CreatePost onPostCreated={fetchFeed} />

          {/* 👈 ৪. Skeleton তখনই দেখাবে যদি আদৌ কোনো ক্যাশে বা ডেটা না থাকে */}
          {loadingFeed ? (
            <>
              <SkeletonPostCard />
              <SkeletonPostCard />
            </>
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