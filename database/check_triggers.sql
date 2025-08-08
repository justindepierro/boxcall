-- Check if triggers were created
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_game_plan_situation_count', 'trigger_game_plan_play_count')
ORDER BY trigger_name;
