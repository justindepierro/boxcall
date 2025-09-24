-- BoxCall Database - Drop All Tables
-- Generated for clean rebuild
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily to allow dropping
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playbooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS plays DISABLE ROW LEVEL SECURITY;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS team_posts CASCADE;
DROP TABLE IF EXISTS practice_attendance CASCADE;
DROP TABLE IF EXISTS practice_schedules CASCADE;
DROP TABLE IF EXISTS practice_scripts CASCADE;
DROP TABLE IF EXISTS practice_templates CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS team_events CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS helmet_stickers CASCADE;
DROP TABLE IF EXISTS game_plan_plays CASCADE;
DROP TABLE IF EXISTS game_plan_situations CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS game_plans CASCADE;
DROP TABLE IF EXISTS play_calls CASCADE;
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS playbooks CASCADE;
DROP TABLE IF EXISTS team_players CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Clean up any remaining constraints or indexes
DROP VIEW IF EXISTS season_stats CASCADE;

-- Re-enable RLS on auth.users if needed (usually handled by Supabase)
-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
