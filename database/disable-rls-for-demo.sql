-- 🔧 BoxCall RLS Policy Fix Script - SIMPLE NON-RECURSIVE VERSION
-- Run this in your Supabase SQL Editor to fix infinite recursion issues

-- STEP 1: Remove ALL existing policies completely
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

-- STEP 2: Temporarily DISABLE RLS for testing
-- This will allow us to load demo data and verify everything works
-- We'll re-enable with proper policies once data is loaded

ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE plays DISABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks DISABLE ROW LEVEL SECURITY;

-- Note: You can re-enable RLS later with proper testing:
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plays ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

SELECT 'RLS policies cleaned up and temporarily disabled for demo data loading' AS status;
