-- Add family_permissions column to teams table
-- This column stores permissions for family members (parents/guardians) to access team information

-- Add the column
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS family_permissions JSONB DEFAULT '{
  "canViewRoster": false,
  "canViewSchedule": true,
  "canViewStats": false,
  "canRSVP": true,
  "canFundraise": false
}'::jsonb;

-- Add a comment explaining the column
COMMENT ON COLUMN teams.family_permissions IS 'Controls what family members (parents/guardians) can access for this team. Defaults: roster=false, schedule=true, stats=false, RSVP=true, fundraising=false';

-- Update existing teams to have the default permissions
UPDATE teams
SET family_permissions = '{
  "canViewRoster": false,
  "canViewSchedule": true,
  "canViewStats": false,
  "canRSVP": true,
  "canFundraise": false
}'::jsonb
WHERE family_permissions IS NULL;
