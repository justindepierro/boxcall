-- Part 1: Create Indexes (run this first)
-- Copy and paste this block, then click RUN

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON public.activities(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_play_id ON public.activities(play_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_team ON public.activities(user_id, team_id);
