import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useAuth();
  const defaultAvatar = 'https://via.placeholder.com/150';

  return (
    <aside className="fb-left-sidebar">
      <Link to="/dashboard" className="fb-menu-item">
        <span className="menu-icon">🏠</span> Home
      </Link>
      <Link to="/profile" className="fb-menu-item">
        <img src={user?.avatarUrl || defaultAvatar} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} /> 
        My Profile
      </Link>
      <Link to="/edit-profile" className="fb-menu-item">
        <span className="menu-icon">👤</span> Edit Profile
      </Link>
      <Link to="/change-password" className="fb-menu-item">
        <span className="menu-icon">🔒</span> Change Password
      </Link>
      <Link to="/forgot-password" className="fb-menu-item">
        <span className="menu-icon">🔑</span> Forget Password (OTP)
      </Link>
      <div className="fb-divider"></div>
      <Link to="/account-settings" className="fb-menu-item fb-danger-text">
        <span className="menu-icon">⚠️</span> Account Settings
      </Link>
    </aside>
  );
};

export default Sidebar;