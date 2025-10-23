-- Create announcement_reactions table
-- This table stores reactions (emoji responses) to team announcements

CREATE TABLE announcement_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES team_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Reaction type (emoji)
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'celebrate', 'football')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reactions from same user
  UNIQUE(announcement_id, user_id, reaction_type)
);

-- Create indexes for common queries
CREATE INDEX idx_announcement_reactions_announcement_id ON announcement_reactions(announcement_id);
CREATE INDEX idx_announcement_reactions_user_id ON announcement_reactions(user_id);
CREATE INDEX idx_announcement_reactions_type ON announcement_reactions(reaction_type);

-- Add comment explaining the table
COMMENT ON TABLE announcement_reactions IS 'Stores emoji reactions to team announcements. Users can react with like (👍), love (❤️), celebrate (🎉), or football (🏈).';

COMMENT ON COLUMN announcement_reactions.reaction_type IS 'Type of reaction: like (👍), love (❤️), celebrate (🎉), football (🏈)';

-- Row Level Security (RLS) Policies
ALTER TABLE announcement_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view reactions on announcements they can see
CREATE POLICY "Team members can view reactions" ON announcement_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_announcements ta
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ta.id = announcement_reactions.announcement_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

-- Policy: Team members can add reactions to announcements they can see
CREATE POLICY "Team members can add reactions" ON announcement_reactions
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM team_announcements ta
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ta.id = announcement_reactions.announcement_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND ta.deleted_at IS NULL
    )
  );

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete own reactions" ON announcement_reactions
  FOR DELETE
  USING (user_id = auth.uid());
