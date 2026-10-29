import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const defaultAvatar = 'https://via.placeholder.com/150';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fb-navbar">
      <Link to="/dashboard" className="fb-logo">Guti Chat</Link>
      <input type="text" className="fb-search" placeholder="Search Guti Chat..." />
      <div className="fb-nav-right">
        <img 
          src={user?.avatarUrl || defaultAvatar} 
          alt="Profile" 
          className="fb-avatar-small" 
          onClick={() => navigate('/profile')}
        />
        <button onClick={handleLogout} className="fb-logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;