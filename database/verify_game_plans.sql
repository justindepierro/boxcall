-- Verify Game Plan Tables
-- Run this in Supabase SQL Editor to confirm everything is set up correctly

-- Check tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'game_plan%'
ORDER BY table_name;

-- Check columns in game_plans
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'game_plans'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename LIKE 'game_plan%'
ORDER BY tablename, policyname;

-- Test insert (optional - will fail if you're not authenticated)
-- INSERT INTO game_plans (team_id, name) 
-- VALUES ('your-team-id-here', 'Test Game Plan')
-- RETURNING *;
