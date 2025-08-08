-- =============================================================================
-- DEBUG SCRIPT: Check game_plans table structure
-- Run this first to diagnose the issue
-- =============================================================================

-- Check if game_plans table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'game_plans'
) AS table_exists;

-- Check current columns in game_plans table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'game_plans' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if is_active column specifically exists
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_name = 'game_plans' 
  AND column_name = 'is_active'
  AND table_schema = 'public'
) AS is_active_exists;
