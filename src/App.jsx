import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import AccountSettings from './pages/AccountSettings';
import Profile from './pages/Profile'; // 👈 নতুন ইমপোর্ট করা হলো
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* পাবলিক রাউট */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* প্রোটেক্টেড রাউট (লগইন করা থাকলেই ঢুকতে পারবে) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} /> {/* 👈 নতুন রাউট যোগ করা হলো */}
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/edit-profile" element={<EditProfile />} /> 
            <Route path="/account-settings" element={<AccountSettings />} /> 
          </Route>

          {/* ডিফল্ট রিডাইরেক্ট */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;