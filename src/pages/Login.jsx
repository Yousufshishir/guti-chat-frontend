import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await login(data.loginId, data.password);
      toast.success('Logged in successfully');
      navigate('/dashboard'); 
    } catch (err) {
      console.error('Login Error Details:', err);
      
      // 👈 এরর মেসেজটি সরাসরি অ্যালার্টে দেখাবে
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      alert("Error: " + errorMsg); 
      
      toast.error(errorMsg);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email or Username</label>
          <input {...register('loginId', { required: 'Login ID is required' })} placeholder="Email or Username" />
          {errors.loginId && <span>{errors.loginId.message}</span>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register('password', { required: 'Password is required' })} placeholder="Password" />
          {errors.password && <span>{errors.password.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">Forgot Password?</Link> | <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Login;