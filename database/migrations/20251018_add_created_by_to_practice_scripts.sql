-- Migration: Add missing columns to practice_scripts
-- Date: 2025-10-18
-- Purpose: Fix missing created_by and focus_areas columns

-- Add created_by column
ALTER TABLE practice_scripts 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add focus_areas column (array of tags/keywords for the script)
ALTER TABLE practice_scripts 
  ADD COLUMN IF NOT EXISTS focus_areas TEXT[] DEFAULT '{}';

-- Set created_by to the team's first coach for existing records
UPDATE practice_scripts ps
SET created_by = (
  SELECT tm.user_id 
  FROM team_members tm 
  WHERE tm.team_id = ps.team_id 
    AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND tm.status = 'active'
  LIMIT 1
)
WHERE created_by IS NULL;

-- Add comments
COMMENT ON COLUMN practice_scripts.created_by IS 'User who created the practice script';
COMMENT ON COLUMN practice_scripts.focus_areas IS 'Array of focus areas/tags for the script (e.g., "Install", "Red Zone", "2-Minute")';
