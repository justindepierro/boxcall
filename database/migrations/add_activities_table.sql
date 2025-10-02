-- Migration: Create activities table for tracking user actions
-- This table tracks all play-related activities (create, update, delete, etc.)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can view team activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON public.activities;

-- Create or replace the table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  play_id UUID REFERENCES public.plays(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'updated', 'duplicated', 'added_to_script', 'added_to_gameplan', 'deleted')),
  play_name TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON public.activities(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_play_id ON public.activities(play_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_team ON public.activities(user_id, team_id);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities table

-- Users can insert their own activities
CREATE POLICY "Users can insert their own activities"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own activities
CREATE POLICY "Users can view their own activities"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view activities for teams they're members of
CREATE POLICY "Users can view team activities"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id 
      FROM public.team_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own activities (for cleanup)
CREATE POLICY "Users can delete their own activities"
  ON public.activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.activities TO authenticated;

-- Add comment to table
COMMENT ON TABLE public.activities IS 'Tracks user activities related to plays, practice scripts, and game plans';
COMMENT ON COLUMN public.activities.activity_type IS 'Type of activity: created, updated, duplicated, added_to_script, added_to_gameplan, deleted';
COMMENT ON COLUMN public.activities.play_name IS 'Name of the play at the time of the activity (preserved even if play is deleted)';
COMMENT ON COLUMN public.activities.details IS 'Optional additional details as JSON (e.g., {"script_name": "Week 1 Practice"})';
