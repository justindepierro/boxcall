-- ============================================================================
-- ADD PERSONNEL FOREIGN KEY TO PLAYS
-- ============================================================================
-- Date: October 12, 2025
-- Purpose: Add proper FK relationship plays → personnel_configurations
-- Impact: Referential integrity, faster lookups, better analytics
-- Priority: HIGH - Run this second (after name sync triggers)
-- ============================================================================

-- ========================================
-- 1. ADD COLUMN
-- ========================================

ALTER TABLE plays 
  ADD COLUMN IF NOT EXISTS personnel_id UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL;

COMMENT ON COLUMN plays.personnel_id IS 
  'Foreign key to personnel_configurations.id. SET NULL on delete to preserve play history.';

-- ========================================
-- 2. ADD INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_plays_personnel_id 
  ON plays(personnel_id) WHERE personnel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_plays_playbook_personnel 
  ON plays(playbook_id, personnel_id) WHERE personnel_id IS NOT NULL;

-- ========================================
-- 3. MIGRATE EXISTING DATA
-- ========================================

-- Populate personnel_id for existing plays based on personnel TEXT field
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  WITH personnel_lookup AS (
    SELECT DISTINCT ON (p.playbook_id, p.personnel)
      p.id as play_id,
      pc.id as personnel_id
    FROM plays p
    INNER JOIN personnel_configurations pc 
      ON p.playbook_id = pc.playbook_id 
      AND p.personnel = pc.name
    WHERE p.personnel_id IS NULL
      AND p.personnel IS NOT NULL
      AND p.personnel != ''
  )
  UPDATE plays p
  SET personnel_id = pl.personnel_id
  FROM personnel_lookup pl
  WHERE p.id = pl.play_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Migrated % existing plays to use personnel_id FK', updated_count;
END $$;

-- ========================================
-- 4. ADD TRIGGER TO AUTO-POPULATE
-- ========================================

-- When a play is created or updated with personnel TEXT, auto-populate personnel_id
CREATE OR REPLACE FUNCTION auto_populate_personnel_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If personnel TEXT is set but personnel_id is null, try to populate it
  IF NEW.personnel IS NOT NULL AND NEW.personnel != '' AND NEW.personnel_id IS NULL THEN
    SELECT id INTO NEW.personnel_id
    FROM personnel_configurations
    WHERE playbook_id = NEW.playbook_id
      AND name = NEW.personnel
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_populate_personnel_id
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_personnel_id();

COMMENT ON FUNCTION auto_populate_personnel_id IS 
  'Automatically populates plays.personnel_id when plays.personnel TEXT is set';

-- ========================================
-- 5. VERIFICATION
-- ========================================

DO $$
DECLARE
  total_plays INTEGER;
  plays_with_fk INTEGER;
  plays_with_text INTEGER;
  coverage_percent NUMERIC;
BEGIN
  SELECT COUNT(*) INTO total_plays FROM plays;
  SELECT COUNT(*) INTO plays_with_fk FROM plays WHERE personnel_id IS NOT NULL;
  SELECT COUNT(*) INTO plays_with_text FROM plays WHERE personnel IS NOT NULL AND personnel != '';
  
  IF plays_with_text > 0 THEN
    coverage_percent := ROUND((plays_with_fk::NUMERIC / plays_with_text::NUMERIC) * 100, 1);
  ELSE
    coverage_percent := 0;
  END IF;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Personnel FK migration complete!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total plays: %', total_plays;
  RAISE NOTICE 'Plays with personnel TEXT: %', plays_with_text;
  RAISE NOTICE 'Plays with personnel_id FK: %', plays_with_fk;
  RAISE NOTICE 'Coverage: % percent', coverage_percent;
  RAISE NOTICE '';
  
  IF plays_with_fk < plays_with_text THEN
    RAISE NOTICE '⚠️  % plays could not be linked automatically', (plays_with_text - plays_with_fk);
    RAISE NOTICE '   These may have invalid personnel names or were created before personnel system';
  ELSE
    RAISE NOTICE '🎉 All plays with personnel are now properly linked!';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update src/types/play.ts to add personnel_id field';
  RAISE NOTICE '2. New plays will auto-populate personnel_id via trigger!';
  RAISE NOTICE '3. You can now query plays by personnel_id FK for better performance';
END $$;
