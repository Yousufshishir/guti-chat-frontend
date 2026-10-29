import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, closeMenu }) => { // 👈 প্রপস হিসেবে স্টেট নিন
  const { user } = useAuth();
  const defaultAvatar = 'https://via.placeholder.com/150';

  return (
    <>
      {/* 👈 মোবাইলে মেনু ওপেন হলে পেছনের অংশ কালো (Overlay) হবে */}
      {isOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}

      <aside className={`fb-left-sidebar ${isOpen ? 'open' : ''}`}>
        {/* 👈 মোবাইলে ক্লোজ করার বাটন */}
        <div className="mobile-close-btn" onClick={closeMenu}>✕</div>

        <Link to="/dashboard" className="fb-menu-item" onClick={closeMenu}>
          <span className="menu-icon">🏠</span> Home
        </Link>
        <Link to="/profile" className="fb-menu-item" onClick={closeMenu}>
          <img src={user?.avatarUrl || defaultAvatar} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' }} /> 
          My Profile
        </Link>
        <Link to="/edit-profile" className="fb-menu-item" onClick={closeMenu}>
          <span className="menu-icon">👤</span> Edit Profile
        </Link>
        <Link to="/change-password" className="fb-menu-item" onClick={closeMenu}>
          <span className="menu-icon">🔒</span> Change Password
        </Link>
        <Link to="/forgot-password" className="fb-menu-item" onClick={closeMenu}>
          <span className="menu-icon">🔑</span> Forget Password (OTP)
        </Link>
        <div className="fb-divider"></div>
        <Link to="/account-settings" className="fb-menu-item fb-danger-text" onClick={closeMenu}>
          <span className="menu-icon">⚠️</span> Account Settings
        </Link>
      </aside>
    </>
  );
};

export default Sidebar;