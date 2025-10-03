-- =====================================================
-- Audit Current Schema for plays and playbooks Tables
-- =====================================================

-- 1. Check playbooks table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'playbooks'
ORDER BY ordinal_position;

-- 2. Check plays table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'plays'
ORDER BY ordinal_position;

-- 3. Check foreign key relationships for playbooks
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'playbooks';

-- 4. Check foreign key relationships for plays
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'plays';

-- 5. Check indexes on playbooks
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'playbooks'
ORDER BY indexname;

-- 6. Check indexes on plays
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'plays'
ORDER BY indexname;

-- 7. Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('playbooks', 'plays');

-- 8. Check RLS policies on playbooks
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'playbooks'
ORDER BY cmd, policyname;

-- 9. Check RLS policies on plays
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'plays'
ORDER BY cmd, policyname;

-- 10. Sample data from playbooks (if any exists)
SELECT 
  id,
  name,
  team_id,
  created_by,
  created_at
FROM playbooks
LIMIT 5;

-- 11. Sample data from plays (if any exists)
SELECT 
  id,
  playbook_id,
  play_name,
  formation,
  p_type,
  created_at
FROM plays
LIMIT 5;
