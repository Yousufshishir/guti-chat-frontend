import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ১. অ্যাপ চালু হলে টোকেন চেক করে ইউজারকে লগইন করানো
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authApi.getMe();
        // ব্যাকএন্ড রেসপন্স ফরম্যাট: { status: 'success', data: user }
        setUser(response.data.data); 
      } catch (err) {
        console.error('Auth Init Error:', err);
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // ২. লগইন ফাংশন
  const login = useCallback(async (loginId, password) => {
    try {
      const response = await authApi.login({ loginId, password });
      
      // রেসপন্স স্ট্রাকচার চেক করা
      if (response.data && response.data.data && response.data.data.token) {
        const { user: userData, token, refreshToken } = response.data.data;
        
        tokenStorage.setTokens(token, refreshToken);
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      throw error; // Login.jsx-এ এররটি পাঠানোর জন্য
    }
  }, []);

  // ৩. রেজিস্ট্রেশন ফাংশন
  const register = useCallback(async (payload) => {
    try {
      const response = await authApi.register(payload);
      
      if (response.data && response.data.data && response.data.data.token) {
        const { user: userData, token, refreshToken } = response.data.data;
        
        tokenStorage.setTokens(token, refreshToken);
        setUser(userData);
        return userData;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      throw error; // Register.jsx-এ এররটি পাঠানোর জন্য
    }
  }, []);

  // ৪. লগআউট ফাংশন
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout API error:', e);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  // ৫. প্রোফাইল আপডেট হলে স্টেট আপডেট করা
  const updateUser = useCallback((newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};