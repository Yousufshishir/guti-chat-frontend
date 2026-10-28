import axiosClient from './axiosClient';
import axios from 'axios';

const BASE = '/api/auth';
const baseURL = 'https://guti-chat.onrender.com'; // 👈 সরাসরি লাইভ URL

export const authApi = {
  register: (data) => axiosClient.post(`${BASE}/register`, data),
  login: (data) => axiosClient.post(`${BASE}/login`, data),
  logout: () => axiosClient.post(`${BASE}/logout`),
  getMe: () => axiosClient.get(`${BASE}/me`),
  updatePassword: (data) => axiosClient.put(`${BASE}/update-password`, data),
  
  // পাবলিক এন্ডপয়েন্ট (GET এর বদলে POST/PUT ব্যবহার করা হয়েছে)
  forgotPassword: (email) =>
    axios.post(`${baseURL}${BASE}/forgot-password`, { email }),
  verifyOtp: (email, otp) =>
    axios.post(`${baseURL}${BASE}/verify-otp`, { email, otp }),
  resetPassword: (email, otp, newPassword) =>
    axios.put(`${baseURL}${BASE}/reset-password`, { email, otp, newPassword }),
};