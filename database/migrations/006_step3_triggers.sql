-- =============================================================================
-- MIGRATION 006 STEP 3: AUTOMATED TRIGGERS
-- Practice duration calculation and time management triggers
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- TRIGGERS FOR AUTOMATED CALCULATIONS
-- =============================================================================

-- Update practice_schedules total_duration when blocks change
CREATE OR REPLACE FUNCTION update_practice_total_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the referenced columns exist before attempting update
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'practice_schedules' 
    AND column_name = 'total_duration'
  ) THEN
    UPDATE practice_schedules 
    SET total_duration = (
      SELECT COALESCE(SUM(duration_minutes), 0)
      FROM practice_blocks 
      WHERE schedule_id = COALESCE(NEW.schedule_id, OLD.schedule_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.schedule_id, OLD.schedule_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_practice_duration
  AFTER INSERT OR UPDATE OR DELETE ON practice_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_total_duration();

-- =============================================================================
-- STEP 3 COMPLETION STATUS
-- =============================================================================

-- Migration 006 Step 3: Automated Triggers
-- ✅ Practice duration calculation trigger created
-- ✅ Column existence verification added for safety
-- ✅ Trigger handles INSERT, UPDATE, DELETE operations

-- Ready for Step 4: 8-Box Layout System
