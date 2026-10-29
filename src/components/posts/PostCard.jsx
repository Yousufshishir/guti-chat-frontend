import { useState } from 'react';
import { timeAgo } from '../../utils/timeAgo';
import { decryptText, encryptText } from '../../utils/crypto';
import { postApi } from '../../api/postApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const defaultAvatar = 'https://via.placeholder.com/150';

  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(decryptText(post.textContent));
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [isSaving, setIsSaving] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const isOwner = post.user?._id === user?._id;

  // ১. ডিলিট লজিক
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postApi.deletePost(post._id);
      toast.success('Post deleted successfully');
      onPostDeleted(post._id);
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  // ২. এডিট সেভ লজিক
  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const encryptedContent = editContent.trim() ? encryptText(editContent) : '';
      const res = await postApi.editPost(post._id, {
        textContent: encryptedContent,
        visibility: editVisibility,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
      });
      toast.success('Post updated!');
      setIsEditing(false);
      onPostUpdated(res.data.data); 
    } catch (err) {
      toast.error('Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  // ৩. ভিজিবিলিটি চেঞ্জ লজিক (সরাসরি সিলেক্ট করার জন্য)
  const handleSetVisibility = async (newVisibility) => {
    if (post.visibility === newVisibility) {
      setShowOptions(false);
      return;
    }
    try {
      const res = await postApi.togglePostVisibility(post._id);
      toast.success(res.data.message);
      onPostUpdated(res.data.data);
      setShowOptions(false);
    } catch (err) {
      toast.error('Failed to change visibility');
    }
  };

  // ৪. রিঅ্যাক্ট লজিক
  const handleReact = async (reactionType) => {
    try {
      const res = await postApi.reactToPost(post._id, reactionType);
      onPostUpdated(res.data.data);
      setShowReactions(false);
    } catch (err) {
      toast.error('Failed to react');
    }
  };

  const userReaction = post.reactions?.find((r) => r.user === user?._id || r.user?._id === user?._id);
  const reactionIcons = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };

  return (
    <div className="fb-card">
      <div className="fb-post-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <img src={post.user?.avatarUrl || defaultAvatar} alt="Author" className="fb-avatar-small" />
          <div>
            <h4 className="fb-post-author">{post.user?.name || 'Deleted User'}</h4>
            <span className="fb-post-time">
              {timeAgo(post.createdAt)} · {post.visibility === 'public' ? '🌍 Public' : '👥 Friends'}
            </span>
          </div>
        </div>

        {/* 👈 ৩-ডট মেনু */}
        {isOwner && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowOptions(!showOptions)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>⋮</button>
            {showOptions && (
              <div className="post-dropdown">
                <div onClick={() => { setIsEditing(true); setShowOptions(false); }}>✏️ Edit Post</div>
                
                {/* 👈 নতুন: সরাসরি ভিজিবিলিটি সিলেক্ট করার অপশন */}
                <div onClick={() => handleSetVisibility('public')} style={{ color: post.visibility === 'public' ? '#1877f2' : '#000' }}>
                  🌍 Make Public {post.visibility === 'public' && '✓'}
                </div>
                <div onClick={() => handleSetVisibility('friends')} style={{ color: post.visibility === 'friends' ? '#1877f2' : '#000' }}>
                  👥 Make Friends Only {post.visibility === 'friends' && '✓'}
                </div>
                
                <div onClick={handleDelete} style={{ color: 'red' }}>🗑️ Delete Post</div>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="fb-post-content">
          <textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' }}
          />
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <select value={editVisibility} onChange={(e) => setEditVisibility(e.target.value)} style={{ padding: '5px', borderRadius: '5px' }}>
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends</option>
            </select>
            <button onClick={() => setIsEditing(false)} className="fb-post-btn" style={{ backgroundColor: '#ccc', color: '#000' }}>Cancel</button>
            <button onClick={handleSaveEdit} className="fb-post-btn" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      ) : (
        <div className="fb-post-content">
          {post.textContent && <p style={{ marginBottom: post.mediaUrl ? '10px' : '0' }}>{decryptText(post.textContent)}</p>}
          
          {post.mediaUrl && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              {post.mediaType === 'image' ? (
                <img src={post.mediaUrl} alt="Post Media" style={{ maxHeight: '400px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} />
              ) : post.mediaType === 'video' ? (
                <video src={post.mediaUrl} controls style={{ maxHeight: '400px', maxWidth: '100%', borderRadius: '8px' }} />
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* পোস্ট অ্যাকশনস */}
      <div className="fb-post-actions" style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        
        {/* 👈 রিঅ্যাকশন কন্টেইনার (হোভার ফিক্স) */}
        <div 
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: userReaction ? '#1877f2' : '#65676b', padding: '5px 15px', borderRadius: '5px' }}
            onClick={() => handleReact(userReaction?.type === 'like' ? 'like' : 'like')} 
          >
            {userReaction ? reactionIcons[userReaction.type] : '👍'} {userReaction ? userReaction.type.charAt(0).toUpperCase() + userReaction.type.slice(1) : 'Like'}
            {post.reactions?.length > 0 && <span style={{ marginLeft: '5px', fontSize: '12px' }}>({post.reactions.length})</span>}
          </div>

          {/* 👈 রিঅ্যাকশন পপআপ */}
          {showReactions && (
            <div className="reactions-popup">
              {Object.keys(reactionIcons).map((type) => (
                <span key={type} onClick={() => handleReact(type)}>{reactionIcons[type]}</span>
              ))}
            </div>
          )}
        </div>

        <span>💬 Comment</span>
        <span>↗️ Share</span>
      </div>
    </div>
  );
};

export default PostCard;