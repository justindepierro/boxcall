-- =====================================================
-- Force PostgREST Schema Cache Reload (SQL Methods)
-- =====================================================
-- Try these methods in order until one works
-- =====================================================

-- METHOD 1: Send NOTIFY signal (we tried this already, but let's be thorough)
-- This sometimes works if PostgREST is listening
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- METHOD 2: Try to trigger a schema change detection
-- Adding a comment can sometimes trigger cache refresh
COMMENT ON TABLE playbooks IS 'Force schema refresh - 2025-10-01';

-- METHOD 3: Verify the columns actually exist
-- This confirms the schema is correct, even if cache is wrong
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('playbooks', 'plays', 'teams', 'team_members')
  AND column_name IN ('created_by', 'team_id', 'is_active')
ORDER BY table_name, column_name;

-- METHOD 4: Show current timestamp (for cache busting)
SELECT 
  'Schema reload attempted at: ' || NOW()::TEXT as message,
  'Wait 30 seconds, then try your app again' as next_step;

-- =====================================================
-- After running this:
-- 1. Wait 30 seconds
-- 2. Hard refresh your app (Cmd + Shift + R)
-- 3. Try creating a play
--
-- If it STILL doesn't work, we need to:
-- → Pause and unpause the entire Supabase project
-- → Or contact Supabase support for forced cache clear
-- =====================================================
