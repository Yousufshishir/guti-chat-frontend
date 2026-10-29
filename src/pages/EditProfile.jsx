import { useState, useRef } from 'react'; // 👈 useRef ইমপোর্ট করুন
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../api/userApi';
import { mediaApi } from '../api/mediaApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null); // 👈 রেফ তৈরি করুন

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      avatarUrl: user?.avatarUrl || '',
      isPrivate: user?.isPrivate || false,
    }
  });

  const currentAvatar = watch('avatarUrl');

  // 👈 বাটনে ক্লিক করলে হিডেন ইনপুটে ক্লিক হবে
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file.');
    }
    if (file.size > 20 * 1024 * 1024) { // 👈 20MB লিমিট
      return toast.error('Image size must be less than 20MB.');
    }

    setUploading(true);
    const toastId = toast.loading('Uploading image to Cloudinary...');

    try {
      const response = await mediaApi.getUploadSignature();
      const sigData = response.data.data ? response.data.data : response.data;
      const { signature, timestamp, folder, type, allowedFormats, apiKey, cloudName } = sigData;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      if (folder) formData.append('folder', folder);
      if (type) formData.append('type', type);
      if (allowedFormats && allowedFormats.length > 0) {
        formData.append('allowed_formats', allowedFormats.join(','));
      }

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setValue('avatarUrl', cloudinaryRes.data.secure_url);
      toast.update(toastId, { render: 'Image uploaded successfully!', type: 'success', isLoading: false, autoClose: 2000 });

    } catch (err) {
      console.error('Full Upload Error:', err.response?.data || err);
      const errorMsg = err.response?.data?.error?.message || 'Failed to upload image.';
      toast.update(toastId, { render: errorMsg, type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await userApi.updateProfile(data);
      updateUser(res.data.data || res.data); 
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '500px', marginTop: '100px' }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src={currentAvatar || 'https://via.placeholder.com/100'} 
            alt="Avatar Preview" 
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }} 
          />
          <div style={{ marginTop: '10px' }}>
            {/* 👈 label এর বদলে button ব্যবহার করা হলো */}
            <button 
              type="button" 
              onClick={handleButtonClick} 
              style={{ cursor: 'pointer', backgroundColor: '#007bff', color: 'white', padding: '8px 15px', borderRadius: '5px', fontSize: '14px', border: 'none' }}
            >
              {uploading ? 'Uploading...' : 'Choose from Device'}
            </button>
            {/* 👈 ref যুক্ত করা হলো */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
              disabled={uploading}
            />
          </div>
        </div>

        <div>
          <label>Full Name</label>
          <input {...register('name', { required: 'Name is required' })} />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div>
          <label>Bio</label>
          <input {...register('bio')} placeholder="Tell us about yourself" />
        </div>
        
        <input type="hidden" {...register('avatarUrl')} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
          <input type="checkbox" {...register('isPrivate')} style={{ width: '20px' }} />
          <label style={{ margin: 0 }}>Make my profile private</label>
        </div>
        
        <button type="submit" disabled={isSubmitting || uploading} style={{ marginTop: '20px' }}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;