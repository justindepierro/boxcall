-- 🔧 BoxCall RLS Policy Fix Script
-- Run this in your Supabase SQL Editor to fix infinite recursion issues

-- First, let's clean up problematic policies
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_insert" ON team_members;
DROP POLICY IF EXISTS "team_members_update" ON team_members;
DROP POLICY IF EXISTS "team_members_delete" ON team_members;

-- Simple team_members policy (non-recursive)
CREATE POLICY "team_members_access" ON team_members
FOR ALL
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT user_id FROM profiles WHERE role = 'admin'
));

-- Fix teams policies
DROP POLICY IF EXISTS "teams_select" ON teams;
DROP POLICY IF EXISTS "teams_insert" ON teams;
DROP POLICY IF EXISTS "teams_update" ON teams;
DROP POLICY IF EXISTS "teams_delete" ON teams;

CREATE POLICY "teams_select" ON teams
FOR SELECT
USING (
  -- Team members can view their teams
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR
  -- Admins can view all teams
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

CREATE POLICY "teams_insert" ON teams
FOR INSERT
WITH CHECK (
  -- Only coaches and admins can create teams
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coach', 'admin'))
);

CREATE POLICY "teams_update" ON teams
FOR UPDATE
USING (
  -- Team members with coach role can update
  id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    JOIN profiles p ON p.id = tm.user_id 
    WHERE tm.user_id = auth.uid() AND p.role IN ('coach', 'admin')
  )
);

-- Fix plays policies
DROP POLICY IF EXISTS "plays_select" ON plays;
DROP POLICY IF EXISTS "plays_insert" ON plays;
DROP POLICY IF EXISTS "plays_update" ON plays;
DROP POLICY IF EXISTS "plays_delete" ON plays;

CREATE POLICY "plays_select" ON plays
FOR SELECT
USING (
  -- Team members can view plays for their teams
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR
  -- Admins can view all plays
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

CREATE POLICY "plays_insert" ON plays
FOR INSERT
WITH CHECK (
  -- Only coaches can create plays for their teams
  team_id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    JOIN profiles p ON p.id = tm.user_id 
    WHERE tm.user_id = auth.uid() AND p.role IN ('coach', 'admin')
  )
);

CREATE POLICY "plays_update" ON plays
FOR UPDATE
USING (
  -- Only coaches can update plays for their teams
  team_id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    JOIN profiles p ON p.id = tm.user_id 
    WHERE tm.user_id = auth.uid() AND p.role IN ('coach', 'admin')
  )
);

-- Fix playbooks policies
DROP POLICY IF EXISTS "playbooks_select" ON playbooks;
DROP POLICY IF EXISTS "playbooks_insert" ON playbooks;
DROP POLICY IF EXISTS "playbooks_update" ON playbooks;
DROP POLICY IF EXISTS "playbooks_delete" ON playbooks;

CREATE POLICY "playbooks_select" ON playbooks
FOR SELECT
USING (
  -- Team members can view playbooks for their teams
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR
  -- Admins can view all playbooks
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

CREATE POLICY "playbooks_insert" ON playbooks
FOR INSERT
WITH CHECK (
  -- Only coaches can create playbooks for their teams
  team_id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    JOIN profiles p ON p.id = tm.user_id 
    WHERE tm.user_id = auth.uid() AND p.role IN ('coach', 'admin')
  )
);

CREATE POLICY "playbooks_update" ON playbooks
FOR UPDATE
USING (
  -- Only coaches can update playbooks for their teams
  team_id IN (
    SELECT tm.team_id 
    FROM team_members tm 
    JOIN profiles p ON p.id = tm.user_id 
    WHERE tm.user_id = auth.uid() AND p.role IN ('coach', 'admin')
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
CREATE INDEX IF NOT EXISTS idx_plays_team_id ON plays(team_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_team_id ON playbooks(team_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'RLS policies updated successfully! 🎉' as status;
