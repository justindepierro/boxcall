-- Create announcement views tracking table
-- This tracks when team members view announcements for read receipts

-- Create the announcement_views table
CREATE TABLE IF NOT EXISTS announcement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES team_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate views
  UNIQUE(announcement_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_announcement_views_announcement_id 
ON announcement_views(announcement_id);

CREATE INDEX IF NOT EXISTS idx_announcement_views_user_id 
ON announcement_views(user_id);

CREATE INDEX IF NOT EXISTS idx_announcement_views_team_id 
ON announcement_views(team_id);

CREATE INDEX IF NOT EXISTS idx_announcement_views_viewed_at 
ON announcement_views(viewed_at DESC);

-- Enable Row Level Security
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own views
CREATE POLICY "Users can view their own announcement views"
ON announcement_views
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own views
CREATE POLICY "Users can record their own announcement views"
ON announcement_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Coaches can view all views for their team announcements
CREATE POLICY "Coaches can view all announcement views for their teams"
ON announcement_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = announcement_views.team_id
    AND tm.user_id = auth.uid()
    AND tm.team_role IN ('head_coach', 'assistant_coach', 'coach')
    AND tm.status = 'active'
  )
);

-- Add view_count column to team_announcements for quick access
ALTER TABLE team_announcements
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to update view count
CREATE OR REPLACE FUNCTION update_announcement_view_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the view count on the announcement
  UPDATE team_announcements
  SET view_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM announcement_views
    WHERE announcement_id = NEW.announcement_id
  )
  WHERE id = NEW.announcement_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update view count
DROP TRIGGER IF EXISTS trigger_update_announcement_view_count ON announcement_views;
CREATE TRIGGER trigger_update_announcement_view_count
AFTER INSERT ON announcement_views
FOR EACH ROW
EXECUTE FUNCTION update_announcement_view_count();

-- Comments
COMMENT ON TABLE announcement_views IS 'Tracks when team members view announcements for read receipts';
COMMENT ON COLUMN announcement_views.viewed_at IS 'When the user first viewed this announcement';
COMMENT ON COLUMN team_announcements.view_count IS 'Cached count of unique viewers';
