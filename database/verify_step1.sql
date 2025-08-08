-- Quick verification that Step 1 completed successfully
-- Check for all the columns that should have been added

DO $$
DECLARE
  missing_cols TEXT := '';
  total_new_cols INTEGER := 0;
BEGIN
  RAISE NOTICE 'Verifying Step 1 completion...';
  
  -- Check each column that Step 1 should have added
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'is_active') THEN
    total_new_cols := total_new_cols + 1;
    RAISE NOTICE '✓ is_active column exists';
  ELSE
    missing_cols := missing_cols || 'is_active, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'total_situations') THEN
    total_new_cols := total_new_cols + 1;
    RAISE NOTICE '✓ total_situations column exists';
  ELSE
    missing_cols := missing_cols || 'total_situations, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'total_plays_assigned') THEN
    total_new_cols := total_new_cols + 1;
    RAISE NOTICE '✓ total_plays_assigned column exists';
  ELSE
    missing_cols := missing_cols || 'total_plays_assigned, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'scouting_report') THEN
    total_new_cols := total_new_cols + 1;
    RAISE NOTICE '✓ scouting_report column exists';
  ELSE
    missing_cols := missing_cols || 'scouting_report, ';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_plans' AND column_name = 'preparation_status') THEN
    total_new_cols := total_new_cols + 1;
    RAISE NOTICE '✓ preparation_status column exists';
  ELSE
    missing_cols := missing_cols || 'preparation_status, ';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Summary: Found % key columns out of 5', total_new_cols;
  
  IF missing_cols != '' THEN
    RAISE WARNING '⚠ Missing columns: %', RTRIM(missing_cols, ', ');
    RAISE NOTICE 'You may need to re-run Step 1';
  ELSE
    RAISE NOTICE '🎉 Step 1 completed successfully - all key columns present!';
    RAISE NOTICE 'Ready to proceed with Step 2';
  END IF;
END;
$$;
