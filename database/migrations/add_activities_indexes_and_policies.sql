-- STEP 2: Add indexes and RLS policies
-- Run this AFTER the table is created successfully

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON public.activities(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_play_id ON public.activities(play_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_team ON public.activities(user_id, team_id);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (in case of re-runs)
DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
DROP POLICY IF EXISTS "activities_select_own" ON public.activities;
DROP POLICY IF EXISTS "activities_select_team" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_own" ON public.activities;

-- Create RLS Policies
CREATE POLICY "activities_insert_policy"
  ON public.activities 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activities_select_own"
  ON public.activities 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "activities_select_team"
  ON public.activities 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_memberships 
      WHERE team_memberships.team_id = activities.team_id
      AND team_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "activities_delete_own"
  ON public.activities 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.activities TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.activities IS 'Tracks user activities related to plays, practice scripts, and game plans';
COMMENT ON COLUMN public.activities.activity_type IS 'Type of activity: created, updated, duplicated, added_to_script, added_to_gameplan, deleted';
COMMENT ON COLUMN public.activities.play_name IS 'Name of the play at the time of the activity (preserved even if play is deleted)';
COMMENT ON COLUMN public.activities.details IS 'Optional additional details as JSON (e.g., {"script_name": "Week 1 Practice"})';
