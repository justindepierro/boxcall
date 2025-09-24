-- ===========================================
-- FIX TEAM_MEMBERS TABLE SCHEMA
-- ===========================================

-- First, let's check what columns currently exist and fix accordingly

-- If the table has the old schema (role, permissions, joined_at, is_active),
-- rename them to the new schema (team_role, capabilities, assigned_at, status)

-- Check if 'role' column exists (old schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'role'
  ) THEN
    -- Rename old columns to new names
    ALTER TABLE team_members RENAME COLUMN role TO team_role;
    ALTER TABLE team_members RENAME COLUMN permissions TO capabilities;
    ALTER TABLE team_members RENAME COLUMN joined_at TO assigned_at;
    ALTER TABLE team_members RENAME COLUMN is_active TO status;

    -- Update status values from boolean to text
    UPDATE team_members SET status = CASE WHEN status::boolean = true THEN 'active' ELSE 'inactive' END;

    -- Change status column type to text
    ALTER TABLE team_members ALTER COLUMN status TYPE TEXT;
    ALTER TABLE team_members ADD CONSTRAINT team_members_status_check
      CHECK (status IN ('active', 'inactive', 'pending'));
  END IF;
END $$;

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
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_team_role_check;
ALTER TABLE team_members ADD CONSTRAINT team_members_team_role_check
  CHECK (team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach'));

-- Fix RLS policies
DROP POLICY IF EXISTS "Users can view team memberships" ON team_members;
DROP POLICY IF EXISTS "Team coaches can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can manage their own memberships" ON team_members;

-- Create new simplified policies
CREATE POLICY "Users can view team memberships" ON team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own memberships" ON team_members
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Team coaches can manage team members" ON team_members
  FOR ALL USING (
    team_role IN ('head_coach', 'assistant_coach', 'coordinator') AND
    status = 'active' AND
    user_id = auth.uid()
  );