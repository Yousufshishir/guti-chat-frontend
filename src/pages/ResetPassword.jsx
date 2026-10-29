import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react'; 
import { tokenStorage } from '../utils/tokenStorage'; 

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 👈 LocalStorage থেকে ইমেইল রিড করা হচ্ছে (রিফ্রেশ দিলেও যাতে ইমেইল থাকে)
  const prefilledEmail = location.state?.email || localStorage.getItem('reset_email') || '';

  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');
  
  // 👈 LocalStorage থেকে বাকি থাকা টাইম ক্যালকুলেট করা হচ্ছে
  const [timeLeft, setTimeLeft] = useState(() => {
    const expireTime = localStorage.getItem('otp_expire_time');
    if (expireTime) {
      const remainingSeconds = Math.floor((Number(expireTime) - Date.now()) / 1000);
      return remainingSeconds > 0 ? remainingSeconds : 0;
    }
    return 0; // যদি কোনো টাইম না থাকে তবে ০
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: prefilledEmail } });

  useEffect(() => {
    if (timeLeft <= 0) {
      // টাইম শেষ হলে LocalStorage থেকে মুছে দেব
      localStorage.removeItem('otp_expire_time');
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const onVerifyOtp = async (data) => {
    if (timeLeft === 0) {
      return toast.error('OTP has expired. Please request a new one.');
    }

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
      
      tokenStorage.clearTokens();
      
      // 👈 পাসওয়ার্ড সফলভাবে রিসেট হলে LocalStorage ক্লিয়ার করে দেব
      localStorage.removeItem('reset_email');
      localStorage.removeItem('otp_expire_time');

      toast.success('Password reset successful. Please login with new password.');
      
      setTimeout(() => {
        window.location.href = '/login'; 
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
            <input 
              {...register('otp', { required: 'OTP is required' })} 
              placeholder="Enter 6-digit OTP" 
              disabled={timeLeft === 0} 
            />
            {errors.otp && <span>{errors.otp.message}</span>}
            
            <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 'bold', color: timeLeft > 0 ? '#28a745' : '#dc3545' }}>
              {timeLeft > 0 ? (
                <span>Time remaining: {formatTime(timeLeft)}</span>
              ) : (
                <span>OTP Expired! Please request a new one.</span>
              )}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || timeLeft === 0} 
            style={{ backgroundColor: timeLeft === 0 ? '#ccc' : '#007bff' }}
          >
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
      <div className="auth-links" style={{ marginTop: '15px' }}>
        <Link to="/login">Back to Login</Link>
        {timeLeft === 0 && (
          <span style={{ marginLeft: '10px' }}>
            | <Link to="/forgot-password" style={{ color: '#dc3545' }}>Request New OTP</Link>
          </span>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;