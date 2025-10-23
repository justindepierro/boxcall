-- Create announcement_comments table
-- This table stores comments and replies on team announcements

CREATE TABLE announcement_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES team_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  
  -- Threading support (parent_id for replies)
  parent_id UUID REFERENCES announcement_comments(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Soft delete support
  deleted_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX idx_announcement_comments_announcement_id ON announcement_comments(announcement_id);
CREATE INDEX idx_announcement_comments_user_id ON announcement_comments(user_id);
CREATE INDEX idx_announcement_comments_parent_id ON announcement_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_announcement_comments_created_at ON announcement_comments(created_at DESC);
CREATE INDEX idx_announcement_comments_deleted ON announcement_comments(deleted_at) WHERE deleted_at IS NULL;

-- Add comment explaining the table
COMMENT ON TABLE announcement_comments IS 'Stores comments and threaded replies on team announcements. Supports nested conversations.';

COMMENT ON COLUMN announcement_comments.parent_id IS 'References parent comment for threaded replies. NULL for top-level comments.';

COMMENT ON COLUMN announcement_comments.content IS 'Comment text content. Max 2000 characters.';

-- Row Level Security (RLS) Policies
ALTER TABLE announcement_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view non-deleted comments on announcements they can see
CREATE POLICY "Team members can view comments" ON announcement_comments
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM team_announcements ta
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ta.id = announcement_comments.announcement_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND ta.deleted_at IS NULL
    )
  );

-- Policy: Team members can add comments to announcements they can see
CREATE POLICY "Team members can add comments" ON announcement_comments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM team_announcements ta
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ta.id = announcement_comments.announcement_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND ta.deleted_at IS NULL
    )
  );

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments" ON announcement_comments
  FOR UPDATE
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own comments, or coaches can delete any comment
CREATE POLICY "Users can delete own comments or coaches can delete any" ON announcement_comments
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_announcements ta
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ta.id = announcement_comments.announcement_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'coordinator', 'coach')
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcement_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcement_comments_updated_at
  BEFORE UPDATE ON announcement_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_announcement_comments_updated_at();
