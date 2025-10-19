-- Migration: Expand Play Types to Allow Custom Values
-- Date: October 17, 2025
-- Purpose: Remove CHECK constraint on plays.p_type to allow coaches to create custom play types
--          while maintaining data integrity through validation trigger

-- ====================================================================
-- STEP 1: DROP EXISTING CHECK CONSTRAINT
-- ====================================================================

-- Remove the constraint that limits p_type to only ('Pass', 'Run', 'RPO', 'Play Action')
ALTER TABLE plays DROP CONSTRAINT IF EXISTS plays_p_type_check;

-- ====================================================================
-- STEP 2: ADD VALIDATION TRIGGER
-- ====================================================================

-- Create trigger function to validate play type values
CREATE OR REPLACE FUNCTION validate_play_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow NULL values
  IF NEW.p_type IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Trim whitespace
  NEW.p_type = TRIM(NEW.p_type);
  
  -- Validate length (must be 1-50 characters)
  IF LENGTH(NEW.p_type) = 0 THEN
    RAISE EXCEPTION 'Play type cannot be empty';
  END IF;
  
  IF LENGTH(NEW.p_type) > 50 THEN
    RAISE EXCEPTION 'Play type must be 50 characters or less (got %)', LENGTH(NEW.p_type);
  END IF;
  
  -- Validate characters (letters, numbers, spaces, hyphens only)
  IF NEW.p_type !~ '^[A-Za-z0-9\s\-]+$' THEN
    RAISE EXCEPTION 'Play type can only contain letters, numbers, spaces, and hyphens';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_play_type_trigger ON plays;
CREATE TRIGGER validate_play_type_trigger
  BEFORE INSERT OR UPDATE ON plays
  FOR EACH ROW
  EXECUTE FUNCTION validate_play_type();

-- ====================================================================
-- STEP 3: UPDATE EXISTING DATA (if needed)
-- ====================================================================

-- Normalize existing data (trim whitespace)
UPDATE plays 
SET p_type = TRIM(p_type)
WHERE p_type IS NOT NULL AND p_type != TRIM(p_type);

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- Check current play types in use
-- SELECT DISTINCT p_type, COUNT(*) as count
-- FROM plays
-- WHERE p_type IS NOT NULL
-- GROUP BY p_type
-- ORDER BY count DESC;

-- Test new constraint allows custom types
-- INSERT INTO plays (playbook_id, formation, play_name, p_type)
-- VALUES ('...', 'Test', 'Test Play', 'Screen'); -- Should work

-- INSERT INTO plays (playbook_id, formation, play_name, p_type)
-- VALUES ('...', 'Test', 'Test Play', 'Bootleg'); -- Should work

-- INSERT INTO plays (playbook_id, formation, play_name, p_type)
-- VALUES ('...', 'Test', 'Test Play', 'My Custom Type'); -- Should work

-- Test validation still works
-- INSERT INTO plays (playbook_id, formation, play_name, p_type)
-- VALUES ('...', 'Test', 'Test Play', ''); -- Should fail (empty)

-- INSERT INTO plays (playbook_id, formation, play_name, p_type)
-- VALUES ('...', 'Test', 'Test Play', 'Type with @#$ symbols'); -- Should fail (invalid characters)

-- ====================================================================
-- ROLLBACK PLAN (if needed)
-- ====================================================================

-- To restore original constraint:
-- DROP TRIGGER IF EXISTS validate_play_type_trigger ON plays;
-- DROP FUNCTION IF EXISTS validate_play_type();
-- ALTER TABLE plays ADD CONSTRAINT plays_p_type_check 
--   CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action'));
