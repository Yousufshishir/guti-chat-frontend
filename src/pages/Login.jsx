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
      // e.preventDefault() react-hook-form নিজেই হ্যান্ডেল করে
      await login(data.loginId, data.password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err.response || err);
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email or Username</label>
          <input {...register('loginId', { required: 'Login ID is required' })} />
          {errors.loginId && <span>{errors.loginId.message}</span>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register('password', { required: 'Password is required' })} />
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