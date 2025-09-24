-- Migration: 024 - Fix Profile Data Type Consistency
-- Purpose: Ensure profiles.id remains TEXT to match Supabase auth.users.id standard
-- Date: September 23, 2025

-- This migration corrects the data type inconsistency created by migration 023
-- Supabase auth.users.id is TEXT, so profiles.id should also be TEXT

-- Drop existing policies that reference the id column
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

-- Drop the foreign key constraint temporarily
ALTER TABLE public.team_posts DROP CONSTRAINT IF EXISTS fk_team_posts_author_id;

-- Revert profiles.id back to TEXT (Supabase standard)
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;

-- Ensure team_posts.author_id is also TEXT
ALTER TABLE public.team_posts ALTER COLUMN author_id TYPE TEXT;

-- Recreate the foreign key constraint
ALTER TABLE public.team_posts
ADD CONSTRAINT fk_team_posts_author_id
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Recreate the RLS policies for profiles
CREATE POLICY "Allow users to view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = id);