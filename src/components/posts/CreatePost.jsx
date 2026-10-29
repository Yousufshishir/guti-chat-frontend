import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { postApi } from '../../api/postApi';
import { toast } from 'react-toastify';
import { encryptText } from '../../utils/crypto'; // 👈 ইমপোর্ট করুন

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');
  const [isPosting, setIsPosting] = useState(false);
  const defaultAvatar = 'https://via.placeholder.com/150';

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);
    try {
      // 👈 পোস্ট পাঠানোর আগে এনক্রিপ্ট করে নিচ্ছি
      const encryptedContent = encryptText(postContent);

      await postApi.createPost({ 
        textContent: encryptedContent, // 👈 এনক্রিপ্টেড টেক্সট যাচ্ছে
        mediaType: 'none', 
        visibility: postVisibility 
      });
      
      setPostContent('');
      toast.success('Post created successfully!');
      onPostCreated(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    // ... আগের JSX কোড হুবহু একই থাকবে
    <div className="fb-card">
      <form onSubmit={handleCreatePost} className="fb-create-post-form">
        <div className="fb-create-post">
          <img src={user?.avatarUrl || defaultAvatar} alt="Avatar" className="fb-avatar-small" />
          <input 
            type="text" className="fb-post-input" 
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`} 
            value={postContent} onChange={(e) => setPostContent(e.target.value)} disabled={isPosting}
          />
        </div>
        <div className="fb-create-post-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <select value={postVisibility} onChange={(e) => setPostVisibility(e.target.value)} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}>
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends</option>
          </select>
          <button type="submit" className="fb-post-btn" disabled={!postContent.trim() || isPosting}>
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;