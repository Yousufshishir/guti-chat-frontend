import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../utils/tokenStorage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.getMe();
        setUser(data.data || data); // ব্যাকএন্ডের রেসপন্স ফরম্যাট অনুযায়ী
      } catch (err) {
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (loginId, password) => {
    const { data } = await authApi.login({ loginId, password });
    const { user: userData, token, refreshToken } = data.data;
    tokenStorage.setTokens(token, refreshToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    const { user: userData, token, refreshToken } = data.data;
    tokenStorage.setTokens(token, refreshToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {} 
    finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  // 👈 নতুন: প্রোফাইল আপডেট হলে গ্লোবাল স্টেটে আপডেট করার জন্য
  const updateUser = useCallback((newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};