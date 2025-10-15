-- Verification Queries for Formation Bulletproofing Migration
-- Run these to verify the migration completed successfully

-- 1. Check directionality type distribution
SELECT 
  directionality_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM formations
GROUP BY directionality_type
ORDER BY count DESC;

-- 2. Check for constraint violations (should all return 0)
SELECT 
  'Self-references' as check_type,
  COUNT(*) as violation_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM formations
WHERE id = base_formation_id
UNION ALL
SELECT 
  'Base with parent' as check_type,
  COUNT(*) as violation_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM formations
WHERE direction = 'base' AND base_formation_id IS NOT NULL
UNION ALL
SELECT 
  'Variant without parent' as check_type,
  COUNT(*) as violation_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM formations
WHERE direction IN ('left', 'right') AND base_formation_id IS NULL;

-- 3. Check for orphaned variants (should be 0)
SELECT 
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No orphaned variants'
    ELSE '❌ Found orphaned variants - needs attention'
  END as status
FROM formations
WHERE base_formation_id IS NOT NULL
  AND base_formation_id NOT IN (SELECT id FROM formations);

-- 4. Check for duplicate variants (should be 0)
SELECT 
  base_formation_id,
  direction,
  COUNT(*) as duplicate_count,
  array_agg(id) as duplicate_ids,
  '❌ DUPLICATE VARIANTS FOUND' as status
FROM formations
WHERE base_formation_id IS NOT NULL
GROUP BY base_formation_id, direction
HAVING COUNT(*) > 1;

-- 5. Check formation variant chains completeness
SELECT 
  b.name as base_name,
  b.directionality_type,
  l.name as left_variant_name,
  r.name as right_variant_name,
  CASE 
    WHEN l.id IS NOT NULL AND r.id IS NOT NULL THEN '✅ Complete (L+R)'
    WHEN l.id IS NULL AND r.id IS NOT NULL THEN '⚠️ Missing LEFT'
    WHEN r.id IS NULL AND l.id IS NOT NULL THEN '⚠️ Missing RIGHT'
    ELSE '📝 No variants yet'
  END as status
FROM formations b
LEFT JOIN formations l ON l.base_formation_id = b.id AND l.direction = 'left'
LEFT JOIN formations r ON r.base_formation_id = b.id AND r.direction = 'right'
WHERE b.direction = 'base'
ORDER BY b.name;

-- 6. Check for formations needing directionality type review
SELECT 
  id,
  name,
  direction,
  directionality_type,
  '⚠️ Needs review' as action
FROM formations
WHERE directionality_type = 'unspecified'
ORDER BY name
LIMIT 20;

-- 7. Verify new columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'formations'
  AND column_name IN ('directionality_type', 'version')
ORDER BY column_name;

-- 8. Verify constraints exist
SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition,
  '✅ EXISTS' as status
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'formations'
  AND con.conname IN (
    'formations_no_self_reference',
    'formations_base_has_no_parent',
    'formations_variants_have_parent'
  )
ORDER BY con.conname;

-- 9. Verify triggers exist
SELECT 
  tgname as trigger_name,
  tgenabled::text as enabled,
  '✅ EXISTS' as status
FROM pg_trigger
WHERE tgrelid = 'formations'::regclass
  AND tgname IN (
    'trigger_check_formation_circular',
    'trigger_increment_formation_version'
  )
ORDER BY tgname;

-- 10. Verify functions exist
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition_preview,
  '✅ EXISTS' as status
FROM pg_proc
WHERE proname IN (
  'link_formations_transaction',
  'formation_has_variants',
  'get_formation_variants',
  'is_base_formation',
  'check_formation_circular_reference',
  'increment_formation_version'
)
ORDER BY proname;
