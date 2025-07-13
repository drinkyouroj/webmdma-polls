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
        console.error('Poll creation error:', pollError);
        toast.error(`Failed to create poll: ${pollError.message || pollError.details || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }

      // Insert the options
      const optionsToInsert = data.options
        .filter(option => option.text.trim())
        .map(option => ({
          poll_id: pollData.id,
          text: option.text.trim()
        }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Options creation error:', optionsError);
        toast.error(`Failed to create poll options: ${optionsError.message || optionsError.details || 'Unknown error'}`);
        
        // Try to clean up the poll since options failed
        await supabase.from('polls').delete().eq('id', pollData.id);
        
        setIsSubmitting(false);
        return;
      }

      toast.success('Poll created successfully!');
      navigate(`/poll/${pollData.id}`);
    } catch (error) {
      console.error('Unexpected error during poll creation:', error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create a New Poll</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="card-header">Poll Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Poll Title*
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
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
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="form-label">
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                className="form-input"
                placeholder="Provide more context about your poll..."
                {...register('description', { 
                  maxLength: {
                    value: 500,
                    message: 'Description must not exceed 500 characters'
                  }
                })}
              />
              {errors.description && (
                <p className="form-error">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="card-header">Poll Options*</h2>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Option ${index + 1}`}
                  {...register(`options.${index}.text` as const, {
                    required: 'Option text is required'
                  })}
                />
                {index > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-error hover:text-red-700 transition-colors"
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
              className="btn btn-outline btn-sm btn-icon mt-3"
            >
              <FiPlus className="mr-1" /> Add Option
            </button>
          </div>
          
          {errors.options && (
            <p className="form-error mt-2">At least two options are required</p>
          )}
        </div>
        
        <div className="card">
          <h2 className="card-header">Poll Settings</h2>
          
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
              <label htmlFor="closes_at" className="form-label">
                Poll Closing Date (optional)
              </label>
              <input
                id="closes_at"
                type="datetime-local"
                className="form-input"
                {...register('closes_at')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                If set, voting will be disabled after this date.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Poll...
              </span>
            ) : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePollPage;