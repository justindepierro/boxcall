-- ============================================================================
-- ADD NAME SYNCHRONIZATION TRIGGERS
-- ============================================================================
-- Date: October 12, 2025
-- Purpose: Auto-update plays when personnel/formation names change
-- Impact: Prevents orphaned TEXT references in plays table
-- Priority: HIGH - Apply immediately after audit
-- ============================================================================

-- ========================================
-- TRIGGER 1: Sync plays.personnel when personnel_configurations.name changes
-- ========================================

CREATE OR REPLACE FUNCTION sync_play_personnel_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Update all plays in the same playbook that reference the old name
    UPDATE plays 
    SET 
      personnel = NEW.name,
      updated_at = NOW()
    WHERE personnel = OLD.name 
      AND playbook_id = NEW.playbook_id;
    
    RAISE NOTICE 'Synced % plays from personnel "%" to "%"', 
      (SELECT COUNT(*) FROM plays WHERE personnel = NEW.name AND playbook_id = NEW.playbook_id),
      OLD.name, 
      NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_play_personnel_name
  AFTER UPDATE OF name ON personnel_configurations
  FOR EACH ROW
  EXECUTE FUNCTION sync_play_personnel_name();

COMMENT ON FUNCTION sync_play_personnel_name IS 
  'Automatically updates plays.personnel TEXT field when personnel configuration name changes';

-- ========================================
-- TRIGGER 2: Sync plays.formation when formations.name changes
-- ========================================

CREATE OR REPLACE FUNCTION sync_play_formation_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if name actually changed
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Update all plays in the same playbook that reference the old name
    UPDATE plays 
    SET 
      formation = NEW.name,
      updated_at = NOW()
    WHERE formation = OLD.name 
      AND playbook_id = NEW.playbook_id;
    
    RAISE NOTICE 'Synced % plays from formation "%" to "%"', 
      (SELECT COUNT(*) FROM plays WHERE formation = NEW.name AND playbook_id = NEW.playbook_id),
      OLD.name, 
      NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_play_formation_name
  AFTER UPDATE OF name ON formations
  FOR EACH ROW
  EXECUTE FUNCTION sync_play_formation_name();

COMMENT ON FUNCTION sync_play_formation_name IS 
  'Automatically updates plays.formation TEXT field when formation name changes';

-- ========================================
-- VERIFICATION
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Name synchronization triggers installed!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Active Triggers:';
  RAISE NOTICE '  1. trigger_sync_play_personnel_name';
  RAISE NOTICE '  2. trigger_sync_play_formation_name';
  RAISE NOTICE '';
  RAISE NOTICE 'When you rename personnel or formations,';
  RAISE NOTICE 'all related plays will auto-update! 🎉';
  RAISE NOTICE '';
  RAISE NOTICE 'Test with:';
  RAISE NOTICE '  UPDATE personnel_configurations SET name = ''Test'' WHERE id = ''your-uuid'';';
  RAISE NOTICE '  UPDATE formations SET name = ''Test Formation'' WHERE id = ''your-uuid'';';
END $$;
