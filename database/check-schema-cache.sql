-- =====================================================
-- Schema Cache Reload and Column Verification
-- =====================================================
-- Run this in Supabase SQL Editor when you get:
-- "Could not find column in schema cache" errors
-- =====================================================

-- Step 1: Check if created_by column exists in teams table
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'teams'
  AND column_name = 'created_by';

-- Step 2: If the column doesn't exist, add it
-- (Only runs if the above query returns no rows)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'teams' 
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE teams 
    ADD COLUMN created_by UUID REFERENCES auth.users(id);
    
    RAISE NOTICE 'Added created_by column to teams table';
  ELSE
    RAISE NOTICE 'created_by column already exists in teams table';
  END IF;
END $$;

-- Step 3: Check plays table columns
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'plays'
  AND column_name IN ('created_by', 'team_id')
ORDER BY column_name;

-- Step 4: Reload PostgREST schema cache
-- This forces PostgREST to refresh its understanding of the schema
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify all key tables have the expected columns
SELECT 
  t.table_name,
  ARRAY_AGG(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
  ON c.table_schema = t.table_schema 
  AND c.table_name = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('teams', 'plays', 'practice_scripts', 'playbooks')
GROUP BY t.table_name
ORDER BY t.table_name;

-- Step 6: Check RLS policies on teams table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'teams'
ORDER BY policyname;

-- Expected output:
-- 1. Query 1 should show the created_by column exists
-- 2. Query 2 should confirm or add the column
-- 3. Query 3 should show plays table has created_by and team_id
-- 4. Query 4 sends the reload signal
-- 5. Query 5 shows all columns for key tables
-- 6. Query 6 shows RLS policies on teams

-- =====================================================
-- Manual Cache Reload (if NOTIFY doesn't work)
-- =====================================================
-- Alternative: Restart the PostgREST server
-- Go to: Supabase Dashboard → Project Settings → API
-- Click: "Restart Server" under PostgREST Settings
-- =====================================================
