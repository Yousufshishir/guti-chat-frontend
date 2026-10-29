import { timeAgo } from '../../utils/timeAgo';
import { decryptText } from '../../utils/crypto'; // 👈 ইমপোর্ট করুন

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
        {/* 👈 এখানে ডিক্রিপ্ট করে দেখানো হচ্ছে */}
        <p>{decryptText(post.textContent)}</p>
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