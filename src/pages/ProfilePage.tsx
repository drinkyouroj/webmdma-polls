import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';

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
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.username} 
              className="h-16 w-16 rounded-full object-cover mr-4"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
                {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{profile?.username}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="input w-full"
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
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avatar URL (optional)
            </label>
            <input
              id="avatar_url"
              type="url"
              className="input w-full"
              placeholder="https://example.com/avatar.jpg"
              {...register('avatar_url')}
            />
            {errors.avatar_url && (
              <p className="mt-1 text-sm text-red-600">{errors.avatar_url.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;