import axiosClient from './axiosClient';

const BASE = '/api/posts';

export const postApi = {
  createPost: (data) => axiosClient.post(`${BASE}/create`, data),
  getFeed: (page = 1, limit = 20) => axiosClient.get(`${BASE}/feed?page=${page}&limit=${limit}`),
  reactToPost: (id, reactionType) => axiosClient.put(`${BASE}/${id}/react`, { reactionType }),
  
  // 👈 নতুন যোগ করা হলো: নির্দিষ্ট ইউজারের পোস্ট আনার জন্য
  getUserPosts: (userId, page = 1, limit = 20) => 
    axiosClient.get(`${BASE}/user/${userId}?page=${page}&limit=${limit}`),
};