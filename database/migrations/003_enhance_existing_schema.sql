-- BoxCall Database Enhancement Migration
-- For existing database with team management tables
-- This adds any missing columns and ensures proper RLS policies

-- Enable RLS on all team-related tables if not already enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add any missing columns to teams table (safe if they already exist)
DO $$ 
BEGIN
    -- Add team_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'team_code') THEN
        ALTER TABLE teams ADD COLUMN team_code TEXT UNIQUE;
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'updated_at') THEN
        ALTER TABLE teams ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add any missing columns to team_members table
DO $$ 
BEGIN
    -- Add permissions if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'permissions') THEN
        ALTER TABLE team_members ADD COLUMN permissions JSONB;
    END IF;
    
    -- Add status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'status') THEN
        ALTER TABLE team_members ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
    END IF;
    
    -- Add joined_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'joined_at') THEN
        ALTER TABLE team_members ADD COLUMN joined_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add invited_by if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'invited_by') THEN
        ALTER TABLE team_members ADD COLUMN invited_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Create or replace RLS policies for teams
DROP POLICY IF EXISTS "Teams are viewable by team members" ON teams;
CREATE POLICY "Teams are viewable by team members" ON teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
        OR 
        created_by = auth.uid()
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Teams can be created by authenticated users" ON teams;
CREATE POLICY "Teams can be created by authenticated users" ON teams
    FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Teams can be updated by head coaches or creators" ON teams;
CREATE POLICY "Teams can be updated by head coaches or creators" ON teams
    FOR UPDATE USING (
        created_by = auth.uid()
        OR
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND role = 'head_coach' AND status = 'active'
        )
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

-- Create or replace RLS policies for team_members
DROP POLICY IF EXISTS "Team members are viewable by team members" ON team_members;
CREATE POLICY "Team members are viewable by team members" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
        OR
        user_id = auth.uid()
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Team members can be added by coaches" ON team_members;
CREATE POLICY "Team members can be added by coaches" ON team_members
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() 
            AND role IN ('head_coach', 'coach') 
            AND status = 'active'
        )
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Team members can be updated by coaches" ON team_members;
CREATE POLICY "Team members can be updated by coaches" ON team_members
    FOR UPDATE USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() 
            AND role IN ('head_coach', 'coach') 
            AND status = 'active'
        )
        OR
        user_id = auth.uid()
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

-- Create or replace RLS policies for team_invites
DROP POLICY IF EXISTS "Team invites are viewable by coaches" ON team_invites;
CREATE POLICY "Team invites are viewable by coaches" ON team_invites
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() 
            AND role IN ('head_coach', 'coach') 
            AND status = 'active'
        )
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Team invites can be created by coaches" ON team_invites;
CREATE POLICY "Team invites can be created by coaches" ON team_invites
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid() 
            AND role IN ('head_coach', 'coach') 
            AND status = 'active'
        )
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

-- Create or replace RLS policies for user_profiles
DROP POLICY IF EXISTS "User profiles are viewable by team members" ON user_profiles;
CREATE POLICY "User profiles are viewable by team members" ON user_profiles
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        user_id IN (
            SELECT tm1.user_id FROM team_members tm1
            WHERE tm1.team_id IN (
                SELECT tm2.team_id FROM team_members tm2 
                WHERE tm2.user_id = auth.uid() AND tm2.status = 'active'
            )
            AND tm1.status = 'active'
        )
        OR
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_team_code ON teams(team_code);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create or replace function to generate team codes
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS TEXT AS $$
DECLARE
    characters TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 6-character code
    FOR i IN 1..6 LOOP
        result := result || substr(characters, floor(random() * length(characters) + 1)::INTEGER, 1);
    END LOOP;
    
    -- Check if code already exists
    WHILE EXISTS (SELECT 1 FROM teams WHERE team_code = result) LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(characters, floor(random() * length(characters) + 1)::INTEGER, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate team codes if not provided
CREATE OR REPLACE FUNCTION set_team_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_code IS NULL OR NEW.team_code = '' THEN
        NEW.team_code := generate_team_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_team_code ON teams;
CREATE TRIGGER trigger_set_team_code
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION set_team_code();

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at if the column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'updated_at') THEN
        DROP TRIGGER IF EXISTS trigger_teams_updated_at ON teams;
        CREATE TRIGGER trigger_teams_updated_at
            BEFORE UPDATE ON teams
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
