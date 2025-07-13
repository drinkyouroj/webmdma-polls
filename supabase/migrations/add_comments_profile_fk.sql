-- Add foreign key relationship between comments.user_id and profiles.id
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id);
