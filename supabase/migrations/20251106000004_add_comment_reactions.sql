-- Create comment_reactions table
-- This table stores emoji reactions on announcement comments
-- Mirrors the structure of announcement_reactions for consistency

CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES announcement_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Reaction type: like (👍), love (❤️), celebrate (🎉), football (🏈)
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'football')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one user can only react once per type per comment
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Create indexes for common queries
CREATE INDEX idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX idx_comment_reactions_created_at ON comment_reactions(created_at DESC);

-- Add table comment
COMMENT ON TABLE comment_reactions IS 'Stores emoji reactions on announcement comments. Each user can react once per reaction type per comment.';

COMMENT ON COLUMN comment_reactions.reaction_type IS 'Type of reaction: like, love, celebrate, or football';

-- Row Level Security (RLS) Policies
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view reactions on comments they can see
CREATE POLICY "Team members can view comment reactions" ON comment_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM announcement_comments ac
      JOIN team_announcements ta ON ta.id = ac.announcement_id
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ac.id = comment_reactions.comment_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND ac.deleted_at IS NULL
        AND ta.deleted_at IS NULL
    )
  );

-- Policy: Team members can add reactions to comments they can see
CREATE POLICY "Team members can add comment reactions" ON comment_reactions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM announcement_comments ac
      JOIN team_announcements ta ON ta.id = ac.announcement_id
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ac.id = comment_reactions.comment_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND ac.deleted_at IS NULL
        AND ta.deleted_at IS NULL
    )
  );

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete own comment reactions" ON comment_reactions
  FOR DELETE
  USING (user_id = auth.uid());
