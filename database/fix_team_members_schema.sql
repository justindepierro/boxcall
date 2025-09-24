-- ===========================================
-- MIGRATION: Fix team_members table schema
-- ===========================================

-- This migration fixes the team_members table to use the correct column names
-- that match the application expectations

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view team memberships" ON team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;

-- Rename columns to match application expectations
ALTER TABLE team_members RENAME COLUMN role TO team_role;
ALTER TABLE team_members RENAME COLUMN permissions TO capabilities;
ALTER TABLE team_members RENAME COLUMN joined_at TO assigned_at;
ALTER TABLE team_members RENAME COLUMN is_active TO status;

-- Update status values (boolean to text)
UPDATE team_members SET status = CASE WHEN status = true THEN 'active' ELSE 'inactive' END;

-- Add missing columns if they don't exist
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS role_notes TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{
  "can_manage_team": false,
  "can_manage_games": false,
  "can_manage_social": false,
  "can_manage_players": false,
  "can_view_analytics": false,
  "can_manage_playbook": false,
  "can_manage_practice": false,
  "can_manage_equipment": false
}';

-- Update the check constraint for team_role
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_role_check;
ALTER TABLE team_members ADD CONSTRAINT team_members_team_role_check
  CHECK (team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach'));

-- Update the check constraint for status
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_status_check;
ALTER TABLE team_members ADD CONSTRAINT team_members_status_check
  CHECK (status IN ('active', 'inactive', 'pending'));

-- Recreate RLS policies with correct column names
CREATE POLICY "Users can view team memberships" ON team_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Team coaches can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.status = 'active'
    )
  );