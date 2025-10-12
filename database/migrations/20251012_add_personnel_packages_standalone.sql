-- ============================================================================
-- STANDALONE: ADD PERSONNEL_PACKAGES TO FORMATIONS TABLE
-- ============================================================================
-- Date: October 12, 2025
-- Purpose: Add personnel_packages column independently (personnel system already exists)
--
-- This migration can be run directly via Supabase SQL Editor if:
-- - Personnel tables already exist
-- - `npx supabase db push` fails with "relation already exists"
-- ============================================================================

-- ===========================================
-- 1. ADD PERSONNEL_PACKAGES COLUMN (IF NOT EXISTS)
-- ===========================================

DO $$
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'formations' 
      AND column_name = 'personnel_packages'
  ) THEN
    -- Add the column
    ALTER TABLE formations 
      ADD COLUMN personnel_packages UUID[] DEFAULT ARRAY[]::UUID[];
    
    RAISE NOTICE '✅ Added personnel_packages column to formations table';
  ELSE
    RAISE NOTICE 'ℹ️  Column personnel_packages already exists - skipping';
  END IF;
END $$;

-- ===========================================
-- 2. ADD INDEX (IF NOT EXISTS)
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'formations' 
      AND indexname = 'idx_formations_personnel_packages'
  ) THEN
    -- Create GIN index for array queries
    CREATE INDEX idx_formations_personnel_packages 
      ON formations USING GIN(personnel_packages);
    
    RAISE NOTICE '✅ Created GIN index on personnel_packages';
  ELSE
    RAISE NOTICE 'ℹ️  Index idx_formations_personnel_packages already exists - skipping';
  END IF;
END $$;

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
  sample_count INTEGER;
BEGIN
  -- Check if column exists
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'formations' 
      AND column_name = 'personnel_packages'
  ) INTO column_exists;

  -- Check if index exists
  SELECT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'formations' 
      AND indexname = 'idx_formations_personnel_packages'
  ) INTO index_exists;

  -- Count formations
  SELECT COUNT(*) INTO sample_count FROM formations;

  -- Report results
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'MIGRATION VERIFICATION REPORT';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Column personnel_packages exists: %', column_exists;
  RAISE NOTICE '✅ Index idx_formations_personnel_packages exists: %', index_exists;
  RAISE NOTICE 'ℹ️  Total formations in database: %', sample_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 USAGE:';
  RAISE NOTICE '  - Open Formation Manager → Edit Details tab';
  RAISE NOTICE '  - Select formation from dropdown';
  RAISE NOTICE '  - Click personnel packages to assign';
  RAISE NOTICE '  - Click Save Formation';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 QUERY EXAMPLE:';
  RAISE NOTICE '  SELECT id, name, personnel_packages';
  RAISE NOTICE '  FROM formations';
  RAISE NOTICE '  WHERE personnel_packages @> ARRAY[''<personnel-uuid>'']::UUID[];';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  
  IF column_exists AND index_exists THEN
    RAISE NOTICE '✅ SUCCESS: Migration completed successfully!';
  ELSE
    RAISE EXCEPTION '❌ FAILED: Migration incomplete';
  END IF;
END $$;
