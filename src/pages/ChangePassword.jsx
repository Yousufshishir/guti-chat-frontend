import { useForm } from 'react-hook-form';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ChangePassword = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      await authApi.updatePassword(data);
      setShowSuccess(true);
      toast.success('Password updated successfully!');
      reset();
      
      // টোস্ট দেখানোর জন্য ২ সেকেন্ড পর ড্যাশবোর্ডে পাঠানো হচ্ছে
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="auth-container">
      <h2>Change Password</h2>
      {showSuccess && <p style={{ color: 'green', marginBottom: '10px' }}>Password changed successfully! Redirecting...</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Current Password</label>
          <input type="password" {...register('oldPassword', { required: 'Current password is required' })} />
          {errors.oldPassword && <span>{errors.oldPassword.message}</span>}
        </div>
        <div>
          <label>New Password</label>
          <input type="password" {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} />
          {errors.newPassword && <span>{errors.newPassword.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;