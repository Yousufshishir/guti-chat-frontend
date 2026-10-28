import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Welcome, {user?.name}</h1>
      {user?.avatarUrl && <img src={user.avatarUrl} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />}
      <p>Email: {user?.email}</p>
      <p>Bio: {user?.bio || 'No bio yet'}</p>
      
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
        
        <Link to="/edit-profile" style={{ color: '#007bff' }}>Edit Profile Info</Link>
        <Link to="/change-password" style={{ color: '#007bff' }}>Change Password</Link>
        <Link to="/forgot-password" style={{ color: '#ff9800' }}>Forgot Password (Reset via OTP)</Link>
        <Link to="/account-settings" style={{ color: '#dc3545', marginTop: '20px' }}>Account Settings (Delete Account)</Link>
      </div>
    </div>
  );
};

export default Dashboard;