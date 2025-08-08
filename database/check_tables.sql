-- Simple verification queries that will show actual results in Supabase
-- Run each query separately to see the results

-- 1. Check all game planning tables exist
SELECT 
  tablename as table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) as column_count
FROM pg_tables t 
WHERE t.tablename IN ('game_plans', 'game_plan_situations', 'game_plan_plays', 'coach_cards', 'game_plan_templates', 'game_plan_analytics')
  AND t.schemaname = 'public'
ORDER BY t.tablename;
