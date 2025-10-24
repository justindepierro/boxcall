-- Add status field to announcements for draft mode
-- Supports: draft, published, scheduled

ALTER TABLE team_announcements
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
CHECK (status IN ('draft', 'published', 'scheduled'));

-- Add scheduled_for timestamp for scheduled posts
ALTER TABLE team_announcements
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- Index for querying drafts and scheduled posts
CREATE INDEX IF NOT EXISTS idx_announcements_status ON team_announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled ON team_announcements(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Update RLS policies to handle drafts
-- Only show drafts to the author
DROP POLICY IF EXISTS "Users can view team announcements" ON team_announcements;
CREATE POLICY "Users can view team announcements"
  ON team_announcements FOR SELECT
  USING (
    -- User is a member of the team
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_announcements.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'active'
    )
    AND (
      -- Announcement is published OR user is the author (can see own drafts)
      team_announcements.status = 'published'
      OR team_announcements.created_by = auth.uid()
    )
  );

-- Comment
COMMENT ON COLUMN team_announcements.status IS 'Status of announcement: draft, published, scheduled';
COMMENT ON COLUMN team_announcements.scheduled_for IS 'When to auto-publish a scheduled announcement';
