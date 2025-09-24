-- Migration: 022 - Create Team Posts Table
-- Purpose: Create the team_posts table for team bulletin functionality
-- Date: September 22, 2025

-- Create teams table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create team_posts table
CREATE TABLE IF NOT EXISTS public.team_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_team_posts_updated_at'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
    ) THEN
      CREATE TRIGGER trg_team_posts_updated_at
        BEFORE UPDATE ON public.team_posts
        FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_posts_team_id ON public.team_posts(team_id);
CREATE INDEX IF NOT EXISTS idx_team_posts_author_id ON public.team_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_team_posts_created_at ON public.team_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_team_posts_is_pinned ON public.team_posts(is_pinned);

-- Enable RLS
ALTER TABLE public.team_posts ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "team_posts_service_role" ON public.team_posts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Team members can view posts
CREATE POLICY "team_posts_select" ON public.team_posts
  FOR SELECT USING (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- Team members can create posts
CREATE POLICY "team_posts_insert" ON public.team_posts
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
    ) AND author_id = auth.uid()
  );

-- Users can update their own posts, coaches can update any post
CREATE POLICY "team_posts_update" ON public.team_posts
  FOR UPDATE USING (
    author_id = auth.uid() OR
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );

-- Users can delete their own posts, coaches can delete any post
CREATE POLICY "team_posts_delete" ON public.team_posts
  FOR DELETE USING (
    author_id = auth.uid() OR
    team_id IN (
      SELECT tm.team_id FROM public.team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );