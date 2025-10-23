-- Create team_announcements table
-- This table stores announcements that coaches can post to communicate with team members and families

CREATE TABLE team_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Features
  is_pinned BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Visibility settings (who can see this announcement)
  visibility TEXT DEFAULT 'all' CHECK (visibility IN ('all', 'staff_only', 'players_only', 'families_only')),
  
  -- Soft delete support
  deleted_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX idx_team_announcements_team_id ON team_announcements(team_id);
CREATE INDEX idx_team_announcements_created_at ON team_announcements(created_at DESC);
CREATE INDEX idx_team_announcements_pinned ON team_announcements(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_team_announcements_deleted ON team_announcements(deleted_at) WHERE deleted_at IS NULL;

-- Add comment explaining the table
COMMENT ON TABLE team_announcements IS 'Stores team announcements posted by coaches. Supports pinning, attachments, and visibility controls.';

COMMENT ON COLUMN team_announcements.visibility IS 'Controls who can see this announcement: all (everyone), staff_only (coaches/managers), players_only (players), families_only (family members)';

COMMENT ON COLUMN team_announcements.attachments IS 'Array of attachment objects with structure: [{"name": "file.pdf", "url": "https://...", "type": "application/pdf", "size": 12345}]';

-- Row Level Security (RLS) Policies
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view non-deleted announcements based on visibility
CREATE POLICY "Team members can view announcements" ON team_announcements
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_announcements.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- Policy: Coaches can create announcements for their teams
CREATE POLICY "Coaches can create announcements" ON team_announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_announcements.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'coach')
    )
  );

-- Policy: Coaches can update their own announcements
CREATE POLICY "Coaches can update own announcements" ON team_announcements
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_announcements.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'coordinator')
    )
  );

-- Policy: Coaches can delete (soft delete) their own announcements
CREATE POLICY "Coaches can delete own announcements" ON team_announcements
  FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_announcements.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'coordinator')
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_announcements_updated_at
  BEFORE UPDATE ON team_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_team_announcements_updated_at();
