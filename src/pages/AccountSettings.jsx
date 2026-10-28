import { useState } from 'react';
import { userApi } from '../api/userApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AccountSettings = () => {
  const [isDeletionRequested, setIsDeletionRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleRequestDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete your account? You will have 24 hours to cancel this.')) return;
    
    setLoading(true);
    try {
      await userApi.requestDeletion();
      setIsDeletionRequested(true);
      toast.warning('Account deletion requested. You have 24 hours to cancel.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request deletion');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setLoading(true);
    try {
      await userApi.cancelDeletion();
      setIsDeletionRequested(false);
      toast.success('Account deletion cancelled successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel deletion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '500px' }}>
      <h2>Account Settings</h2>
      
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ffcccc', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
        <h3 style={{ color: '#cc0000', marginBottom: '10px' }}>Danger Zone</h3>
        <p style={{ fontSize: '14px', marginBottom: '15px' }}>
          Once you request deletion, your account will be scheduled for deletion in 24 hours. You can cancel this anytime within 24 hours.
        </p>
        
        {!isDeletionRequested ? (
          <button 
            onClick={handleRequestDeletion} 
            disabled={loading}
            style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px', width: '100%' }}
          >
            {loading ? 'Requesting...' : 'Request Account Deletion'}
          </button>
        ) : (
          <button 
            onClick={handleCancelDeletion} 
            disabled={loading}
            style={{ backgroundColor: '#28a745', color: 'white', padding: '10px', width: '100%' }}
          >
            {loading ? 'Cancelling...' : 'Cancel Deletion Request'}
          </button>
        )}
      </div>
      
      <button onClick={() => navigate('/dashboard')} style={{ marginTop: '20px', backgroundColor: '#6c757d' }}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default AccountSettings;