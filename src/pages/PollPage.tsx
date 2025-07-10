import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/supabase/database.types';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FiMessageSquare } from 'react-icons/fi';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

type Poll = Database['public']['Tables']['polls']['Row'];
type Option = Database['public']['Tables']['options']['Row'];
type Vote = Database['public']['Tables']['votes']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles: { username: string; avatar_url: string | null };
};

const PollPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPollData = async () => {
      setLoading(true);
      try {
        // Fetch poll details
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('id', id)
          .single();

        if (pollError) {
          throw pollError;
        }

        setPoll(pollData);

        // Fetch poll options
        const { data: optionsData, error: optionsError } = await supabase
          .from('options')
          .select('*')
          .eq('poll_id', id)
          .order('created_at', { ascending: true });

        if (optionsError) {
          throw optionsError;
        }

        setOptions(optionsData);

        // Fetch votes
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('poll_id', id);

        if (votesError) {
          throw votesError;
        }

        setVotes(votesData);

        // Check if user has already voted
        if (user) {
          const userVoteData = votesData.find(vote => vote.user_id === user.id);
          if (userVoteData) {
            setUserVote(userVoteData.option_id);
            setSelectedOption(userVoteData.option_id);
          }
        }

        // Fetch comments if allowed
        if (pollData.allow_comments) {
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .eq('poll_id', id)
            .order('created_at', { ascending: false });

          if (commentsError) {
            throw commentsError;
          }

          setComments(commentsData as Comment[]);
        }
      } catch (error) {
        console.error('Error fetching poll data:', error);
        toast.error('Failed to load poll data');
      } finally {
        setLoading(false);
      }
    };

    fetchPollData();

    // Set up real-time subscriptions
    const votesSubscription = supabase
      .channel('votes-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'votes',
        filter: `poll_id=eq.${id}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVotes(current => [...current, payload.new as Vote]);
        } else if (payload.eventType === 'DELETE') {
          setVotes(current => current.filter(vote => vote.id !== payload.old.id));
        }
      })
      .subscribe();

    const commentsSubscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `poll_id=eq.${id}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Need to fetch the complete comment with profile info
          supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setComments(current => [data as Comment, ...current]);
              }
            });
        } else if (payload.eventType === 'DELETE') {
          setComments(current => current.filter(comment => comment.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(votesSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [id, user]);

  const handleVote = async () => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    if (poll?.closes_at && new Date(poll.closes_at) < new Date()) {
      toast.error('This poll is closed');
      return;
    }

    setVotingLoading(true);
    try {
      // If user already voted, delete the previous vote
      if (userVote) {
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('poll_id', id)
          .eq('user_id', user.id);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Insert the new vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          poll_id: id!,
          option_id: selectedOption,
          user_id: user.id
        });

      if (insertError) {
        throw insertError;
      }

      setUserVote(selectedOption);
      toast.success('Vote recorded successfully!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    } finally {
      setVotingLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (!poll?.allow_comments) {
      toast.error('Comments are not allowed on this poll');
      return;
    }

    setCommentLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          poll_id: id!,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) {
        throw error;
      }

      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return <Navigate to="/404" />;
  }

  // Prepare chart data
  const optionLabels = options.map(option => option.text);
  const optionVotes = options.map(option => 
    votes.filter(vote => vote.option_id === option.id).length
  );
  
  const chartData = {
    labels: optionLabels,
    datasets: [
      {
        data: optionVotes,
        backgroundColor: [
          '#3B82F6', // blue-500
          '#10B981', // emerald-500
          '#F59E0B', // amber-500
          '#EF4444', // red-500
          '#8B5CF6', // violet-500
          '#EC4899', // pink-500
          '#6366F1', // indigo-500
          '#14B8A6', // teal-500
        ],
        borderWidth: 1,
      },
    ],
  };

  const isPollClosed = poll.closes_at && new Date(poll.closes_at) < new Date();
  const totalVotes = votes.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{poll.title}</h1>
        {poll.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{poll.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
          {poll.closes_at && (
            <span className={`px-2 py-1 rounded-full text-xs ${
              isPollClosed 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {isPollClosed 
                ? `Closed ${new Date(poll.closes_at).toLocaleDateString()}` 
                : `Closes ${new Date(poll.closes_at).toLocaleDateString()}`
              }
            </span>
          )}
          <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Vote</h2>
          
          {isPollClosed ? (
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-md">
              <p className="text-red-700 dark:text-red-300">
                This poll is closed and no longer accepting votes.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {options.map((option) => {
                  const voteCount = votes.filter(vote => vote.option_id === option.id).length;
                  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        id={option.id}
                        name="poll-option"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        disabled={votingLoading || !user}
                      />
                      <label htmlFor={option.id} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {option.text}
                      </label>
                      <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        {percentage}% ({voteCount})
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={handleVote}
                className="btn btn-primary w-full"
                disabled={votingLoading || !user || !selectedOption}
              >
                {votingLoading ? 'Submitting...' : userVote ? 'Change Vote' : 'Vote'}
              </button>
              
              {!user && (
                <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                  Please login to vote on this poll.
                </p>
              )}
            </>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          {totalVotes > 0 ? (
            <div className="h-64">
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                No votes yet. Be the first to vote!
              </p>
            </div>
          )}
        </div>
      </div>

      {poll.allow_comments && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold">Comments</h2>
            <FiMessageSquare className="ml-2 text-gray-500 dark:text-gray-400" />
          </div>
          
          {user ? (
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input w-full mb-2"
                rows={3}
                disabled={commentLoading}
              />
              <button
                onClick={handleAddComment}
                className="btn btn-primary"
                disabled={commentLoading || !newComment.trim()}
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          ) : (
            <p className="mb-6 text-sm text-center text-gray-500 dark:text-gray-400">
              Please login to add comments.
            </p>
          )}
          
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {comment.profiles.avatar_url ? (
                        <img 
                          src={comment.profiles.avatar_url} 
                          alt={comment.profiles.username} 
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                            {comment.profiles.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.profiles.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                      {user && user.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="mt-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PollPage;