-- Migration: 022 - Create Team Posts Table
-- Purpose: Create the team_posts table for team bulletin functionality
-- Date: September 22, 2025

-- Create team_posts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_posts') THEN
    CREATE TABLE public.team_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT false,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  ELSE
    -- Alter existing table if author_id is wrong type
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'team_posts' AND column_name = 'author_id' AND data_type = 'uuid'
    ) THEN
      ALTER TABLE public.team_posts ALTER COLUMN author_id TYPE TEXT;
    END IF;
    
    -- Add missing columns if they don't exist
    ALTER TABLE public.team_posts 
    ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
  END IF;
END $$;

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

-- RLS Policies
-- Select: Team members can view posts
CREATE POLICY team_posts_select ON public.team_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_posts.team_id AND m.user_id = auth.uid()
    )
  );

-- Insert: Team members can create posts
CREATE POLICY team_posts_insert ON public.team_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_posts.team_id AND m.user_id = auth.uid()
    )
  );

-- Update: Authors can update their posts, coaches can pin/unpin
CREATE POLICY team_posts_update ON public.team_posts
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_posts.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach', 'coach')
    )
  );

-- Delete: Authors can delete their posts, coaches can delete any
CREATE POLICY team_posts_delete ON public.team_posts
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.team_members m
       WHERE m.team_id = team_posts.team_id
         AND m.user_id = auth.uid()
         AND m.role IN ('head_coach', 'coach')
    )
  );