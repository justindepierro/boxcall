-- Migration: Add personnel_packages to formations
-- Date: October 12, 2025
-- Purpose: Allow formations to support multiple personnel packages

-- Add personnel_packages array to store multiple personnel configuration IDs
ALTER TABLE formations 
  ADD COLUMN IF NOT EXISTS personnel_packages UUID[] DEFAULT ARRAY[]::UUID[];

-- Add index for personnel_packages queries
CREATE INDEX IF NOT EXISTS idx_formations_personnel_packages 
  ON formations USING GIN(personnel_packages);

-- Add comment
COMMENT ON COLUMN formations.personnel_packages IS 'Array of personnel_configuration IDs that can run this formation (e.g., ["11", "12", "21"])';

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Added personnel_packages column to formations table';
  RAISE NOTICE 'Formations can now support multiple personnel packages';
END $$;
