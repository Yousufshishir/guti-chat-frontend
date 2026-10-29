import { useState, useMemo } from 'react';
import { timeAgo } from '../../utils/timeAgo';
import { decryptText, encryptText } from '../../utils/crypto';
import { postApi } from '../../api/postApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import React from 'react'; // 👈 React.memo এর জন্য

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const defaultAvatar = 'https://via.placeholder.com/150';

  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(useMemo(() => decryptText(post.textContent), [post.textContent]));
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [isSaving, setIsSaving] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // 👈 লোকাল স্টেট (ইনস্ট্যান্ট আপডেটের জন্য)
  const [localReactions, setLocalReactions] = useState(post.reactions || []);
  const [localVisibility, setLocalVisibility] = useState(post.visibility);

  const isOwner = post.user?._id === user?._id;

  // 👈 ১. ডিক্রিপশন মেমোাইজ করা হলো (বার বার ডিক্রিপ্ট হবে না)
  const decryptedText = useMemo(() => {
    return post.textContent ? decryptText(post.textContent) : '';
  }, [post.textContent]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postApi.deletePost(post._id);
      toast.success('Post deleted');
      onPostDeleted(post._id);
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

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
      setLocalVisibility(editVisibility); // লোকাল স্টেট আপডেট
      onPostUpdated(res.data.data); 
    } catch (err) {
      toast.error('Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetVisibility = async (newVisibility) => {
    if (localVisibility === newVisibility) {
      setShowOptions(false);
      return;
    }
    setLocalVisibility(newVisibility); // 👈 ইনস্ট্যান্ট আপডেট
    setShowOptions(false);
    try {
      const res = await postApi.togglePostVisibility(post._id);
      onPostUpdated(res.data.data);
    } catch (err) {
      setLocalVisibility(post.visibility); // ফেইল করলে রিভার্ট
      toast.error('Failed to change visibility');
    }
  };

  // 👈 ২. Optimistic UI (ইনস্ট্যান্ট রিঅ্যাকশন)
  const handleReact = async (reactionType) => {
    setShowReactions(false);
    
    // আগের রিঅ্যাকশন বের করা
    const existingIndex = localReactions.findIndex(r => (r.user === user?._id || r.user?._id === user?._id));
    let newReactions = [...localReactions];

    if (existingIndex > -1) {
      if (newReactions[existingIndex].type === reactionType) {
        newReactions.splice(existingIndex, 1); // রিমুভ
      } else {
        newReactions[existingIndex] = { ...newReactions[existingIndex], type: reactionType }; // চেঞ্জ
      }
    } else {
      newReactions.push({ user: { _id: user?._id, name: user?.name }, type: reactionType }); // নতুন
    }
    setLocalReactions(newReactions); // 👈 সাথে সাথে স্ক্রিনে আপডেট হবে

    try {
      const res = await postApi.reactToPost(post._id, reactionType);
      onPostUpdated(res.data.data);
    } catch (err) {
      setLocalReactions(post.reactions); // সার্ভার ফেইল করলে আগের অবস্থায় ফিরবে
      toast.error('Failed to react');
    }
  };

  const userReaction = localReactions.find((r) => r.user === user?._id || r.user?._id === user?._id);
  const reactionIcons = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };

  return (
    <div className="fb-card">
      <div className="fb-post-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <img src={post.user?.avatarUrl || defaultAvatar} alt="Author" className="fb-avatar-small" loading="lazy" />
          <div>
            <h4 className="fb-post-author">{post.user?.name || 'Deleted User'}</h4>
            <span className="fb-post-time">
              {timeAgo(post.createdAt)} · {localVisibility === 'public' ? '🌍 Public' : '👥 Friends'}
            </span>
          </div>
        </div>

        {isOwner && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowOptions(!showOptions)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>⋮</button>
            {showOptions && (
              <div className="post-dropdown">
                <div onClick={() => { setIsEditing(true); setShowOptions(false); }}>✏️ Edit Post</div>
                <div onClick={() => handleSetVisibility('public')} style={{ color: localVisibility === 'public' ? '#1877f2' : '#000' }}>
                  🌍 Make Public {localVisibility === 'public' && '✓'}
                </div>
                <div onClick={() => handleSetVisibility('friends')} style={{ color: localVisibility === 'friends' ? '#1877f2' : '#000' }}>
                  👥 Make Friends Only {localVisibility === 'friends' && '✓'}
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
          {decryptedText && <p style={{ marginBottom: post.mediaUrl ? '10px' : '0' }}>{decryptedText}</p>}
          
          {post.mediaUrl && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              {post.mediaType === 'image' ? (
                <img src={post.mediaUrl} alt="Post Media" style={{ maxHeight: '400px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} loading="lazy" />
              ) : post.mediaType === 'video' ? (
                <video src={post.mediaUrl} controls style={{ maxHeight: '400px', maxWidth: '100%', borderRadius: '8px' }} />
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className="fb-post-actions" style={{ position: 'relative', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
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
            {localReactions?.length > 0 && <span style={{ marginLeft: '5px', fontSize: '12px' }}>({localReactions.length})</span>}
          </div>

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

// 👈 ৩. React.memo দিয়ে কম্পোনেন্ট অপটিমাইজ করা হলো
export default React.memo(PostCard, (prevProps, nextProps) => {
  return prevProps.post.updatedAt === nextProps.post.updatedAt;
});