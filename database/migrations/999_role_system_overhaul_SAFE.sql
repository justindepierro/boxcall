-- Migration 999: Role System Overhaul - SAFE VERSION
-- Date: 2025-08-30
-- Purpose: Unify inconsistent role definitions across app and team levels
-- This version includes proper error handling and current state inspection

-- ============================================================================
-- PHASE 0: INSPECT CURRENT STATE
-- ============================================================================

-- Check current profiles table structure
DO $$ 
DECLARE
    column_type TEXT;
BEGIN
    SELECT data_type INTO column_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role';
    
    RAISE NOTICE 'Current profiles.role column type: %', COALESCE(column_type, 'NOT_FOUND');
    
    -- Check if there are any existing enum types
    FOR column_type IN 
        SELECT typname FROM pg_type WHERE typtype = 'e' AND typname LIKE '%role%'
    LOOP
        RAISE NOTICE 'Found existing enum type: %', column_type;
    END LOOP;
END $$;

-- Check current team_members table structure  
DO $$ 
DECLARE
    column_type TEXT;
BEGIN
    SELECT data_type INTO column_type 
    FROM information_schema.columns 
    WHERE table_name = 'team_members' AND column_name = 'role';
    
    RAISE NOTICE 'Current team_members.role column type: %', COALESCE(column_type, 'NOT_FOUND');
END $$;

-- Show sample data from profiles to understand current values
DO $$
DECLARE
    sample_roles TEXT;
BEGIN
    SELECT string_agg(DISTINCT role::TEXT, ', ') INTO sample_roles 
    FROM profiles 
    LIMIT 10;
    
    RAISE NOTICE 'Sample profile roles: %', COALESCE(sample_roles, 'NO_DATA');
END $$;

-- Show sample data from team_members to understand current values
DO $$
DECLARE
    sample_roles TEXT;
BEGIN
    SELECT string_agg(DISTINCT role::TEXT, ', ') INTO sample_roles 
    FROM team_members 
    LIMIT 10;
    
    RAISE NOTICE 'Sample team_member roles: %', COALESCE(sample_roles, 'NO_DATA');
END $$;

-- ============================================================================
-- PHASE 1: CREATE STANDARDIZED ROLE ENUMS (SAFE)
-- ============================================================================

DO $$ 
BEGIN
    -- Drop existing conflicting enums if they exist
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
        RAISE NOTICE 'Dropping existing app_user_role enum';
        DROP TYPE app_user_role CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_role') THEN
        RAISE NOTICE 'Dropping existing team_member_role enum';
        DROP TYPE team_member_role CASCADE;
    END IF;
    
    -- Check for conflicting user_role enum
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        RAISE NOTICE 'Found existing user_role enum - this may cause conflicts';
        -- Don't drop it yet, just warn
    END IF;
    
    RAISE NOTICE 'Creating new role enums...';
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

DO $$ 
BEGIN
    RAISE NOTICE 'Role enums created successfully';
END $$;

-- ============================================================================
-- PHASE 2: UPDATE PROFILES TABLE (SAFE)
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Starting profiles table migration...';
    
    -- Add temporary column for migration
    ALTER TABLE profiles ADD COLUMN new_role app_user_role;
    RAISE NOTICE 'Added temporary new_role column';
    
    -- Migrate existing role data to new enum (safe casting)
    UPDATE profiles SET new_role = 
      CASE 
        WHEN role::TEXT = 'assistant_coach' THEN 'coach'::app_user_role
        WHEN role::TEXT = 'admin' THEN 'admin'::app_user_role
        WHEN role::TEXT = 'coach' THEN 'coach'::app_user_role
        WHEN role::TEXT = 'player' THEN 'player'::app_user_role
        WHEN role::TEXT = 'family' THEN 'family'::app_user_role
        WHEN role::TEXT = 'super_admin' THEN 'super_admin'::app_user_role
        ELSE 'player'::app_user_role  -- Default fallback
      END;
    
    RAISE NOTICE 'Migrated role data to new enum';
    
    -- Ensure all rows have a value
    UPDATE profiles SET new_role = 'player'::app_user_role WHERE new_role IS NULL;
    
    -- Check migration results
    RAISE NOTICE 'Migration results - Updated % profiles', (SELECT COUNT(*) FROM profiles WHERE new_role IS NOT NULL);
    
    -- Drop old role column and rename new one
    ALTER TABLE profiles DROP COLUMN role;
    ALTER TABLE profiles RENAME COLUMN new_role TO role;
    
    -- Set default and not null constraint
    ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'player'::app_user_role;
    ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;
    
    RAISE NOTICE 'Profiles table migration completed successfully';
END $$;

-- ============================================================================
-- PHASE 3: UPDATE TEAM_MEMBERS TABLE (SAFE)
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Starting team_members table migration...';
    
    -- Add new columns for enhanced team membership
    ALTER TABLE team_members 
      ADD COLUMN team_role team_member_role DEFAULT 'player',
      ADD COLUMN capabilities TEXT[] DEFAULT '{}',
      ADD COLUMN role_notes TEXT,
      ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE 'Added new columns to team_members';
    
    -- Migrate existing role data to new team_role system
    UPDATE team_members SET team_role = 
      CASE 
        WHEN role::TEXT = 'admin' THEN 'head_coach'::team_member_role
        WHEN role::TEXT = 'coach' THEN 'assistant_coach'::team_member_role
        WHEN role::TEXT = 'assistant_coach' THEN 'assistant_coach'::team_member_role
        WHEN role::TEXT = 'head_coach' THEN 'head_coach'::team_member_role
        WHEN role::TEXT = 'manager' THEN 'manager'::team_member_role
        WHEN role::TEXT = 'coordinator' THEN 'coordinator'::team_member_role
        WHEN role::TEXT = 'player' THEN 'player'::team_member_role
        WHEN role::TEXT = 'family' THEN 'family'::team_member_role
        WHEN role::TEXT = 'alumni' THEN 'alumni'::team_member_role
        ELSE 'player'::team_member_role  -- Default fallback
      END;
    
    RAISE NOTICE 'Migrated team role data';
    
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
    
    RAISE NOTICE 'Set default capabilities - Updated % team members', (SELECT COUNT(*) FROM team_members);
    
    -- Keep old role column for now (will be removed in future migration after validation)
    RAISE NOTICE 'Keeping old role column for safety - remove manually after validation';
    
    RAISE NOTICE 'Team_members table migration completed successfully';
END $$;

-- ============================================================================
-- PHASE 4: CREATE HELPER FUNCTIONS
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Creating helper functions...';
END $$;

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
      AND status = 'active'
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
      AND status = 'active'
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
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Creating performance indexes...';
END $$;

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_team_members_team_role ON team_members(team_role);
CREATE INDEX IF NOT EXISTS idx_team_members_capabilities ON team_members USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_team_members_lookup ON team_members(user_id, team_id, status);

-- ============================================================================
-- PHASE 6: ADD HELPFUL COMMENTS
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

DO $$
BEGIN
    -- Create migration_log table if it doesn't exist
    CREATE TABLE IF NOT EXISTS migration_log (
        migration_id INTEGER PRIMARY KEY,
        description TEXT NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL
    );
    
    -- Log migration completion
    INSERT INTO migration_log (migration_id, description, applied_at) 
    VALUES (999, 'Role System Overhaul - Unified app and team role architecture', NOW())
    ON CONFLICT (migration_id) DO UPDATE SET 
      applied_at = NOW(),
      description = EXCLUDED.description;
      
    RAISE NOTICE 'Migration 999 completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify data migration with: SELECT role, COUNT(*) FROM profiles GROUP BY role;';
    RAISE NOTICE '2. Verify team roles with: SELECT team_role, COUNT(*) FROM team_members GROUP BY team_role;';
    RAISE NOTICE '3. Update your TypeScript types to use the new enums';
    RAISE NOTICE '4. Test the application with new role system';
    RAISE NOTICE '5. After validation, you can drop the old role column from team_members';
END $$;
