-- Migration: Remove Unique Formation Name Constraint
-- Date: October 12, 2025
-- Purpose: Allow multiple formations with the same name but different directions
-- Reason: Enables same-formation linking (e.g., "Trips Left" and "Trips Right")

-- Drop the unique constraint on (playbook_id, name)
ALTER TABLE formations 
  DROP CONSTRAINT IF EXISTS unique_formation_name_per_playbook;

-- Optional: Add a more flexible constraint that allows same name with different directions
-- This ensures you can't have duplicate "Trips Left" + "Trips Left" but allows "Trips Left" + "Trips Right"
ALTER TABLE formations
  ADD CONSTRAINT unique_formation_per_playbook_and_direction 
  UNIQUE(playbook_id, name, direction);

-- Add comment
COMMENT ON CONSTRAINT unique_formation_per_playbook_and_direction ON formations 
  IS 'Allows same formation name with different directions (e.g., Trips Left, Trips Right)';

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Removed unique constraint on (playbook_id, name)';
  RAISE NOTICE 'Added unique constraint on (playbook_id, name, direction)';
  RAISE NOTICE 'You can now create formations with same name but different directions';
END $$;
