-- Fix activity_feed foreign key relationships to reference profiles instead of auth.users

-- Drop existing constraints
ALTER TABLE activity_feed DROP CONSTRAINT IF EXISTS activity_feed_actor_id_fkey;
ALTER TABLE activity_feed DROP CONSTRAINT IF EXISTS activity_feed_mentioned_user_id_fkey;

-- Add new constraints referencing profiles table  
ALTER TABLE activity_feed ADD CONSTRAINT activity_feed_actor_id_fkey 
  FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE activity_feed ADD CONSTRAINT activity_feed_mentioned_user_id_fkey 
  FOREIGN KEY (mentioned_user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Add RLS policy for activity_feed if missing
DROP POLICY IF EXISTS "Team members can view activity feed" ON activity_feed;
CREATE POLICY "Team members can view activity feed" ON activity_feed
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = activity_feed.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Team members can create activity feed entries" ON activity_feed;
CREATE POLICY "Team members can create activity feed entries" ON activity_feed
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = activity_feed.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    ) AND actor_id = auth.uid()
  );