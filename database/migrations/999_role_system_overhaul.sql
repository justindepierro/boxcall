-- Migration 999: Role System Overhaul
-- Date: 2025-08-30
-- Purpose: Unify inconsistent role definitions across app and team levels

-- ============================================================================
-- PHASE 1: CREATE STANDARDIZED ROLE ENUMS
-- ============================================================================

-- Check and drop existing enums and their dependencies safely
DO $$ 
BEGIN
  -- Drop existing enums if they exist (for re-runs)
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
    DROP TYPE app_user_role CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_role') THEN
    DROP TYPE team_member_role CASCADE;
  END IF;
  
  -- Also check for any existing user_role enum that might conflict
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    DROP TYPE user_role CASCADE;
  END IF;
END $$;

-- Create standardized app-level user roles (primary profile role)
CREATE TYPE app_user_role AS ENUM (
  'super_admin',    -- System administrators
  'admin',          -- Team administrators/head coaches  
  'coach',          -- Assistant coaches/coordinators
  'player',         -- Team players
  'family'          -- Family members/parents
);

-- Create standardized team-level roles (team membership specific)
CREATE TYPE team_member_role AS ENUM (
  'head_coach',         -- Team owner/head coach
  'assistant_coach',    -- Assistant coaches
  'coordinator',        -- Specialized coordinators (OC, DC, etc.)
  'manager',           -- Team managers
  'player',            -- Active players
  'family',            -- Family members
  'alumni'             -- Former players/coaches
);

-- ============================================================================
-- PHASE 2: UPDATE PROFILES TABLE
-- ============================================================================

-- First, let's check what the current role column type is and handle it properly
DO $$ 
BEGIN
  -- Add temporary column for migration
  ALTER TABLE profiles ADD COLUMN new_role app_user_role;
  
  -- Migrate existing role data to new enum (treating role as TEXT)
  UPDATE profiles SET new_role = 
    CASE 
      WHEN role::TEXT = 'assistant_coach' THEN 'coach'::app_user_role
      WHEN role::TEXT = 'admin' THEN 'admin'::app_user_role
      WHEN role::TEXT = 'coach' THEN 'coach'::app_user_role
      WHEN role::TEXT = 'player' THEN 'player'::app_user_role
      WHEN role::TEXT = 'family' THEN 'family'::app_user_role
      ELSE 'player'::app_user_role  -- Default fallback
    END;
    
  -- Ensure all rows have a value
  UPDATE profiles SET new_role = 'player'::app_user_role WHERE new_role IS NULL;
END $$;

-- Drop old role column and rename new one
ALTER TABLE profiles DROP COLUMN role;
ALTER TABLE profiles RENAME COLUMN new_role TO role;

-- Set default and not null constraint
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'player'::app_user_role;
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;

-- ============================================================================
-- PHASE 3: UPDATE TEAM_MEMBERS TABLE
-- ============================================================================

-- Add new columns for enhanced team membership
ALTER TABLE team_members 
  ADD COLUMN team_role team_member_role DEFAULT 'player',
  ADD COLUMN capabilities TEXT[] DEFAULT '{}',
  ADD COLUMN role_notes TEXT,
  ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Migrate existing role data to new team_role system (treating role as TEXT)
UPDATE team_members SET team_role = 
  CASE 
    WHEN role::TEXT = 'admin' THEN 'head_coach'::team_member_role
    WHEN role::TEXT = 'coach' THEN 'assistant_coach'::team_member_role
    WHEN role::TEXT = 'assistant_coach' THEN 'assistant_coach'::team_member_role
    WHEN role::TEXT = 'manager' THEN 'manager'::team_member_role
    WHEN role::TEXT = 'player' THEN 'player'::team_member_role
    WHEN role::TEXT = 'family' THEN 'family'::team_member_role
    ELSE 'player'::team_member_role  -- Default fallback
  END;

-- Set default capabilities based on role
UPDATE team_members SET capabilities = 
  CASE team_role
    WHEN 'head_coach' THEN ARRAY['team.manage', 'roster.manage', 'playbook.manage', 'analytics.view', 'settings.manage']
    WHEN 'assistant_coach' THEN ARRAY['playbook.manage', 'analytics.view', 'roster.view', 'calendar.manage']
    WHEN 'coordinator' THEN ARRAY['playbook.manage', 'analytics.view', 'roster.view']
    WHEN 'manager' THEN ARRAY['roster.view', 'calendar.view', 'analytics.view']
    WHEN 'player' THEN ARRAY['playbook.view', 'calendar.view', 'profile.manage']
    WHEN 'family' THEN ARRAY['calendar.view', 'roster.view']
    WHEN 'alumni' THEN ARRAY['roster.view']
    ELSE ARRAY['playbook.view']
  END;

-- Keep old role column for now (will be removed in future migration after validation)
-- ALTER TABLE team_members DROP COLUMN role;  -- Commented out for safety

-- ============================================================================
-- PHASE 4: UPDATE RLS POLICIES
-- ============================================================================

-- Drop and recreate policies to use new role system

-- Team Posts Policies
DROP POLICY IF EXISTS "team_content_coaches_manage" ON team_posts;
CREATE POLICY "team_content_coaches_manage" ON team_posts
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() 
        AND tm.is_active = true
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

DROP POLICY IF EXISTS "team_content_members_view" ON team_posts;
CREATE POLICY "team_content_members_view" ON team_posts
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() 
        AND tm.is_active = true
    )
  );

-- Team Members Policies
DROP POLICY IF EXISTS "team_members_admins_manage" ON team_members;
CREATE POLICY "team_members_admins_manage" ON team_members
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() 
        AND tm.is_active = true
        AND tm.team_role IN ('head_coach')
    )
  );

DROP POLICY IF EXISTS "team_members_coaches_view" ON team_members;
CREATE POLICY "team_members_coaches_view" ON team_members
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() 
        AND tm.is_active = true
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager')
    )
  );

-- Game Plans Policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_plans') THEN
    DROP POLICY IF EXISTS "game_plans_coaches_manage" ON game_plans;
    EXECUTE 'CREATE POLICY "game_plans_coaches_manage" ON game_plans
      FOR ALL TO authenticated
      USING (
        team_id IN (
          SELECT tm.team_id FROM team_members tm
          WHERE tm.user_id = auth.uid() 
            AND tm.is_active = true
            AND tm.team_role IN (''head_coach'', ''assistant_coach'', ''coordinator'')
        )
      )';
  END IF;
END $$;

-- Plays Policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plays') THEN
    DROP POLICY IF EXISTS "plays_coaches_manage" ON plays;
    EXECUTE 'CREATE POLICY "plays_coaches_manage" ON plays
      FOR ALL TO authenticated
      USING (
        team_id IN (
          SELECT tm.team_id FROM team_members tm
          WHERE tm.user_id = auth.uid() 
            AND tm.is_active = true
            AND tm.team_role IN (''head_coach'', ''assistant_coach'', ''coordinator'')
        )
      )';
      
    DROP POLICY IF EXISTS "plays_members_view" ON plays;
    EXECUTE 'CREATE POLICY "plays_members_view" ON plays
      FOR SELECT TO authenticated
      USING (
        team_id IN (
          SELECT tm.team_id FROM team_members tm
          WHERE tm.user_id = auth.uid() 
            AND tm.is_active = true
        )
      )';
  END IF;
END $$;

-- ============================================================================
-- PHASE 5: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's app role
CREATE OR REPLACE FUNCTION get_user_app_role(user_uuid UUID)
RETURNS app_user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM profiles 
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's team role for a specific team
CREATE OR REPLACE FUNCTION get_user_team_role(user_uuid UUID, team_uuid UUID)
RETURNS team_member_role AS $$
BEGIN
  RETURN (
    SELECT team_role 
    FROM team_members 
    WHERE user_id = user_uuid 
      AND team_id = team_uuid 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific capability
CREATE OR REPLACE FUNCTION user_has_capability(user_uuid UUID, team_uuid UUID, capability TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT capability = ANY(capabilities)
    FROM team_members 
    WHERE user_id = user_uuid 
      AND team_id = team_uuid 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID, team_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN (
    SELECT capabilities
    FROM team_members 
    WHERE user_id = user_uuid 
      AND team_id = team_uuid 
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_team_members_team_role ON team_members(team_role);
CREATE INDEX IF NOT EXISTS idx_team_members_capabilities ON team_members USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_team_members_lookup ON team_members(user_id, team_id, is_active);

-- ============================================================================
-- PHASE 7: UPDATE DATABASE TYPE DEFINITIONS (for reference)
-- ============================================================================

-- This is for TypeScript type generation reference
COMMENT ON TYPE app_user_role IS 'App-level user roles for subscription and primary permissions';
COMMENT ON TYPE team_member_role IS 'Team-specific roles for team membership and team-level permissions';

COMMENT ON COLUMN profiles.role IS 'Primary app-level role determining subscription features and base permissions';
COMMENT ON COLUMN team_members.team_role IS 'Specific role within this team determining team-level permissions';
COMMENT ON COLUMN team_members.capabilities IS 'Granular permission capabilities for this team membership';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
INSERT INTO migration_log (migration_id, description, applied_at) 
VALUES (999, 'Role System Overhaul - Unified app and team role architecture', NOW())
ON CONFLICT (migration_id) DO UPDATE SET 
  applied_at = NOW(),
  description = EXCLUDED.description;
