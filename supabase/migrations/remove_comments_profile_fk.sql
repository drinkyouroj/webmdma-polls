-- Remove the foreign key constraint between comments.user_id and profiles.id
ALTER TABLE public.comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey_profiles;
