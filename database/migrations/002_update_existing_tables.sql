-- BoxCall Team Management - UPDATE MIGRATION
-- Migration 002: Add team management columns to existing tables
-- This safely adds new columns and features to existing database

-- =====================================================
-- UPDATE EXISTING TABLES WITH NEW COLUMNS
-- =====================================================

-- Add team management columns to existing teams table
DO $$ 
BEGIN
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='description') THEN
        ALTER TABLE teams ADD COLUMN description TEXT;
    END IF;
    
    -- Add logo_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='logo_url') THEN
        ALTER TABLE teams ADD COLUMN logo_url TEXT;
    END IF;
    
    -- Add team_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='team_code') THEN
        ALTER TABLE teams ADD COLUMN team_code TEXT UNIQUE;
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='location') THEN
        ALTER TABLE teams ADD COLUMN location JSONB DEFAULT '{}';
    END IF;
    
    -- Add subscription_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='subscription_type') THEN
        ALTER TABLE teams ADD COLUMN subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'coach', 'team_premium'));
    END IF;
    
    -- Add subscription_expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='subscription_expires_at') THEN
        ALTER TABLE teams ADD COLUMN subscription_expires_at TIMESTAMP;
    END IF;
    
    -- Add settings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='settings') THEN
        ALTER TABLE teams ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- Update team_members table with new columns
DO $$ 
BEGIN
    -- Add permissions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='permissions') THEN
        ALTER TABLE team_members ADD COLUMN permissions JSONB DEFAULT '{}';
    END IF;
    
    -- Add joined_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='joined_at') THEN
        ALTER TABLE team_members ADD COLUMN joined_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Update team_players table with detailed player information
DO $$ 
BEGIN
    -- Add first_name column if it doesn't exist (split from name)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='first_name') THEN
        ALTER TABLE team_players ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='last_name') THEN
        ALTER TABLE team_players ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='email') THEN
        ALTER TABLE team_players ADD COLUMN email TEXT;
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='phone') THEN
        ALTER TABLE team_players ADD COLUMN phone TEXT;
    END IF;
    
    -- Add parent_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='parent_email') THEN
        ALTER TABLE team_players ADD COLUMN parent_email TEXT;
    END IF;
    
    -- Add positions column if it doesn't exist (multi-position support)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='positions') THEN
        ALTER TABLE team_players ADD COLUMN positions TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add jersey_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='jersey_number') THEN
        ALTER TABLE team_players ADD COLUMN jersey_number INTEGER;
    END IF;
    
    -- Add height column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='height') THEN
        ALTER TABLE team_players ADD COLUMN height TEXT;
    END IF;
    
    -- Add weight column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='weight') THEN
        ALTER TABLE team_players ADD COLUMN weight INTEGER;
    END IF;
    
    -- Add grade column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='grade') THEN
        ALTER TABLE team_players ADD COLUMN grade INTEGER;
    END IF;
    
    -- Add graduation_year column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='graduation_year') THEN
        ALTER TABLE team_players ADD COLUMN graduation_year INTEGER;
    END IF;
    
    -- Add team_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='team_level') THEN
        ALTER TABLE team_players ADD COLUMN team_level TEXT DEFAULT 'varsity' CHECK (team_level IN ('varsity', 'jv', 'middle_school', 'freshman'));
    END IF;
    
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='bio') THEN
        ALTER TABLE team_players ADD COLUMN bio TEXT;
    END IF;
    
    -- Add stats column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_players' AND column_name='stats') THEN
        ALTER TABLE team_players ADD COLUMN stats JSONB DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- CREATE MISSING TABLES (if they don't exist)
-- =====================================================

-- Create team_invites table if it doesn't exist
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
    UNIQUE(team_id, email)
);

-- =====================================================
-- ADD MISSING CONSTRAINTS AND INDEXES
-- =====================================================

-- Add unique constraint for jersey numbers per team (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'team_players_team_id_jersey_number_key'
    ) THEN
        ALTER TABLE team_players ADD CONSTRAINT team_players_team_id_jersey_number_key UNIQUE (team_id, jersey_number);
    END IF;
END $$;

-- Add unique constraint for team members (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'team_members_team_id_user_id_key'
    ) THEN
        ALTER TABLE team_members ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);
    END IF;
END $$;

-- =====================================================
-- ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for clean updates
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
-- PERFORMANCE INDEXES
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
-- HELPER FUNCTIONS AND TRIGGERS
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

-- Function to auto-generate team codes
CREATE OR REPLACE FUNCTION set_team_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.team_code IS NULL THEN
        NEW.team_code = generate_team_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS trigger_set_team_code ON teams;
DROP TRIGGER IF EXISTS trigger_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS trigger_team_players_updated_at ON team_players;

-- Create triggers
CREATE TRIGGER trigger_set_team_code
    BEFORE INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION set_team_code();

CREATE TRIGGER trigger_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_team_players_updated_at
    BEFORE UPDATE ON team_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
