-- BoxCall Team Management Tables
-- Migration 001: Core team management infrastructure

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    team_code TEXT UNIQUE,
    location JSONB DEFAULT '{}', -- {address, city, state, zipCode}
    subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'coach', 'team_premium')),
    subscription_expires_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TEAM MEMBERS TABLE (Coaches, Staff)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- =====================================================
-- TEAM PLAYERS TABLE (Roster)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    parent_email TEXT,
    positions TEXT[] DEFAULT '{}', -- ["QB", "WR", "RB"]
    jersey_number INTEGER,
    height TEXT,
    weight INTEGER,
    grade INTEGER,
    graduation_year INTEGER,
    team_level TEXT DEFAULT 'varsity' CHECK (team_level IN ('varsity', 'jv', 'middle_school', 'freshman')),
    bio TEXT,
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, jersey_number) -- Jersey numbers unique per team
);

-- =====================================================
-- TEAM INVITES TABLE (Invitation System)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('head_coach', 'assistant_coach', 'coordinator', 'manager', 'player', 'family')),
    invite_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, email) -- One invite per email per team
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "team_access_policy" ON teams;
DROP POLICY IF EXISTS "team_members_access_policy" ON team_members;
DROP POLICY IF EXISTS "team_players_access_policy" ON team_players;
DROP POLICY IF EXISTS "team_invites_access_policy" ON team_invites;

-- Teams: Users can see teams they're members of OR super admins can see all
CREATE POLICY "team_access_policy" ON teams
    FOR ALL USING (
        -- Super admins can see all teams
        EXISTS (
            SELECT 1 FROM super_admins 
            WHERE user_id = auth.uid()
        )
        OR
        -- Team members can see their teams
        id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Team Members: Users can see other members of their teams OR super admins can see all
CREATE POLICY "team_members_access_policy" ON team_members
    FOR ALL USING (
        -- Super admins can see all team members
        EXISTS (
            SELECT 1 FROM super_admins 
            WHERE user_id = auth.uid()
        )
        OR
        -- Team members can see other members of their teams
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Team Players: Same access pattern as team members
CREATE POLICY "team_players_access_policy" ON team_players
    FOR ALL USING (
        -- Super admins can see all team players
        EXISTS (
            SELECT 1 FROM super_admins 
            WHERE user_id = auth.uid()
        )
        OR
        -- Team members can see players on their teams
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Team Invites: Users can see invites for teams they're members of OR invites sent to them
CREATE POLICY "team_invites_access_policy" ON team_invites
    FOR ALL USING (
        -- Super admins can see all invites
        EXISTS (
            SELECT 1 FROM super_admins 
            WHERE user_id = auth.uid()
        )
        OR
        -- Team members can see invites for their teams
        team_id IN (
            SELECT team_id FROM team_members 
            WHERE user_id = auth.uid()
        )
        OR
        -- Users can see invites sent to their email
        email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Team lookup indexes
CREATE INDEX IF NOT EXISTS idx_teams_team_code ON teams(team_code);
CREATE INDEX IF NOT EXISTS idx_teams_subscription ON teams(subscription_type);

-- Team member lookup indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

-- Team player lookup indexes
CREATE INDEX IF NOT EXISTS idx_team_players_team_id ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_jersey ON team_players(team_id, jersey_number);
CREATE INDEX IF NOT EXISTS idx_team_players_position ON team_players USING GIN(positions);

-- Team invite lookup indexes
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);

-- =====================================================
-- HELPFUL FUNCTIONS
-- =====================================================

-- Function to generate unique team codes
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 6-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM teams WHERE team_code = code) INTO exists;
        
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate team codes
CREATE OR REPLACE FUNCTION set_team_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_code IS NULL THEN
        NEW.team_code = generate_team_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_team_code ON teams;
CREATE TRIGGER trigger_set_team_code
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION set_team_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS trigger_team_players_updated_at ON team_players;

-- Triggers for updated_at
CREATE TRIGGER trigger_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_team_players_updated_at
    BEFORE UPDATE ON team_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
