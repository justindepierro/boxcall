-- Migration: Add management columns to practice_scripts
-- Date: 2025-10-21
-- Purpose: Add is_archived and is_template columns for Phase 6: Script/Plan Management

-- Add is_archived column for soft delete
ALTER TABLE practice_scripts 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add is_template column to mark reusable scripts
ALTER TABLE practice_scripts 
  ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Add tags column for search/filtering (if not exists from focus_areas)
-- Note: focus_areas already exists from previous migration, this is for backward compatibility
ALTER TABLE practice_scripts 
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_scripts_archived 
  ON practice_scripts(team_id, is_archived) WHERE is_archived = false;

CREATE INDEX IF NOT EXISTS idx_practice_scripts_template 
  ON practice_scripts(team_id, is_template) WHERE is_template = true;

CREATE INDEX IF NOT EXISTS idx_practice_scripts_created_at 
  ON practice_scripts(team_id, created_at DESC);

-- Add comments
COMMENT ON COLUMN practice_scripts.is_archived IS 'Soft delete flag - archived scripts hidden from main view';
COMMENT ON COLUMN practice_scripts.is_template IS 'Marks script as a reusable template';
COMMENT ON COLUMN practice_scripts.tags IS 'Search tags for filtering (e.g., "Install", "Red Zone", "2-Minute")';

-- Update RLS policies to exclude archived by default (optional - can filter in queries)
-- Note: Keeping policies simple - client-side filtering preferred for flexibility
