import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { FiUser, FiLink, FiSave } from 'react-icons/fi';

type FormData = {
  username: string;
  avatar_url: string;
};

const ProfilePage = () => {
  const { user, profile, loading, updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: {
      username: profile?.username || '',
      avatar_url: profile?.avatar_url || '',
    }
  });

  // If not authenticated, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  const onSubmit = async (data: FormData) => {
    setIsUpdating(true);
    try {
      const { error } = await updateProfile({
        username: data.username,
        avatar_url: data.avatar_url || null,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Your Profile</h1>
      
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {profile?.avatar_url ? (
            <div className="avatar-container">
              <img 
                src={profile.avatar_url} 
                alt={profile.username} 
                className="avatar-lg"
              />
            </div>
          ) : (
            <div className="avatar-container">
              <div className="avatar-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{profile?.username}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <div className="mt-3">
              <span className="badge badge-primary">Member</span>
              {profile?.created_at && (
                <span className="text-sm text-gray-500 dark:text-gray-400 block mt-2">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-header">Edit Profile</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="username" className="form-label flex items-center gap-1">
              <FiUser className="text-gray-500" /> Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Your username"
              {...register('username', { 
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                maxLength: {
                  value: 20,
                  message: 'Username must not exceed 20 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
            />
            {errors.username && (
              <p className="form-error">{errors.username.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar_url" className="form-label flex items-center gap-1">
              <FiLink className="text-gray-500" /> Avatar URL (optional)
            </label>
            <input
              id="avatar_url"
              type="url"
              className="form-input"
              placeholder="https://example.com/avatar.jpg"
              {...register('avatar_url')}
            />
            {errors.avatar_url && (
              <p className="form-error">{errors.avatar_url.message}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter a URL to an image that will be used as your profile picture
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary btn-icon"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiSave className="mr-2" /> Update Profile
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;