import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react'; // 👈 useEffect যোগ করা হলো
import { tokenStorage } from '../utils/tokenStorage'; 

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledEmail = location.state?.email || '';
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');
  
  // 👈 নতুন যোগ করা হলো: ৫ মিনিট (৩০০ সেকেন্ড) টাইমার স্টেট
  const [timeLeft, setTimeLeft] = useState(300); 

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: prefilledEmail } });

  // 👈 নতুন যোগ করা হলো: টাইমার কাউন্টডাউন লজিক
  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // মিনিট:সেকেন্ড ফরম্যাটে দেখানোর ফাংশন
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
            {/* আপনার আগের কোডের মতোই এডিটেবল রাখা হয়েছে */}
            <input type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <span>{errors.email.message}</span>}
          </div>
          <div>
            <label>OTP</label>
            <input 
              {...register('otp', { required: 'OTP is required' })} 
              placeholder="Enter 6-digit OTP" 
              disabled={timeLeft === 0} // 👈 টাইমার শেষ হলে ইনপুট বন্ধ হবে
            />
            {errors.otp && <span>{errors.otp.message}</span>}
            
            {/* 👈 টাইমার ডিসপ্লে */}
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
            disabled={isSubmitting || timeLeft === 0} // 👈 টাইমার শেষ হলে বাটন ডিজেবল
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
        
        {/* 👈 টাইমার শেষ হলে নতুন OTP চাওয়ার লিংক দেখাবে */}
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