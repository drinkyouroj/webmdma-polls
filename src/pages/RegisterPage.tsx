import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi';

type FormData = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<FormData>();

  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.username);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Registration successful! Please check your email to confirm your account.');
        navigate('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Join our community and start creating polls</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="email" className="form-label flex items-center gap-1">
              <FiMail className="text-gray-500" /> Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label flex items-center gap-1">
              <FiUser className="text-gray-500" /> Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="johndoe"
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
            <label htmlFor="password" className="form-label flex items-center gap-1">
              <FiLock className="text-gray-500" /> Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label flex items-center gap-1">
              <FiLock className="text-gray-500" /> Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FiUserPlus className="mr-2" /> Register
              </span>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline flex items-center justify-center gap-1 mt-2">
              <FiLogIn /> Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;