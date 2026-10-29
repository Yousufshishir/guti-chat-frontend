import axiosClient from './axiosClient';

const BASE = '/api/posts';

export const postApi = {
  createPost: (data) => axiosClient.post(`${BASE}/create`, data),
  getFeed: (page = 1, limit = 20) => axiosClient.get(`${BASE}/feed?page=${page}&limit=${limit}`),
  getUserPosts: (userId, page = 1, limit = 20) => 
    axiosClient.get(`${BASE}/user/${userId}?page=${page}&limit=${limit}`),
  getSinglePost: (id) => axiosClient.get(`${BASE}/${id}`),
  editPost: (id, data) => axiosClient.put(`${BASE}/${id}`, data),
  deletePost: (id) => axiosClient.delete(`${BASE}/${id}`),
  reactToPost: (id, reactionType) => axiosClient.put(`${BASE}/${id}/react`, { reactionType }),
  togglePostVisibility: (id) => axiosClient.put(`${BASE}/${id}/visibility`),
};