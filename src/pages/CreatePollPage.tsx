import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

type FormData = {
  title: string;
  description: string;
  is_public: boolean;
  allow_comments: boolean;
  closes_at: string;
  options: { text: string }[];
};

const CreatePollPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    control,
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      is_public: true,
      allow_comments: true,
      closes_at: '',
      options: [{ text: '' }, { text: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  // If not authenticated, redirect to login
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  const onSubmit = async (data: FormData) => {
    if (data.options.length < 2) {
      toast.error('You must provide at least two options');
      return;
    }

    if (data.options.some(option => !option.text.trim())) {
      toast.error('All options must have text');
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert the poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: data.title,
          description: data.description || null,
          created_by: user!.id,
          is_public: data.is_public,
          allow_comments: data.allow_comments,
          closes_at: data.closes_at || null
        })
        .select()
        .single();

      if (pollError) {
        throw pollError;
      }

      // Insert the options
      const optionsToInsert = data.options.map(option => ({
        poll_id: pollData.id,
        text: option.text
      }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        throw optionsError;
      }

      toast.success('Poll created successfully!');
      navigate(`/polls/${pollData.id}`);
    } catch (error) {
      toast.error('Failed to create poll');
      console.error('Error creating poll:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a New Poll</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poll Title*
              </label>
              <input
                id="title"
                type="text"
                className="input w-full"
                placeholder="Ask a question..."
                {...register('title', { 
                  required: 'Title is required',
                  maxLength: {
                    value: 100,
                    message: 'Title must not exceed 100 characters'
                  }
                })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                className="input w-full"
                placeholder="Provide more context about your poll..."
                {...register('description', { 
                  maxLength: {
                    value: 500,
                    message: 'Description must not exceed 500 characters'
                  }
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Poll Options*</h2>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  className="input flex-grow"
                  placeholder={`Option ${index + 1}`}
                  {...register(`options.${index}.text` as const, {
                    required: 'Option text is required'
                  })}
                />
                {index > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    aria-label="Remove option"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => append({ text: '' })}
              className="flex items-center text-primary-600 hover:text-primary-700 mt-2"
            >
              <FiPlus className="mr-1" /> Add Option
            </button>
          </div>
          
          {errors.options && (
            <p className="mt-2 text-sm text-red-600">At least two options are required</p>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Poll Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="is_public"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('is_public')}
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Make poll public (visible to everyone)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="allow_comments"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('allow_comments')}
              />
              <label htmlFor="allow_comments" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Allow comments on this poll
              </label>
            </div>
            
            <div>
              <label htmlFor="closes_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poll Closing Date (optional)
              </label>
              <input
                id="closes_at"
                type="datetime-local"
                className="input w-full"
                {...register('closes_at')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                If set, voting will be disabled after this date.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePollPage;