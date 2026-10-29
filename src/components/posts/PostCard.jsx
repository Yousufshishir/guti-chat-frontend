import { timeAgo } from '../../utils/timeAgo';
import { decryptText } from '../../utils/crypto';

const PostCard = ({ post }) => {
  const defaultAvatar = 'https://via.placeholder.com/150';

  return (
    <div className="fb-card">
      <div className="fb-post-header">
        <img src={post.user?.avatarUrl || defaultAvatar} alt="Author" className="fb-avatar-small" />
        <div>
          <h4 className="fb-post-author">{post.user?.name || 'Deleted User'}</h4>
          <span className="fb-post-time">
            {timeAgo(post.createdAt)} · {post.visibility === 'public' ? '🌍 Public' : '👥 Friends'}
          </span>
        </div>
      </div>

      <div className="fb-post-content">
        {/* টেক্সট থাকলে ডিক্রিপ্ট করে দেখাবে */}
        {post.textContent && <p style={{ marginBottom: post.mediaUrl ? '10px' : '0' }}>{decryptText(post.textContent)}</p>}

        {/* 👈 নতুন: পোস্টে ছবি বা ভিডিও থাকলে তা দেখাবে */}
        {post.mediaUrl && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            {post.mediaType === 'image' ? (
              <img 
                src={post.mediaUrl} 
                alt="Post Media" 
                style={{ maxHeight: '400px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }} 
              />
            ) : post.mediaType === 'video' ? (
              <video 
                src={post.mediaUrl} 
                controls 
                style={{ maxHeight: '400px', maxWidth: '100%', borderRadius: '8px' }} 
              />
            ) : null}
          </div>
        )}
      </div>

      <div className="fb-post-actions">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>↗️ Share</span>
      </div>
    </div>
  );
};

export default PostCard;