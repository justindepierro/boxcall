-- Migration: Add created_by column to playbooks table
-- Purpose: Ensure playbooks rows record creator user id for proper ownership tracking

-- Add column if missing
ALTER TABLE playbooks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_playbooks_created_by ON playbooks(created_by);

-- Backfill existing playbooks with team creator if available
UPDATE playbooks 
SET created_by = teams.created_by
FROM teams 
WHERE playbooks.team_id = teams.id 
AND playbooks.created_by IS NULL;

-- For any remaining NULL values, set to a system placeholder
UPDATE playbooks 
SET created_by = '00000000-0000-0000-0000-000000000001'
WHERE created_by IS NULL;
