-- ===========================================
-- ROBUST TEAM_MEMBERS SCHEMA FIX
-- ===========================================

-- This script handles multiple possible database states

-- First, let's see what columns actually exist
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'Checking current team_members table schema...';

    -- Check what columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'team_members' AND column_name = 'role'
    ) INTO column_exists;

    IF column_exists THEN
        RAISE NOTICE 'Found old schema with role column';
        -- Rename old columns to new names
        ALTER TABLE team_members RENAME COLUMN role TO team_role;
        RAISE NOTICE 'Renamed role to team_role';
    ELSE
        RAISE NOTICE 'role column not found, checking for team_role...';
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'team_members' AND column_name = 'team_role'
        ) INTO column_exists;

        IF NOT column_exists THEN
            RAISE NOTICE 'Neither role nor team_role found - adding team_role column';
            ALTER TABLE team_members ADD COLUMN team_role TEXT DEFAULT 'coach';
        END IF;
    END IF;

    -- Check for permissions column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'team_members' AND column_name = 'permissions'
    ) INTO column_exists;

    IF column_exists THEN
        RAISE NOTICE 'Found permissions column, renaming to capabilities';
        ALTER TABLE team_members RENAME COLUMN permissions TO capabilities;
    ELSE
        RAISE NOTICE 'permissions column not found, checking for capabilities...';
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'team_members' AND column_name = 'capabilities'
        ) INTO column_exists;

        IF NOT column_exists THEN
            RAISE NOTICE 'Adding capabilities column';
            ALTER TABLE team_members ADD COLUMN capabilities JSONB DEFAULT '{
              "can_manage_team": false,
              "can_manage_games": false,
              "can_manage_social": false,
              "can_manage_players": false,
              "can_view_analytics": false,
              "can_manage_playbook": false,
              "can_manage_practice": false,
              "can_manage_equipment": false
            }';
        END IF;
    END IF;

    -- Check for joined_at column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'team_members' AND column_name = 'joined_at'
    ) INTO column_exists;

    IF column_exists THEN
        RAISE NOTICE 'Found joined_at column, renaming to assigned_at';
        ALTER TABLE team_members RENAME COLUMN joined_at TO assigned_at;
    ELSE
        RAISE NOTICE 'joined_at column not found, checking for assigned_at...';
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'team_members' AND column_name = 'assigned_at'
        ) INTO column_exists;

        IF NOT column_exists THEN
            RAISE NOTICE 'Adding assigned_at column';
            ALTER TABLE team_members ADD COLUMN assigned_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;

    -- Check for is_active column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'team_members' AND column_name = 'is_active'
    ) INTO column_exists;

    IF column_exists THEN
        RAISE NOTICE 'Found is_active column, renaming to status';
        ALTER TABLE team_members RENAME COLUMN is_active TO status;

        -- Convert boolean to text
        UPDATE team_members SET status = CASE WHEN status::boolean = true THEN 'active' ELSE 'inactive' END;
        ALTER TABLE team_members ALTER COLUMN status TYPE TEXT;
    ELSE
        RAISE NOTICE 'is_active column not found, checking for status...';
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'team_members' AND column_name = 'status'
        ) INTO column_exists;

        IF NOT column_exists THEN
            RAISE NOTICE 'Adding status column';
            ALTER TABLE team_members ADD COLUMN status TEXT DEFAULT 'active';
        END IF;
    END IF;

    RAISE NOTICE 'Schema migration completed';
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

-- Update constraints
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_team_role_check;
ALTER TABLE team_members ADD CONSTRAINT team_members_team_role_check
  CHECK (team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'coach'));

ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_status_check;
ALTER TABLE team_members ADD CONSTRAINT team_members_status_check
  CHECK (status IN ('active', 'inactive', 'pending'));

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