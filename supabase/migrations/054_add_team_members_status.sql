-- Add status column to team_members table if it doesn't exist
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));

-- Update existing records to have active status
UPDATE team_members SET status = 'active' WHERE status IS NULL;
