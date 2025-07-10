import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { useAuth } from '@/contexts/AuthContext';

type Poll = Database['public']['Tables']['polls']['Row'];

const HomePage = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setPolls(data);
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();

    // Set up a real-time subscription for new polls
    const pollsSubscription = supabase
      .channel('public:polls')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'polls' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPolls(current => [payload.new as Poll, ...current]);
        } else if (payload.eventType === 'UPDATE') {
          setPolls(current => 
            current.map(poll => poll.id === payload.new.id ? payload.new as Poll : poll)
          );
        } else if (payload.eventType === 'DELETE') {
          setPolls(current => 
            current.filter(poll => poll.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pollsSubscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recent Polls</h1>
        {user && (
          <Link to="/create-poll" className="btn btn-primary">
            Create Poll
          </Link>
        )}
      </div>

      {polls.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">No polls available yet.</p>
          {user ? (
            <Link to="/create-poll" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mt-2 inline-block">
              Create the first poll!
            </Link>
          ) : (
            <Link to="/login" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 mt-2 inline-block">
              Login to create a poll
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <Link
              key={poll.id}
              to={`/polls/${poll.id}`}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{poll.title}</h2>
              {poll.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{poll.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {new Date(poll.created_at).toLocaleDateString()}
                </span>
                {poll.closes_at && (
                  <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs">
                    Closes {new Date(poll.closes_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;