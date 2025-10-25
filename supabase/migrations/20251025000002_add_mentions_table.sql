-- Create mentions table
-- This table stores @mentions in announcements and comments
-- Links mentioned users to the content where they were mentioned
-- NOTE: This table was already created in the database before this migration was added
-- This migration is kept for documentation purposes

CREATE TABLE IF NOT EXISTS mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User who was mentioned
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User who created the mention (author of the content)
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Where the mention occurred
  mention_type TEXT NOT NULL CHECK (mention_type IN ('announcement', 'comment')),
  
  -- References to the content
  announcement_id UUID REFERENCES team_announcements(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES announcement_comments(id) ON DELETE CASCADE,
  
  -- Position and context of the mention
  position INTEGER, -- Character position in the text
  length INTEGER, -- Length of the mention text
  display_text TEXT, -- The @ mention text (e.g., "@JohnDoe")
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure mention_type matches the reference
  CONSTRAINT check_mention_references CHECK (
    (mention_type = 'announcement' AND announcement_id IS NOT NULL AND comment_id IS NULL)
    OR (mention_type = 'comment' AND comment_id IS NOT NULL)
  ),
  
  -- Prevent duplicate mentions in the same content
  UNIQUE(mentioned_user_id, announcement_id, comment_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user_id ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_created_by_user_id ON mentions(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_announcement_id ON mentions(announcement_id) WHERE announcement_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mentions_comment_id ON mentions(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mentions_created_at ON mentions(created_at DESC);

-- Add table comment
COMMENT ON TABLE mentions IS 'Stores @mentions in announcements and comments. Links mentioned users to content where they were mentioned.';

COMMENT ON COLUMN mentions.mention_type IS 'Type of content where mention occurred: announcement or comment';

COMMENT ON COLUMN mentions.position IS 'Character position of the mention in the original text';

COMMENT ON COLUMN mentions.display_text IS 'The original @mention text (e.g., "@JohnDoe")';

-- Row Level Security (RLS) Policies
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view mentions in content they can access
CREATE POLICY "Team members can view mentions" ON mentions
  FOR SELECT
  USING (
    -- Can view if mentioned user is self
    mentioned_user_id = auth.uid()
    OR
    -- Or if user is team member of the team
    (
      mention_type = 'announcement'
      AND EXISTS (
        SELECT 1 FROM team_announcements ta
        JOIN team_members tm ON tm.team_id = ta.team_id
        WHERE ta.id = mentions.announcement_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND ta.deleted_at IS NULL
      )
    )
    OR
    (
      mention_type = 'comment'
      AND EXISTS (
        SELECT 1 FROM announcement_comments ac
        JOIN team_announcements ta ON ta.id = ac.announcement_id
        JOIN team_members tm ON tm.team_id = ta.team_id
        WHERE ac.id = mentions.comment_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND ac.deleted_at IS NULL
          AND ta.deleted_at IS NULL
      )
    )
  );

-- Policy: System can create mentions (handled by services)
CREATE POLICY "System can create mentions" ON mentions
  FOR INSERT
  WITH CHECK (
    created_by_user_id = auth.uid()
    OR
    -- Allow service role to create mentions
    current_setting('role') = 'service_role'
  );

-- Policy: Authors can delete their own mentions
CREATE POLICY "Authors can delete mentions" ON mentions
  FOR DELETE
  USING (created_by_user_id = auth.uid());

-- Create function to get mentions for a user
CREATE OR REPLACE FUNCTION get_user_mentions(
  target_user_id UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  mention_type TEXT,
  display_text TEXT,
  created_at TIMESTAMPTZ,
  announcement_id UUID,
  announcement_title TEXT,
  comment_id UUID,
  created_by_user_id UUID,
  created_by_display_name TEXT,
  created_by_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.mention_type,
    m.display_text,
    m.created_at,
    m.announcement_id,
    ta.title AS announcement_title,
    m.comment_id,
    m.created_by_user_id,
    p.display_name AS created_by_display_name,
    p.avatar_url AS created_by_avatar_url
  FROM mentions m
  LEFT JOIN team_announcements ta ON ta.id = m.announcement_id
  LEFT JOIN profiles p ON p.id = m.created_by_user_id
  WHERE m.mentioned_user_id = target_user_id
  ORDER BY m.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment on function
COMMENT ON FUNCTION get_user_mentions IS 'Returns mentions for a user with related announcement and author information. Supports pagination.';
