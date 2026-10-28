import axiosClient from './axiosClient';

export const mediaApi = {
  // ব্যাকএন্ড থেকে Cloudinary আপলোড সিগনেচার নেওয়া
  getUploadSignature: () => axiosClient.get('/api/media/upload-signature'),
};