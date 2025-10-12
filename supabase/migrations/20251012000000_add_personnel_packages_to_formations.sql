-- ============================================================================
-- ADD PERSONNEL_PACKAGES TO FORMATIONS TABLE
-- ============================================================================
-- Date: October 12, 2025
-- Purpose: Allow formations to support multiple personnel groupings
--
-- This enables coaches to assign multiple personnel configurations
-- (e.g., "11 Personnel", "12 Personnel") to a single formation,
-- indicating which personnel packages can run that formation.
--
-- Integrates with: Edit Details tab in Formation Builder Modal
-- ============================================================================

-- ===========================================
-- 1. ADD PERSONNEL_PACKAGES COLUMN
-- ===========================================

-- Add array column to store multiple personnel configuration IDs
ALTER TABLE formations 
  ADD COLUMN IF NOT EXISTS personnel_packages UUID[] DEFAULT ARRAY[]::UUID[];

-- ===========================================
-- 2. ADD INDEX FOR EFFICIENT QUERIES
-- ===========================================

-- GIN index for array containment queries (@> operator)
-- Enables fast lookup of "which formations can run 11 Personnel?"
CREATE INDEX IF NOT EXISTS idx_formations_personnel_packages 
  ON formations USING GIN(personnel_packages);

-- ===========================================
-- 3. ADD DOCUMENTATION
-- ===========================================

COMMENT ON COLUMN formations.personnel_packages IS 
  'Array of personnel_configuration.id values that can run this formation. Set via Edit Details tab in Formation Builder.';

-- ===========================================
-- 4. VERIFICATION
-- ===========================================

DO $$
DECLARE
  column_exists BOOLEAN;
  index_exists BOOLEAN;
BEGIN
  -- Check if column was added
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'formations' 
      AND column_name = 'personnel_packages'
  ) INTO column_exists;

  -- Check if index was created
  SELECT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'formations' 
      AND indexname = 'idx_formations_personnel_packages'
  ) INTO index_exists;

  IF column_exists AND index_exists THEN
    RAISE NOTICE '✅ SUCCESS: personnel_packages column added to formations table';
    RAISE NOTICE '✅ SUCCESS: GIN index created for efficient array queries';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Usage: Assign personnel via Edit Details tab in Formation Manager';
    RAISE NOTICE '🔍 Query: SELECT * FROM formations WHERE personnel_packages @> ARRAY[''personnel-uuid'']::UUID[]';
  ELSE
    RAISE EXCEPTION '❌ FAILED: Migration did not complete successfully';
  END IF;
END $$;
