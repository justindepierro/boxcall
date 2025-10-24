-- Fix announcement_reactions RLS policy to exclude deleted announcements
-- This prevents 406 errors when toggling reactions on announcements

-- Drop the old policy
DROP POLICY IF EXISTS "Team members can view reactions" ON announcement_reactions;

-- Recreate with deleted_at check
CREATE POLICY "Team members can view reactions" ON announcement_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_announcements ta
      JOIN team_members tm ON tm.team_id = ta.team_id
      WHERE ta.id = announcement_reactions.announcement_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND ta.deleted_at IS NULL
    )
  );
