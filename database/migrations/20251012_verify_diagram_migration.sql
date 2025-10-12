-- Verification Script for diagram_data Migration
-- Run this to check if the migration was successful
-- Created: October 12, 2025

\echo '============================================='
\echo 'DIAGRAM MIGRATION VERIFICATION'
\echo '============================================='
\echo ''

-- ===========================================
-- CHECK 1: Verify columns exist
-- ===========================================
\echo '✓ CHECK 1: Verify new columns exist...'
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plays' 
  AND column_name IN ('diagram_data', 'diagram_version', 'diagram_url')
ORDER BY column_name;

\echo ''

-- ===========================================
-- CHECK 2: Verify indexes exist
-- ===========================================
\echo '✓ CHECK 2: Verify indexes exist...'
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'plays'
  AND indexname LIKE '%diagram%'
ORDER BY indexname;

\echo ''

-- ===========================================
-- CHECK 3: Verify constraints exist
-- ===========================================
\echo '✓ CHECK 3: Verify constraints exist...'
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'plays'::regclass
  AND conname LIKE '%diagram%'
ORDER BY conname;

\echo ''

-- ===========================================
-- CHECK 4: Verify helper functions exist
-- ===========================================
\echo '✓ CHECK 4: Verify helper functions exist...'
SELECT 
  proname AS function_name,
  pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname IN ('get_diagram_player_count', 'get_diagram_players_by_team')
ORDER BY proname;

\echo ''

-- ===========================================
-- CHECK 5: Check data migration
-- ===========================================
\echo '✓ CHECK 5: Check data migration status...'
SELECT 
  COUNT(*) FILTER (WHERE diagram_data IS NOT NULL) as plays_with_diagram_data,
  COUNT(*) FILTER (WHERE diagram_version IS NOT NULL) as plays_with_version,
  COUNT(*) FILTER (WHERE diagram_url IS NOT NULL AND diagram_url LIKE '{%') as plays_with_json_in_url,
  COUNT(*) as total_plays
FROM plays;

\echo ''

-- ===========================================
-- CHECK 6: Sample diagram data
-- ===========================================
\echo '✓ CHECK 6: Sample diagram data (if any exists)...'
SELECT 
  id,
  play_name,
  formation,
  diagram_version,
  get_diagram_player_count(diagram_data) as player_count,
  CASE 
    WHEN diagram_data IS NOT NULL THEN 'HAS DATA'
    ELSE 'NO DATA'
  END as status
FROM plays
WHERE diagram_data IS NOT NULL
LIMIT 5;

\echo ''
\echo '============================================='
\echo 'VERIFICATION COMPLETE'
\echo '============================================='
\echo ''
\echo 'Expected Results:'
\echo '  ✓ 2 columns exist (diagram_data JSONB, diagram_version INTEGER)'
\echo '  ✓ 3 indexes exist (diagram_data, diagram_version, diagram_players)'
\echo '  ✓ 2 constraints exist (version_check, requires_version)'
\echo '  ✓ 2 functions exist (get_diagram_player_count, get_diagram_players_by_team)'
\echo '  ✓ Data migrated (if you had JSON in diagram_url before)'
\echo ''
