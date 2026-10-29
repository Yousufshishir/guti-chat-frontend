import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const RightSidebar = () => {
  const { user } = useAuth();
  const defaultAvatar = 'https://via.placeholder.com/150';

  return (
    <aside className="fb-right-sidebar">
      <div className="fb-card">
        <Link to="/profile" className="fb-profile-card">
          <img src={user?.avatarUrl || defaultAvatar} alt="Profile" className="fb-avatar-large" />
          <div className="fb-user-info">
            <h3>{user?.name}</h3>
            <p>@{user?.username}</p>
          </div>
        </Link>
        <div className="fb-divider"></div>
        <div className="fb-user-info">
          <p><strong>Email:</strong> <br/> {user?.email}</p>
          <p style={{ marginTop: '10px' }}><strong>Bio:</strong> <br/> {user?.bio || 'No bio added yet.'}</p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;