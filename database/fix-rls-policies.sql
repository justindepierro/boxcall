-- 🔧 BoxCall RLS Policy Fix Script - TYPE SAFE VERSION
-- Run this in your Supabase SQL Editor to fix infinite recursion issues

-- STEP 1: Remove all problematic policies completely
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_insert" ON team_members;
DROP POLICY IF EXISTS "team_members_update" ON team_members;
DROP POLICY IF EXISTS "team_members_delete" ON team_members;
DROP POLICY IF EXISTS "team_members_access" ON team_members;
DROP POLICY IF EXISTS "team_members_own_access" ON team_members;

DROP POLICY IF EXISTS "teams_select" ON teams;
DROP POLICY IF EXISTS "teams_insert" ON teams;
DROP POLICY IF EXISTS "teams_update" ON teams;
DROP POLICY IF EXISTS "teams_delete" ON teams;
DROP POLICY IF EXISTS "teams_member_access" ON teams;
DROP POLICY IF EXISTS "teams_create_access" ON teams;

DROP POLICY IF EXISTS "plays_select" ON plays;
DROP POLICY IF EXISTS "plays_insert" ON plays;
DROP POLICY IF EXISTS "plays_update" ON plays;
DROP POLICY IF EXISTS "plays_delete" ON plays;
DROP POLICY IF EXISTS "plays_team_access" ON plays;

DROP POLICY IF EXISTS "playbooks_select" ON playbooks;
DROP POLICY IF EXISTS "playbooks_insert" ON playbooks;
DROP POLICY IF EXISTS "playbooks_update" ON playbooks;
DROP POLICY IF EXISTS "playbooks_delete" ON playbooks;
DROP POLICY IF EXISTS "playbooks_team_access" ON playbooks;

-- STEP 2: Create simple, type-safe policies

-- Team members policy - users can only see their own memberships
-- Both user_id and auth.uid() should be cast to text for safety
CREATE POLICY "team_members_own_access" ON team_members
FOR ALL
USING (user_id::text = auth.uid()::text);

-- Teams policy - simple approach, users can see teams they belong to
CREATE POLICY "teams_member_access" ON teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = teams.id 
    AND tm.user_id::text = auth.uid()::text
  )
);

-- Allow coaches and admins to create teams
-- Profiles.id should match auth.uid(), both cast to text
CREATE POLICY "teams_create_access" ON teams
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id::text = auth.uid()::text 
    AND p.role IN ('coach', 'admin')
  )
);

-- Plays policy - users can see plays for teams they belong to
-- Note: plays table has playbook_id, not team_id directly
CREATE POLICY "plays_team_access" ON plays
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN playbooks pb ON pb.team_id = tm.team_id
    WHERE pb.id = plays.playbook_id
    AND tm.user_id::text = auth.uid()::text
  )
);

-- Playbooks policy - users can see playbooks for teams they belong to  
CREATE POLICY "playbooks_team_access" ON playbooks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = playbooks.team_id
    AND tm.user_id::text = auth.uid()::text
  )
);

-- Enable RLS on all tables if not already enabled
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

-- Add some helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_plays_playbook_id ON plays(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_team_id ON playbooks(team_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'RLS policies updated successfully! 🎉' as status;
