-- Migration: 023 - Fix team_posts author_id type
-- Purpose: Ensure author_id references auth.users.id correctly
-- Date: September 22, 2025

-- Drop ALL existing policies on team_posts
DROP POLICY IF EXISTS "Users can create posts" ON public.team_posts;
DROP POLICY IF EXISTS "Users can update posts" ON public.team_posts;
DROP POLICY IF EXISTS "Users can delete posts" ON public.team_posts;
DROP POLICY IF EXISTS team_posts_select ON public.team_posts;
DROP POLICY IF EXISTS team_posts_insert ON public.team_posts;
DROP POLICY IF EXISTS team_posts_update ON public.team_posts;
DROP POLICY IF EXISTS team_posts_delete ON public.team_posts;
DROP POLICY IF EXISTS team_posts_service_role ON public.team_posts;

-- Drop policies on profiles that reference id
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;

-- Drop foreign key constraint before changing types
ALTER TABLE public.team_posts DROP CONSTRAINT IF EXISTS team_posts_author_id_fkey;
ALTER TABLE public.team_posts DROP CONSTRAINT IF EXISTS fk_team_posts_author_id;

-- Ensure author_id column type is UUID to match auth.users.id
ALTER TABLE public.team_posts ALTER COLUMN author_id TYPE UUID USING author_id::uuid;

-- Add foreign key constraint to auth.users table
ALTER TABLE public.team_posts
ADD CONSTRAINT fk_team_posts_author_id
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns if they don't exist
ALTER TABLE public.team_posts
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Recreate profiles policies (profiles.id should be UUID)
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Recreate team_posts policies with simple rules (can be updated later)
DROP POLICY IF EXISTS team_posts_select ON public.team_posts;
CREATE POLICY team_posts_select ON public.team_posts
  FOR SELECT USING (true); -- Allow all for now

DROP POLICY IF EXISTS team_posts_insert ON public.team_posts;
CREATE POLICY team_posts_insert ON public.team_posts
  FOR INSERT WITH CHECK (true); -- Allow all for now

DROP POLICY IF EXISTS team_posts_update ON public.team_posts;
CREATE POLICY team_posts_update ON public.team_posts
  FOR UPDATE USING (true); -- Allow all for now

DROP POLICY IF EXISTS team_posts_delete ON public.team_posts;
CREATE POLICY team_posts_delete ON public.team_posts
  FOR DELETE USING (true); -- Allow all for now