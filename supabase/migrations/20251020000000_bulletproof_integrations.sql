-- =====================================================
-- Bulletproof Integration Enhancements
-- =====================================================
-- Date: October 20, 2025
-- Purpose: Comprehensive optimizations for data integrity and automation
-- 
-- Features:
-- 1. Auto-populate formation_id from formation TEXT
-- 2. Auto-populate personnel_id from personnel TEXT  
-- 3. Cascade updates for formation/personnel renames
-- 4. Soft deletes for formations and personnel
-- 5. Formation direction auto-inference
-- 6. Formation-personnel compatibility validation
-- =====================================================

-- =====================================================
-- PART 1: AUTO-POPULATE FORMATION_ID FROM TEXT
-- =====================================================

-- Function: Auto-populate formation_id when formation TEXT matches a formation name
CREATE OR REPLACE FUNCTION auto_populate_formation_id()
RETURNS TRIGGER AS $$
DECLARE
  matching_formation_id UUID;
BEGIN
  -- Only auto-populate if formation_id is NULL and formation TEXT is provided
  IF NEW.formation_id IS NULL AND NEW.formation IS NOT NULL AND NEW.formation != '' THEN
    -- Try to find matching formation by name in same playbook
    SELECT id INTO matching_formation_id
    FROM formations
    WHERE playbook_id = NEW.playbook_id
      AND LOWER(TRIM(name)) = LOWER(TRIM(NEW.formation))
      AND deleted_at IS NULL  -- Only match active formations
    LIMIT 1;
    
    -- If match found, set formation_id
    IF matching_formation_id IS NOT NULL THEN
      NEW.formation_id := matching_formation_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Apply on INSERT and UPDATE of plays
DROP TRIGGER IF EXISTS trigger_auto_populate_formation_id ON plays;
CREATE TRIGGER trigger_auto_populate_formation_id
  BEFORE INSERT OR UPDATE OF formation, formation_id, playbook_id ON plays
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_formation_id();

COMMENT ON FUNCTION auto_populate_formation_id() IS 'Automatically links plays.formation_id when plays.formation TEXT matches a formation.name';

-- =====================================================
-- PART 2: AUTO-POPULATE PERSONNEL_ID FROM TEXT
-- =====================================================

-- Function: Auto-populate personnel_id when personnel TEXT matches a config name
CREATE OR REPLACE FUNCTION auto_populate_personnel_id()
RETURNS TRIGGER AS $$
DECLARE
  matching_personnel_id UUID;
BEGIN
  -- Only auto-populate if personnel_id is NULL and personnel TEXT is provided
  IF NEW.personnel_id IS NULL AND NEW.personnel IS NOT NULL AND NEW.personnel != '' THEN
    -- Try to find matching personnel config by name in same playbook
    SELECT id INTO matching_personnel_id
    FROM personnel_configurations
    WHERE playbook_id = NEW.playbook_id
      AND LOWER(TRIM(name)) = LOWER(TRIM(NEW.personnel))
      AND deleted_at IS NULL  -- Only match active configs
    LIMIT 1;
    
    -- If match found, set personnel_id
    IF matching_personnel_id IS NOT NULL THEN
      NEW.personnel_id := matching_personnel_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Apply on INSERT and UPDATE of plays
DROP TRIGGER IF EXISTS trigger_auto_populate_personnel_id ON plays;
CREATE TRIGGER trigger_auto_populate_personnel_id
  BEFORE INSERT OR UPDATE OF personnel, personnel_id, playbook_id ON plays
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_personnel_id();

COMMENT ON FUNCTION auto_populate_personnel_id() IS 'Automatically links plays.personnel_id when plays.personnel TEXT matches a personnel_configurations.name';

-- =====================================================
-- PART 3: CASCADE RENAME UPDATES
-- =====================================================

-- Function: Update plays.formation TEXT when formation name changes
CREATE OR REPLACE FUNCTION cascade_formation_rename()
RETURNS TRIGGER AS $$
BEGIN
  -- Only cascade if name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Update all plays that reference this formation
    UPDATE plays
    SET 
      formation = NEW.name,
      updated_at = NOW()
    WHERE formation_id = NEW.id;
    
    -- Log the cascade for audit
    RAISE NOTICE 'Cascaded formation rename: % plays updated from "%" to "%"',
      (SELECT COUNT(*) FROM plays WHERE formation_id = NEW.id),
      OLD.name,
      NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Apply on UPDATE of formations
DROP TRIGGER IF EXISTS trigger_cascade_formation_rename ON formations;
CREATE TRIGGER trigger_cascade_formation_rename
  AFTER UPDATE OF name ON formations
  FOR EACH ROW
  WHEN (OLD.name IS DISTINCT FROM NEW.name)
  EXECUTE FUNCTION cascade_formation_rename();

-- Function: Update plays.personnel TEXT when personnel config name changes
CREATE OR REPLACE FUNCTION cascade_personnel_rename()
RETURNS TRIGGER AS $$
BEGIN
  -- Only cascade if name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Update all plays that reference this personnel config
    UPDATE plays
    SET 
      personnel = NEW.name,
      updated_at = NOW()
    WHERE personnel_id = NEW.id;
    
    -- Log the cascade for audit
    RAISE NOTICE 'Cascaded personnel rename: % plays updated from "%" to "%"',
      (SELECT COUNT(*) FROM plays WHERE personnel_id = NEW.id),
      OLD.name,
      NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Apply on UPDATE of personnel_configurations
DROP TRIGGER IF EXISTS trigger_cascade_personnel_rename ON personnel_configurations;
CREATE TRIGGER trigger_cascade_personnel_rename
  AFTER UPDATE OF name ON personnel_configurations
  FOR EACH ROW
  WHEN (OLD.name IS DISTINCT FROM NEW.name)
  EXECUTE FUNCTION cascade_personnel_rename();

COMMENT ON FUNCTION cascade_formation_rename() IS 'Syncs plays.formation TEXT when formations.name changes';
COMMENT ON FUNCTION cascade_personnel_rename() IS 'Syncs plays.personnel TEXT when personnel_configurations.name changes';

-- =====================================================
-- PART 4: SOFT DELETES
-- =====================================================

-- Add deleted_at column to formations (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formations' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE formations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    CREATE INDEX idx_formations_deleted_at ON formations(deleted_at) WHERE deleted_at IS NULL;
  END IF;
END $$;

-- Add deleted_at column to personnel_configurations (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personnel_configurations' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE personnel_configurations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    CREATE INDEX idx_personnel_configurations_deleted_at ON personnel_configurations(deleted_at) WHERE deleted_at IS NULL;
  END IF;
END $$;

COMMENT ON COLUMN formations.deleted_at IS 'Soft delete timestamp - NULL means active, non-NULL means deleted';
COMMENT ON COLUMN personnel_configurations.deleted_at IS 'Soft delete timestamp - NULL means active, non-NULL means deleted';

-- Function: Soft delete formation (sets deleted_at instead of hard delete)
CREATE OR REPLACE FUNCTION soft_delete_formation(formation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE formations
  SET 
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = formation_id
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Restore soft-deleted formation
CREATE OR REPLACE FUNCTION restore_formation(formation_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE formations
  SET 
    deleted_at = NULL,
    updated_at = NOW()
  WHERE id = formation_id
    AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Soft delete personnel configuration
CREATE OR REPLACE FUNCTION soft_delete_personnel_config(config_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE personnel_configurations
  SET 
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = config_id
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Restore soft-deleted personnel configuration
CREATE OR REPLACE FUNCTION restore_personnel_config(config_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE personnel_configurations
  SET 
    deleted_at = NULL,
    updated_at = NOW()
  WHERE id = config_id
    AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION soft_delete_formation IS 'Soft delete formation without breaking FK references';
COMMENT ON FUNCTION restore_formation IS 'Restore a soft-deleted formation';
COMMENT ON FUNCTION soft_delete_personnel_config IS 'Soft delete personnel config without breaking FK references';
COMMENT ON FUNCTION restore_personnel_config IS 'Restore a soft-deleted personnel config';

-- =====================================================
-- PART 5: FORMATION DIRECTION AUTO-INFERENCE
-- =====================================================

-- Function: Auto-infer formation direction from formation name
CREATE OR REPLACE FUNCTION auto_infer_formation_direction()
RETURNS TRIGGER AS $$
DECLARE
  inferred_direction TEXT;
BEGIN
  -- Only infer if formation_id is set but formation_direction is NULL
  IF NEW.formation_id IS NOT NULL AND NEW.formation_direction IS NULL THEN
    -- Check formation name for direction keywords
    SELECT 
      CASE
        WHEN LOWER(name) ~ '\y(right|rt|r)\y' THEN 'right'
        WHEN LOWER(name) ~ '\y(left|lt|l)\y' THEN 'left'
        ELSE 'base'
      END
    INTO inferred_direction
    FROM formations
    WHERE id = NEW.formation_id;
    
    -- Set the inferred direction
    IF inferred_direction IS NOT NULL THEN
      NEW.formation_direction := inferred_direction;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Apply on INSERT and UPDATE of plays
DROP TRIGGER IF EXISTS trigger_auto_infer_formation_direction ON plays;
CREATE TRIGGER trigger_auto_infer_formation_direction
  BEFORE INSERT OR UPDATE OF formation_id, formation_direction ON plays
  FOR EACH ROW
  EXECUTE FUNCTION auto_infer_formation_direction();

COMMENT ON FUNCTION auto_infer_formation_direction() IS 'Auto-infers formation_direction from formation name (e.g., "Trips Right" → "right")';

-- =====================================================
-- PART 6: FORMATION-PERSONNEL COMPATIBILITY VALIDATION
-- =====================================================

-- Function: Validate formation-personnel compatibility
CREATE OR REPLACE FUNCTION validate_formation_personnel_compatibility()
RETURNS TRIGGER AS $$
DECLARE
  formation_personnel_id UUID;
  play_personnel_id UUID;
BEGIN
  -- Only validate if both formation_id and personnel_id are set
  IF NEW.formation_id IS NOT NULL AND NEW.personnel_id IS NOT NULL THEN
    -- Get the personnel_id from the selected formation
    SELECT personnel_id INTO formation_personnel_id
    FROM formations
    WHERE id = NEW.formation_id
      AND deleted_at IS NULL;
    
    -- If formation has a personnel requirement, validate compatibility
    IF formation_personnel_id IS NOT NULL AND formation_personnel_id != NEW.personnel_id THEN
      RAISE EXCEPTION 'Formation-personnel mismatch: Selected formation requires personnel_id %, but play has %',
        formation_personnel_id, NEW.personnel_id
        USING HINT = 'Change the personnel to match the formation, or choose a different formation';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Apply on INSERT and UPDATE of plays
DROP TRIGGER IF EXISTS trigger_validate_formation_personnel_compatibility ON plays;
CREATE TRIGGER trigger_validate_formation_personnel_compatibility
  BEFORE INSERT OR UPDATE OF formation_id, personnel_id ON plays
  FOR EACH ROW
  EXECUTE FUNCTION validate_formation_personnel_compatibility();

COMMENT ON FUNCTION validate_formation_personnel_compatibility() IS 'Prevents incompatible formation-personnel combinations (e.g., 11 personnel with 22 formation)';

-- =====================================================
-- PART 7: FORMATION VARIANT CONSISTENCY CHECKS
-- =====================================================

-- Function: Validate formation opposite_formation_id is bidirectional
CREATE OR REPLACE FUNCTION check_formation_variant_consistency()
RETURNS TABLE (
  formation_id UUID,
  formation_name TEXT,
  issue_type TEXT,
  issue_description TEXT
) AS $$
BEGIN
  -- Check 1: Opposite formation doesn't link back
  RETURN QUERY
  SELECT 
    f1.id,
    f1.name,
    'broken_link'::TEXT,
    FORMAT('Formation "%s" links to "%s" but reverse link is missing', f1.name, f2.name)
  FROM formations f1
  JOIN formations f2 ON f1.opposite_formation_id = f2.id
  WHERE f1.deleted_at IS NULL
    AND f2.deleted_at IS NULL
    AND (f2.opposite_formation_id IS NULL OR f2.opposite_formation_id != f1.id);
  
  -- Check 2: Opposite formations have different personnel
  RETURN QUERY
  SELECT 
    f1.id,
    f1.name,
    'personnel_mismatch'::TEXT,
    FORMAT('Formation "%s" and opposite "%s" have different personnel', f1.name, f2.name)
  FROM formations f1
  JOIN formations f2 ON f1.opposite_formation_id = f2.id
  WHERE f1.deleted_at IS NULL
    AND f2.deleted_at IS NULL
    AND f1.personnel_id IS DISTINCT FROM f2.personnel_id;
  
  -- Check 3: Formations with direction but no opposite
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    'missing_opposite'::TEXT,
    FORMAT('Formation "%s" has direction "%s" but no opposite formation linked', f.name, f.direction)
  FROM formations f
  WHERE f.deleted_at IS NULL
    AND f.direction IS NOT NULL
    AND f.opposite_formation_id IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_formation_variant_consistency() IS 'Audits formation opposite_formation_id relationships for consistency issues';

-- Function: Auto-fix broken bidirectional links
CREATE OR REPLACE FUNCTION fix_formation_variant_links()
RETURNS TABLE (
  fixed_formation_id UUID,
  fixed_formation_name TEXT,
  fix_description TEXT
) AS $$
DECLARE
  formation_record RECORD;
  opposite_record RECORD;
BEGIN
  -- Fix broken bidirectional links
  FOR formation_record IN
    SELECT f1.id, f1.name, f1.opposite_formation_id, f2.name as opposite_name
    FROM formations f1
    JOIN formations f2 ON f1.opposite_formation_id = f2.id
    WHERE f1.deleted_at IS NULL
      AND f2.deleted_at IS NULL
      AND (f2.opposite_formation_id IS NULL OR f2.opposite_formation_id != f1.id)
  LOOP
    -- Update the opposite formation to link back
    UPDATE formations
    SET 
      opposite_formation_id = formation_record.id,
      updated_at = NOW()
    WHERE id = formation_record.opposite_formation_id;
    
    RETURN QUERY SELECT 
      formation_record.id,
      formation_record.name,
      FORMAT('Fixed bidirectional link with "%s"', formation_record.opposite_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fix_formation_variant_links() IS 'Automatically repairs broken bidirectional opposite_formation_id relationships';

-- =====================================================
-- PART 8: AUDIT VIEWS
-- =====================================================

-- View: Plays missing formation_id link
CREATE OR REPLACE VIEW plays_missing_formation_link AS
SELECT 
  p.id,
  p.play_name,
  p.formation as formation_text,
  p.playbook_id,
  f.id as matching_formation_id,
  f.name as matching_formation_name
FROM plays p
LEFT JOIN formations f ON 
  f.playbook_id = p.playbook_id 
  AND LOWER(TRIM(f.name)) = LOWER(TRIM(p.formation))
  AND f.deleted_at IS NULL
WHERE p.formation_id IS NULL
  AND p.formation IS NOT NULL
  AND p.formation != ''
  AND p.is_archived = FALSE;

-- View: Plays missing personnel_id link
CREATE OR REPLACE VIEW plays_missing_personnel_link AS
SELECT 
  p.id,
  p.play_name,
  p.personnel as personnel_text,
  p.playbook_id,
  pc.id as matching_personnel_id,
  pc.name as matching_personnel_name
FROM plays p
LEFT JOIN personnel_configurations pc ON 
  pc.playbook_id = p.playbook_id 
  AND LOWER(TRIM(pc.name)) = LOWER(TRIM(p.personnel))
  AND pc.deleted_at IS NULL
WHERE p.personnel_id IS NULL
  AND p.personnel IS NOT NULL
  AND p.personnel != ''
  AND p.is_archived = FALSE;

-- View: Formations without personnel link
CREATE OR REPLACE VIEW formations_missing_personnel AS
SELECT 
  id,
  name,
  playbook_id,
  category,
  direction,
  usage_count
FROM formations
WHERE personnel_id IS NULL
  AND deleted_at IS NULL
ORDER BY usage_count DESC;

-- View: Orphaned personnel configurations (not used by any play or formation)
CREATE OR REPLACE VIEW orphaned_personnel_configs AS
SELECT 
  pc.id,
  pc.name,
  pc.playbook_id,
  COALESCE(play_count, 0) as play_count,
  COALESCE(formation_count, 0) as formation_count
FROM personnel_configurations pc
LEFT JOIN (
  SELECT personnel_id, COUNT(*) as play_count
  FROM plays
  WHERE personnel_id IS NOT NULL AND is_archived = FALSE
  GROUP BY personnel_id
) p ON pc.id = p.personnel_id
LEFT JOIN (
  SELECT personnel_id, COUNT(*) as formation_count
  FROM formations
  WHERE personnel_id IS NOT NULL AND deleted_at IS NULL
  GROUP BY personnel_id
) f ON pc.id = f.personnel_id
WHERE pc.deleted_at IS NULL
  AND COALESCE(play_count, 0) = 0
  AND COALESCE(formation_count, 0) = 0;

COMMENT ON VIEW plays_missing_formation_link IS 'Plays that have formation TEXT but missing formation_id FK';
COMMENT ON VIEW plays_missing_personnel_link IS 'Plays that have personnel TEXT but missing personnel_id FK';
COMMENT ON VIEW formations_missing_personnel IS 'Formations without personnel_id link';
COMMENT ON VIEW orphaned_personnel_configs IS 'Personnel configs not referenced by any play or formation';

-- =====================================================
-- PART 9: BATCH LINKING UTILITIES
-- =====================================================

-- Function: Batch link plays to formations by matching TEXT to name
CREATE OR REPLACE FUNCTION batch_link_plays_to_formations(
  p_playbook_id UUID DEFAULT NULL,
  dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  play_id UUID,
  play_name TEXT,
  formation_text TEXT,
  matched_formation_id UUID,
  matched_formation_name TEXT,
  action TEXT
) AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  IF dry_run THEN
    -- Dry run: just show what would be updated
    RETURN QUERY
    SELECT 
      p.id,
      p.play_name,
      p.formation,
      f.id,
      f.name,
      'WOULD UPDATE'::TEXT
    FROM plays p
    JOIN formations f ON 
      f.playbook_id = p.playbook_id 
      AND LOWER(TRIM(f.name)) = LOWER(TRIM(p.formation))
      AND f.deleted_at IS NULL
    WHERE p.formation_id IS NULL
      AND p.formation IS NOT NULL
      AND p.formation != ''
      AND p.is_archived = FALSE
      AND (p_playbook_id IS NULL OR p.playbook_id = p_playbook_id);
  ELSE
    -- Actually perform the updates
    WITH updates AS (
      UPDATE plays p
      SET 
        formation_id = f.id,
        updated_at = NOW()
      FROM formations f
      WHERE f.playbook_id = p.playbook_id 
        AND LOWER(TRIM(f.name)) = LOWER(TRIM(p.formation))
        AND f.deleted_at IS NULL
        AND p.formation_id IS NULL
        AND p.formation IS NOT NULL
        AND p.formation != ''
        AND p.is_archived = FALSE
        AND (p_playbook_id IS NULL OR p.playbook_id = p_playbook_id)
      RETURNING p.id, p.play_name, p.formation, f.id as formation_id, f.name
    )
    SELECT 
      u.id,
      u.play_name,
      u.formation,
      u.formation_id,
      u.name,
      'UPDATED'::TEXT
    FROM updates u INTO play_id, play_name, formation_text, matched_formation_id, matched_formation_name, action;
    
    RETURN QUERY
    SELECT * FROM (VALUES (play_id, play_name, formation_text, matched_formation_id, matched_formation_name, action)) AS t;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION batch_link_plays_to_formations IS 'Batch links plays to formations by matching formation TEXT to name. Use dry_run=true to preview';

-- Function: Batch link plays to personnel by matching TEXT to name
CREATE OR REPLACE FUNCTION batch_link_plays_to_personnel(
  p_playbook_id UUID DEFAULT NULL,
  dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  play_id UUID,
  play_name TEXT,
  personnel_text TEXT,
  matched_personnel_id UUID,
  matched_personnel_name TEXT,
  action TEXT
) AS $$
BEGIN
  IF dry_run THEN
    -- Dry run: just show what would be updated
    RETURN QUERY
    SELECT 
      p.id,
      p.play_name,
      p.personnel,
      pc.id,
      pc.name,
      'WOULD UPDATE'::TEXT
    FROM plays p
    JOIN personnel_configurations pc ON 
      pc.playbook_id = p.playbook_id 
      AND LOWER(TRIM(pc.name)) = LOWER(TRIM(p.personnel))
      AND pc.deleted_at IS NULL
    WHERE p.personnel_id IS NULL
      AND p.personnel IS NOT NULL
      AND p.personnel != ''
      AND p.is_archived = FALSE
      AND (p_playbook_id IS NULL OR p.playbook_id = p_playbook_id);
  ELSE
    -- Actually perform the updates
    WITH updates AS (
      UPDATE plays p
      SET 
        personnel_id = pc.id,
        updated_at = NOW()
      FROM personnel_configurations pc
      WHERE pc.playbook_id = p.playbook_id 
        AND LOWER(TRIM(pc.name)) = LOWER(TRIM(p.personnel))
        AND pc.deleted_at IS NULL
        AND p.personnel_id IS NULL
        AND p.personnel IS NOT NULL
        AND p.personnel != ''
        AND p.is_archived = FALSE
        AND (p_playbook_id IS NULL OR p.playbook_id = p_playbook_id)
      RETURNING p.id, p.play_name, p.personnel, pc.id as personnel_id, pc.name
    )
    SELECT 
      u.id,
      u.play_name,
      u.personnel,
      u.personnel_id,
      u.name,
      'UPDATED'::TEXT
    FROM updates u INTO play_id, play_name, personnel_text, matched_personnel_id, matched_personnel_name, action;
    
    RETURN QUERY
    SELECT * FROM (VALUES (play_id, play_name, personnel_text, matched_personnel_id, matched_personnel_name, action)) AS t;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION batch_link_plays_to_personnel IS 'Batch links plays to personnel by matching personnel TEXT to name. Use dry_run=true to preview';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary
DO $$
BEGIN
  RAISE NOTICE '✅ Bulletproof Integration Enhancements Applied Successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Summary:';
  RAISE NOTICE '  ✅ Auto-populate formation_id from TEXT';
  RAISE NOTICE '  ✅ Auto-populate personnel_id from TEXT';
  RAISE NOTICE '  ✅ Cascade updates for renames';
  RAISE NOTICE '  ✅ Soft deletes for formations & personnel';
  RAISE NOTICE '  ✅ Formation direction auto-inference';
  RAISE NOTICE '  ✅ Formation-personnel compatibility validation';
  RAISE NOTICE '  ✅ Formation variant consistency checks';
  RAISE NOTICE '  ✅ Audit views for data quality';
  RAISE NOTICE '  ✅ Batch linking utilities';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Available Audit Queries:';
  RAISE NOTICE '  SELECT * FROM plays_missing_formation_link;';
  RAISE NOTICE '  SELECT * FROM plays_missing_personnel_link;';
  RAISE NOTICE '  SELECT * FROM formations_missing_personnel;';
  RAISE NOTICE '  SELECT * FROM orphaned_personnel_configs;';
  RAISE NOTICE '  SELECT * FROM check_formation_variant_consistency();';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Batch Linking (Preview):';
  RAISE NOTICE '  SELECT * FROM batch_link_plays_to_formations(NULL, true);';
  RAISE NOTICE '  SELECT * FROM batch_link_plays_to_personnel(NULL, true);';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Batch Linking (Apply):';
  RAISE NOTICE '  SELECT * FROM batch_link_plays_to_formations(NULL, false);';
  RAISE NOTICE '  SELECT * FROM batch_link_plays_to_personnel(NULL, false);';
END $$;
