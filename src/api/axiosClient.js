import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

// 👈 ১. বেস URL এক জায়গায় ডিক্লেয়ার করা হলো
const BASE_URL = 'https://guti-chat.onrender.com';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// রিকোয়েস্টের সাথে অ্যাক্সেস টোকেন পাঠানো
axiosClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// রেসপন্স ইন্টারসেপ্টর (৪০১ এরর হ্যান্ডেল এবং টোকেন রিফ্রেশ)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🚨 ২. ফিক্স: লগইন বা রেজিস্টারের রিকোয়েস্টে ৪০১ আসলে রিফ্রেশ করার চেষ্টা করবে না
    if (
      originalRequest.url?.includes('/api/auth/login') || 
      originalRequest.url?.includes('/api/auth/register')
    ) {
      return Promise.reject(error); // সরাসরি আসল এররটি (যেমন: Invalid credentials) ফ্রন্টএন্ডে পাঠাবে
    }

    // যদি ৪০১ এরর আসে এবং এটি রিট্রাই করা না হয়ে থাকে
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // যদি ইতিমধ্যে টোকেন রিফ্রেশ হচ্ছে, তাহলে এই রিকোয়েস্টটি কিউতে রাখুন
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token found');

        // এখানে BASE_URL ব্যবহার করা হলো
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh-token`,
          { refreshToken }
        );

        const newAccessToken = data.data.token;
        
        // নতুন টোকেন সেভ করুন
        tokenStorage.setTokens(newAccessToken, refreshToken);
        
        // নতুন টোকেন দিয়ে বাকি রিকোয়েস্টগুলো রিট্রাই করুন
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
        
      } catch (refreshError) {
        // যদি রিফ্রেশ টোকেনও ফেইল করে, তবে লগআউট করুন
        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;