-- Verify the complete game planning system was created successfully
-- This will show all tables and their column counts

DO $$
DECLARE
  rec RECORD;
  table_count INTEGER := 0;
  total_columns INTEGER;
BEGIN
  RAISE NOTICE '🔍 VERIFYING COMPLETE GAME PLANNING SYSTEM';
  RAISE NOTICE '========================================';
  
  -- Check each table exists and show column count
  FOR rec IN 
    SELECT 
      t.tablename,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) as col_count
    FROM pg_tables t 
    WHERE t.tablename IN ('game_plans', 'game_plan_situations', 'game_plan_plays', 'coach_cards', 'game_plan_templates', 'game_plan_analytics')
      AND t.schemaname = 'public'
    ORDER BY t.tablename
  LOOP
    table_count := table_count + 1;
    RAISE NOTICE '✓ % (% columns)', rec.tablename, rec.col_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Summary: Found %/6 expected tables', table_count;
  
  -- Check game_plans has the key Brian Billick columns
  SELECT COUNT(*) INTO total_columns
  FROM information_schema.columns 
  WHERE table_name = 'game_plans' 
    AND column_name IN ('is_active', 'total_situations', 'total_plays_assigned', 'scouting_report', 'preparation_status');
    
  RAISE NOTICE 'game_plans has %/5 key Brian Billick columns', total_columns;
  
  -- Check triggers exist
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_game_plan_situation_count') THEN
    RAISE NOTICE '✓ Situation count trigger exists';
  ELSE
    RAISE NOTICE '⚠ Situation count trigger missing';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_game_plan_play_count') THEN
    RAISE NOTICE '✓ Play count trigger exists';
  ELSE
    RAISE NOTICE '⚠ Play count trigger missing';
  END IF;
  
  RAISE NOTICE '';
  IF table_count = 6 AND total_columns = 5 THEN
    RAISE NOTICE '🎉 COMPLETE GAME PLANNING SYSTEM VERIFIED SUCCESSFULLY!';
    RAISE NOTICE 'Your database is ready for Phase 2 game planning! 🏈';
  ELSE
    RAISE NOTICE '⚠ Some components may be missing - check the details above';
  END IF;
END;
$$;
