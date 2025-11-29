-- ============================================================================
-- REMOVE PERSONNEL NUMERIC VALIDATION
-- ============================================================================
-- Date: November 29, 2025
-- Purpose: Allow personnel names to use any format (colors, animals, numbers, words)
--          instead of restricting to numeric-only format
-- 
-- Reason: Different teams use different naming conventions:
--         - Some use colors: "Blue", "Red", "Green"
--         - Some use animals: "Eagles", "Hawks", "Bears"
--         - Some use numbers: "11", "12", "21"
--         - Some use words: "Spread", "Wing-T", "Shotgun"
--         BoxCall should support all naming conventions flexibly
-- ============================================================================

-- Update validation function to remove numeric-only requirement
CREATE OR REPLACE FUNCTION validate_personnel_data()
RETURNS TRIGGER AS $$
DECLARE
    qb_count INTEGER;
    duplicate_labels INTEGER;
BEGIN
    -- Name validation
    IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
        RAISE EXCEPTION 'Personnel configuration name cannot be empty';
    END IF;

    IF length(trim(NEW.name)) > 50 THEN
        RAISE EXCEPTION 'Personnel name cannot exceed 50 characters';
    END IF;

    -- REMOVED: Numeric-only validation
    -- Teams can now use any naming format they prefer
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_personnel_data IS 
  'Validates personnel configuration data. Allows any naming format (colors, animals, numbers, words).';
