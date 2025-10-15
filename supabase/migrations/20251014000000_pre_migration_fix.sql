-- =====================================================
-- PRE-MIGRATION FIX: Clean Up Orphaned Variants
-- Date: October 14, 2025
-- Purpose: Fix existing data violations before applying constraints
-- Run this BEFORE the main bulletproofing migration
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: IDENTIFY PROBLEMATIC DATA
-- =====================================================

-- Find variants without a parent (violates upcoming constraint)
SELECT 
  id,
  name,
  direction,
  base_formation_id,
  '⚠️ Variant without parent - will be converted to base' as issue
FROM formations
WHERE direction IN ('left', 'right') 
  AND base_formation_id IS NULL;

-- =====================================================
-- STEP 2: FIX ORPHANED VARIANTS
-- =====================================================

-- Strategy: For orphaned variants, we need to be smart
-- Option A: If a base with same name exists → Delete the orphan
-- Option B: If no base exists → Convert to base
-- Option C: Rename the orphan and convert to base

-- First, identify if there's a naming conflict
WITH orphaned_variants AS (
  SELECT 
    id,
    playbook_id,
    name,
    direction
  FROM formations
  WHERE direction IN ('left', 'right') 
    AND base_formation_id IS NULL
),
base_formations AS (
  SELECT 
    playbook_id,
    name
  FROM formations
  WHERE direction = 'base'
),
conflicts AS (
  SELECT 
    o.id,
    o.playbook_id,
    o.name,
    o.direction,
    CASE 
      WHEN b.name IS NOT NULL THEN 'has_base'
      ELSE 'no_base'
    END as conflict_type
  FROM orphaned_variants o
  LEFT JOIN base_formations b ON o.playbook_id = b.playbook_id AND o.name = b.name
)
SELECT * FROM conflicts;

-- Fix Option 1: Delete orphaned variants that have a base with same name
-- (They're redundant - base already exists)
DELETE FROM formations
WHERE id IN (
  SELECT o.id
  FROM formations o
  WHERE o.direction IN ('left', 'right')
    AND o.base_formation_id IS NULL
    AND EXISTS (
      SELECT 1 
      FROM formations b 
      WHERE b.playbook_id = o.playbook_id 
        AND b.name = o.name 
        AND b.direction = 'base'
    )
);

-- Fix Option 2: Convert orphaned variants to base if no base exists with same name
-- (Safe - no naming conflict)
UPDATE formations
SET direction = 'base'
WHERE direction IN ('left', 'right') 
  AND base_formation_id IS NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM formations b 
    WHERE b.playbook_id = formations.playbook_id 
      AND b.name = formations.name 
      AND b.direction = 'base'
  );

-- Report what was fixed
SELECT 
  'Orphaned variants fixed' as action,
  COUNT(CASE WHEN direction = 'base' THEN 1 END) as converted_to_base
FROM formations;

-- =====================================================
-- STEP 3: FIND BASE FORMATIONS WITH PARENTS (Impossible State)
-- =====================================================

-- Find base formations that incorrectly have a parent
SELECT 
  id,
  name,
  direction,
  base_formation_id,
  '⚠️ Base formation with parent - will remove parent' as issue
FROM formations
WHERE direction = 'base' 
  AND base_formation_id IS NOT NULL;

-- =====================================================
-- STEP 4: FIX BASE FORMATIONS WITH PARENTS
-- =====================================================

-- Remove parent from base formations
UPDATE formations
SET base_formation_id = NULL
WHERE direction = 'base' 
  AND base_formation_id IS NOT NULL;

-- =====================================================
-- STEP 5: FIND SELF-REFERENCES
-- =====================================================

-- Find formations that point to themselves (should be impossible)
SELECT 
  id,
  name,
  direction,
  base_formation_id,
  '⚠️ Self-reference detected - will be removed' as issue
FROM formations
WHERE id = base_formation_id;

-- =====================================================
-- STEP 6: FIX SELF-REFERENCES
-- =====================================================

-- Remove self-references
UPDATE formations
SET base_formation_id = NULL,
    direction = 'base'
WHERE id = base_formation_id;

-- =====================================================
-- STEP 7: VERIFICATION
-- =====================================================

-- These should all return 0 after fixes
SELECT 
  'Variants without parent' as check_type,
  COUNT(*) as violation_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM formations
WHERE direction IN ('left', 'right') AND base_formation_id IS NULL
UNION ALL
SELECT 
  'Base with parent' as check_type,
  COUNT(*) as violation_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM formations
WHERE direction = 'base' AND base_formation_id IS NOT NULL
UNION ALL
SELECT 
  'Self-references' as check_type,
  COUNT(*) as violation_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM formations
WHERE id = base_formation_id;

-- =====================================================
-- STEP 8: SUMMARY REPORT
-- =====================================================

SELECT 
  direction,
  COUNT(*) as count,
  COUNT(CASE WHEN base_formation_id IS NULL THEN 1 END) as without_parent,
  COUNT(CASE WHEN base_formation_id IS NOT NULL THEN 1 END) as with_parent
FROM formations
GROUP BY direction
ORDER BY direction;

COMMIT;

-- =====================================================
-- NEXT STEP: Run the main bulletproofing migration
-- =====================================================

-- All checks should show ✅ PASS before proceeding
-- Then run: supabase db push
