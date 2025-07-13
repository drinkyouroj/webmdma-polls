import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/supabase/database.types';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FiMessageSquare } from 'react-icons/fi';
import { setCookie, getCookie, hasCookie } from '@/utils/cookieUtils';

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
  const [anonymousVoted, setAnonymousVoted] = useState<boolean>(false);

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
        } else {
          // Check if anonymous user has voted on this poll
          const hasVoted = hasCookie(`poll_vote_${id}`);
          setAnonymousVoted(hasVoted);
        }

        // Fetch comments if allowed
        if (pollData.allow_comments) {
          // First, fetch comments
          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('poll_id', id)
            .order('created_at', { ascending: false });

          if (commentsError) {
            throw commentsError;
          }

          if (commentsData && commentsData.length > 0) {
            // Get unique user IDs from comments
            const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
            
            // Fetch profiles for those users
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', userIds);
              
            // Create a map of profiles by user ID for quick lookup
            const profilesMap = new Map();
            if (profilesData) {
              profilesData.forEach(profile => {
                profilesMap.set(profile.id, profile);
              });
            }
            
            // Map profiles to comments
            const commentsWithProfiles = commentsData.map(comment => {
              const profile = profilesMap.get(comment.user_id);
              
              return {
                ...comment,
                profiles: profile 
                  ? { username: profile.username, avatar_url: profile.avatar_url }
                  : { username: 'Guest Voter', avatar_url: null }
              };
            });
            
            setComments(commentsWithProfiles as Comment[]);
          } else {
            setComments([]);
          }
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
            .select('*')
            .eq('id', payload.new.id)
            .single()
            .then(({ data: commentData }) => {
              if (commentData) {
                // Fetch the profile for this comment
                supabase
                  .from('profiles')
                  .select('id, username, avatar_url')
                  .eq('id', commentData.user_id)
                  .single()
                  .then(({ data: profileData }) => {
                    const commentWithProfile = {
                      ...commentData,
                      profiles: profileData
                        ? { username: profileData.username, avatar_url: profileData.avatar_url }
                        : { username: 'Guest Voter', avatar_url: null }
                    };
                    
                    setComments(current => [commentWithProfile as Comment, ...current]);
                  })
                  .catch(() => {
                    // Handle case where profile doesn't exist
                    const commentWithProfile = {
                      ...commentData,
                      profiles: { username: 'Guest Voter', avatar_url: null }
                    };
                    
                    setComments(current => [commentWithProfile as Comment, ...current]);
                  });
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
      if (user) {
        // Authenticated user flow
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
      } else {
        // Unauthenticated user flow
        // Check if they've already voted on this poll
        if (anonymousVoted) {
          toast.error('You have already voted on this poll');
          return;
        }

        // Generate a random ID for anonymous user
        const anonymousId = `anon_${Math.random().toString(36).substring(2, 15)}`;
        
        // Insert the vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            poll_id: id!,
            option_id: selectedOption,
            user_id: anonymousId
          });

        if (insertError) {
          throw insertError;
        }

        // Set cookie to prevent double voting
        setCookie(`poll_vote_${id}`, selectedOption, 365); // Cookie lasts for 1 year
        setAnonymousVoted(true);
      }

      toast.success('Vote recorded successfully!');
      
      // Refresh votes to update the UI
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('poll_id', id);

      if (votesError) {
        throw votesError;
      }

      setVotes(votesData);
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{poll.title}</h1>
            {poll.description && (
              <p className="text-gray-600 dark:text-gray-300">{poll.description}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <span className="badge badge-primary mb-2">
              {poll.is_public ? 'Public Poll' : 'Private Poll'}
            </span>
            
            {poll.closes_at && (
              <span className={`badge ${isPollClosed ? 'bg-error/10 text-error' : 'badge-accent'} ml-2`}>
                {isPollClosed ? 'Closed' : `Closes ${new Date(poll.closes_at).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="mr-4">
            <span className="font-medium">Created:</span> {new Date(poll.created_at).toLocaleDateString()}
          </span>
          <span className="mr-4">
            <span className="font-medium">Votes:</span> {totalVotes}
          </span>
          {poll.allow_comments && (
            <span>
              <span className="font-medium">Comments:</span> {comments.length}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          {isPollClosed && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    This poll is closed. You can view the results but cannot vote.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              <h2 className="card-header">{poll.title}</h2>
              
              <div className="md:flex md:space-x-6">
                <div className="md:w-1/2">
                  <div className="space-y-4 mb-6">
                    {options.map((option) => {
                      const voteCount = votes.filter(vote => vote.option_id === option.id).length;
                      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                      
                      return (
                        <div key={option.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center mb-2">
                            <input
                              type="radio"
                              id={option.id}
                              name="poll-option"
                              value={option.id}
                              checked={selectedOption === option.id}
                              onChange={() => setSelectedOption(option.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                              disabled={votingLoading || (anonymousVoted && !user)}
                            />
                            <label htmlFor={option.id} className="ml-2 block font-medium text-gray-700 dark:text-gray-300 flex-grow">
                              {option.text}
                            </label>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {percentage}%
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                            {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={handleVote}
                    className="btn btn-primary w-full"
                    disabled={votingLoading || !selectedOption || (anonymousVoted && !user)}
                  >
                    {votingLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : userVote || anonymousVoted ? 'Change Vote' : 'Vote'}
                  </button>
                  
                  {!user && (
                    <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      You can vote without an account, but you'll need to <a href="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">sign in</a> to comment.
                    </p>
                  )}
                </div>
                
                <div className="md:w-1/2 mt-8 md:mt-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Results</h3>
                  <div className="flex justify-center items-center h-full">
                    <div style={{ maxWidth: '200px', maxHeight: '200px' }} className="mx-auto">
                      <Pie 
                        data={chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                boxWidth: 10,
                                padding: 10,
                                font: {
                                  size: 11
                                }
                              }
                            },
                            tooltip: {
                              bodyFont: {
                                size: 11
                              },
                              titleFont: {
                                size: 11
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {poll.allow_comments && (
          <div className="card mt-8">
            <h2 className="card-header flex items-center">
              <FiMessageSquare className="mr-2" />
              Comments
            </h2>
            
            {user ? (
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <div className="avatar avatar-sm bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add your comment..."
                      className="form-input resize-none"
                      rows={3}
                      disabled={commentLoading}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleAddComment}
                        className="btn btn-primary btn-sm"
                        disabled={commentLoading || !newComment.trim()}
                      >
                        {commentLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Posting...
                          </span>
                        ) : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  <a href="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">Sign in</a> to leave a comment.
                </p>
              </div>
            )}
            
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex items-start space-x-3">
                      <div className="avatar avatar-sm bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                        {comment.profiles?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {comment.profiles?.username || 'Guest Voter'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.created_at).toLocaleString()}
                          </div>
                        </div>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                        {user && user.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="mt-1 text-xs text-error hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollPage;