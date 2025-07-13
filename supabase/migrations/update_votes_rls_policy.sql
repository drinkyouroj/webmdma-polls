-- Update RLS policy to allow unauthenticated users to vote
-- First, drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;

-- Create a new policy that allows anyone to vote
CREATE POLICY "Anyone can vote" ON public.votes
  FOR INSERT WITH CHECK (true);

-- Keep the existing policy for users to delete their own votes
-- This ensures authenticated users can still change their votes