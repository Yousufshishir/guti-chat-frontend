import axiosClient from './axiosClient';

const BASE = '/api/users';

export const userApi = {
  updateProfile: (data) => axiosClient.put(`${BASE}/profile`, data),
  requestDeletion: () => axiosClient.delete(`${BASE}/request-deletion`),
  cancelDeletion: () => axiosClient.post(`${BASE}/cancel-deletion`),
};