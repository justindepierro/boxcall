-- =====================================================
-- Add Missing created_by Column to playbooks
-- =====================================================
-- The playbooks table is missing the created_by column
-- that the app is trying to use for RLS policies
-- =====================================================

-- Add created_by column to playbooks table
ALTER TABLE playbooks
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Set created_by for existing playbooks to the team owner
-- This ensures existing data has valid created_by values
UPDATE playbooks pb
SET created_by = (
  SELECT tm.user_id
  FROM team_members tm
  WHERE tm.team_id = pb.team_id
  AND tm.team_role = 'head_coach'
  LIMIT 1
)
WHERE created_by IS NULL;

-- If no head_coach found, use any team member
UPDATE playbooks pb
SET created_by = (
  SELECT tm.user_id
  FROM team_members tm
  WHERE tm.team_id = pb.team_id
  LIMIT 1
)
WHERE created_by IS NULL;

-- Make the column NOT NULL after backfilling data
ALTER TABLE playbooks
ALTER COLUMN created_by SET NOT NULL;

-- Add an index for performance
CREATE INDEX IF NOT EXISTS idx_playbooks_created_by ON playbooks(created_by);

-- Verify the column was added
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'playbooks'
  AND column_name = 'created_by';

-- Show sample data
SELECT 
  id,
  name,
  team_id,
  created_by,
  created_at
FROM playbooks
LIMIT 5;

-- =====================================================
-- After running this:
-- 1. Wait 10 seconds
-- 2. Hard refresh your app (Cmd + Shift + R)
-- 3. Try creating a play
--
-- This should fix the PGRST204 error!
-- =====================================================

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
