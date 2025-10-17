-- =====================================================
-- Drop Old Formation Constraints (Post-Opposite Migration Fix)
-- =====================================================
-- The 20251016000001_add_opposite_formation_id migration
-- changed the formation system from base_formation_id to opposite_formation_id
-- but didn't drop the old bulletproofing constraints that reference base_formation_id.
--
-- This migration removes those outdated constraints.
-- =====================================================

-- Drop old constraint that requires variants to have base_formation_id
-- (No longer needed since we use opposite_formation_id now)
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_variants_have_parent CASCADE;

-- Drop old constraint about base formations
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_base_has_no_parent CASCADE;

-- Drop old unique index for variants per base
DROP INDEX IF EXISTS idx_formations_unique_variant CASCADE;

-- Drop old unique index for base formation names
DROP INDEX IF EXISTS idx_formations_unique_base_name CASCADE;

-- Add new unique constraint for formation names (allow duplicates for opposites)
-- A formation name can exist multiple times in a playbook (left and right variants)
-- but we should track this at the app level, not with a constraint

-- Verify formations table structure
DO $$
BEGIN
  -- Check that opposite_formation_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formations' AND column_name = 'opposite_formation_id'
  ) THEN
    RAISE EXCEPTION 'opposite_formation_id column not found! Run 20251016000001_add_opposite_formation_id.sql first';
  END IF;
  
  -- Check that direction allows NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'formations' 
      AND column_name = 'direction'
      AND is_nullable = 'NO'
  ) THEN
    RAISE WARNING 'direction column should allow NULL for standalone formations';
  END IF;
  
  RAISE NOTICE '✅ Formation constraints cleanup complete';
END $$;

-- Add helpful comment
COMMENT ON TABLE formations IS 
'Formation definitions with optional left/right variants. 
Variants are linked via opposite_formation_id (bidirectional). 
Standalone formations have direction=NULL and opposite_formation_id=NULL.';
