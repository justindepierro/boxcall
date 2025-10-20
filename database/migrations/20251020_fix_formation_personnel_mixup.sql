-- Migration: Fix formation field containing personnel names
-- Date: October 20, 2025
-- Purpose: Correct plays where formation field accidentally contains personnel package names
-- Issue: Some plays have formation = "6 Players" (personnel name) instead of actual formation names

-- =============================================
-- PROBLEM DETECTION
-- =============================================

-- First, let's identify the problematic plays
-- These are plays where formation looks like a personnel package name
-- Common patterns: "X Players", "11 Personnel", "Blue", "Black", "Green", etc.

DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Count plays with personnel-like formation names
  SELECT COUNT(*) INTO affected_count
  FROM plays
  WHERE 
    formation ~ '^\d+\s+Players?$'  -- Matches "6 Players", "11 Player", etc.
    OR formation IN ('Blue', 'Black', 'Green', 'Red', 'Gold')  -- Common personnel colors
    OR formation ~ '^\d{2}\s+Personnel$'  -- Matches "11 Personnel", "12 Personnel", etc.
    OR formation ~ '^\d{2}$';  -- Matches just numbers like "11", "12", etc.
  
  RAISE NOTICE 'Found % plays with personnel names in formation field', affected_count;
END $$;

-- =============================================
-- DATA FIX: Set formation to NULL where it contains personnel names
-- =============================================

-- Update plays where formation field contains personnel package names
-- Set formation to NULL so users can manually set proper formation names
-- We'll preserve the personnel field which should have the correct value

UPDATE plays
SET 
  formation = NULL,
  updated_at = NOW()
WHERE 
  -- Match personnel-like patterns in formation field
  formation ~ '^\d+\s+Players?$'  -- "6 Players", "11 Player"
  OR formation IN ('Blue', 'Black', 'Green', 'Red', 'Gold', 'White', 'Orange')
  OR formation ~ '^\d{2}\s+Personnel$'  -- "11 Personnel", "12 Personnel"
  OR formation ~ '^\d{2}$';  -- "11", "12", "21"

-- =============================================
-- VERIFICATION
-- =============================================

-- Show results
DO $$
DECLARE
  null_formation_count INTEGER;
  total_plays_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_formation_count FROM plays WHERE formation IS NULL;
  SELECT COUNT(*) INTO total_plays_count FROM plays;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Migration Complete!';
  RAISE NOTICE 'Plays with NULL formation: %', null_formation_count;
  RAISE NOTICE 'Total plays: %', total_plays_count;
  RAISE NOTICE '====================================';
  RAISE NOTICE 'ACTION REQUIRED: Users should manually set formation names for plays with NULL formation';
  RAISE NOTICE 'The personnel field should still contain the correct personnel package names';
END $$;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON COLUMN plays.formation IS 'Formation name (e.g., Shotgun, Trips, I Formation) - NOT personnel package names. Personnel goes in the personnel field.';
COMMENT ON COLUMN plays.personnel IS 'Personnel package (e.g., 11, 12, 21, Blue, Black) - NOT formation names.';
