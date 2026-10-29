import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { postApi } from '../../api/postApi';
import { mediaApi } from '../../api/mediaApi'; // 👈 mediaApi ইমপোর্ট করুন
import { toast } from 'react-toastify';
import { encryptText } from '../../utils/crypto';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');
  const [isPosting, setIsPosting] = useState(false);

  // 👈 নতুন: মিডিয়া আপলোডের স্টেট
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('none');
  const [isUploading, setIsUploading] = useState(false);

  const defaultAvatar = 'https://via.placeholder.com/150';

  // 👈 নতুন: ফাইল সিলেক্ট করার ফাংশন
  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return toast.error('Please select an image or video file.');
    }
    if (file.size > 20 * 1024 * 1024) { // 20MB লিমিট
      return toast.error('File size must be less than 20MB.');
    }

    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setMediaPreview(URL.createObjectURL(file)); // প্রিভো দেখানোর জন্য
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType('none');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !mediaFile) return;

    setIsPosting(true);
    let uploadedMediaUrl = null;
    let uploadedMediaPublicId = null;

    try {
      // ১. যদি মিডিয়া ফাইল থাকে, তবে Cloudinary-তে আপলোড করি
      if (mediaFile) {
        setIsUploading(true);
        const response = await mediaApi.getUploadSignature();
        const sigData = response.data.data ? response.data.data : response.data;
        const { signature, timestamp, folder, type, allowedFormats, apiKey, cloudName } = sigData;

        const formData = new FormData();
        formData.append('file', mediaFile);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        if (folder) formData.append('folder', folder);
        if (type) formData.append('type', type);
        if (allowedFormats) formData.append('allowed_formats', allowedFormats.join(','));

        const resourceType = mediaType === 'video' ? 'video' : 'image';
        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        uploadedMediaUrl = cloudinaryRes.data.secure_url;
        uploadedMediaPublicId = cloudinaryRes.data.public_id;
        setIsUploading(false);
      }

      // ২. পোস্ট তৈরি করা
      const encryptedContent = postContent.trim() ? encryptText(postContent) : ''; // টেক্সট না থাকলে খালি

      await postApi.createPost({ 
        textContent: encryptedContent, 
        mediaUrl: uploadedMediaUrl, 
        mediaType: mediaType, 
        mediaPublicId: uploadedMediaPublicId,
        visibility: postVisibility 
      });
      
      // ৩. স্টেট রিসেট করা
      setPostContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType('none');
      
      toast.success('Post created successfully!');
      onPostCreated(); 
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="fb-card">
      <form onSubmit={handleCreatePost} className="fb-create-post-form">
        <div className="fb-create-post">
          <img src={user?.avatarUrl || defaultAvatar} alt="Avatar" className="fb-avatar-small" />
          <input 
            type="text" className="fb-post-input" 
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`} 
            value={postContent} onChange={(e) => setPostContent(e.target.value)} disabled={isPosting || isUploading}
          />
        </div>

        {/* 👈 নতুন: মিডিয়া প্রিভো সেকশন */}
        {mediaPreview && (
          <div style={{ position: 'relative', marginBottom: '10px', textAlign: 'center' }}>
            {mediaType === 'image' ? (
              <img src={mediaPreview} alt="Preview" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px' }} />
            ) : (
              <video src={mediaPreview} controls style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px' }} />
            )}
            <button 
              type="button" 
              onClick={removeMedia} 
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="fb-create-post-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={postVisibility} onChange={(e) => setPostVisibility(e.target.value)} style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none' }}>
              <option value="public">🌍 Public</option>
              <option value="friends">👥 Friends</option>
            </select>

            {/* 👈 নতুন: ফাইল সিলেক্ট বাটন */}
            <label style={{ cursor: 'pointer', fontWeight: 'bold', color: '#45bd62' }}>
              📷 Photo/Video
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleMediaSelect} 
                style={{ display: 'none' }} 
                disabled={isPosting || isUploading}
              />
            </label>
          </div>

          <button type="submit" className="fb-post-btn" disabled={(!postContent.trim() && !mediaFile) || isPosting || isUploading}>
            {isUploading ? 'Uploading...' : isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;