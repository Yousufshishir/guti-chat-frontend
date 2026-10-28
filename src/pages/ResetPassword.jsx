import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { tokenStorage } from '../utils/tokenStorage'; // 👈 টোকেন ক্লিয়ার করার জন্য

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledEmail = location.state?.email || '';
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: prefilledEmail } });

  const onVerifyOtp = async (data) => {
    try {
      await authApi.verifyOtp(data.email, data.otp);
      setVerifiedOtp(data.otp);
      setOtpVerified(true);
      toast.success('OTP verified. Now set new password.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const onResetPassword = async (data) => {
    try {
      await authApi.resetPassword(data.email, verifiedOtp, data.newPassword);
      
      // 👈 সেশন ক্লিয়ার করা হচ্ছে (যদি ড্যাশবোর্ড থেকে রিসেট করা হয়)
      tokenStorage.clearTokens();
      
      toast.success('Password reset successful. Please login with new password.');
      
      // টোস্ট দেখানোর জন্য একটু ডিলে দিয়ে রিডাইরেক্ট করা হচ্ছে
      setTimeout(() => {
        window.location.href = '/login'; // হার্ড রিলোড দিলে Auth স্টেট একদম ক্লিয়ার হয়ে যায়
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {!otpVerified ? (
        <form onSubmit={handleSubmit(onVerifyOtp)}>
          <div>
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <span>{errors.email.message}</span>}
          </div>
          <div>
            <label>OTP</label>
            <input {...register('otp', { required: 'OTP is required' })} placeholder="Enter 6-digit OTP" />
            {errors.otp && <span>{errors.otp.message}</span>}
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onResetPassword)}>
          <input type="hidden" {...register('email')} value={getValues('email')} />
          <div>
            <label>New Password</label>
            <input
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Minimum 6 characters required' },
              })}
            />
            {errors.newPassword && <span>{errors.newPassword.message}</span>}
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default ResetPassword;