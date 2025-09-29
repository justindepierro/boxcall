-- Role System Migration
-- Generated: 2025-09-29T01:01:28.128Z
-- Purpose: Add app_role and team_role system to existing tables


-- Add role system fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS app_role TEXT DEFAULT 'player' CHECK (app_role IN ('admin', 'head_coach', 'coach', 'free_coach', 'player', 'family')),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,

-- Add coaching fields  
ADD COLUMN IF NOT EXISTS years_coaching INTEGER,
ADD COLUMN IF NOT EXISTS coaching_experience TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS coaching_philosophy TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS current_school TEXT,

-- Add subscription fields
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;



-- Add team role fields to team_members table
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS team_role TEXT DEFAULT 'player' CHECK (team_role IN ('owner', 'head_coach', 'assistant_coach', 'coordinator', 'manager', 'family', 'alumni', 'player')),
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES profiles(id);


-- Add constraint for app_role check (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_app_role_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_app_role_check 
        CHECK (app_role IN ('admin', 'head_coach', 'coach', 'free_coach', 'player', 'family'));
    END IF;
END $$;

-- Add constraint for team_role check (if it doesn't exist)  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'team_members_team_role_check'
    ) THEN
        ALTER TABLE team_members ADD CONSTRAINT team_members_team_role_check 
        CHECK (team_role IN ('owner', 'head_coach', 'assistant_coach', 'coordinator', 'manager', 'family', 'alumni', 'player'));
    END IF;
END $$;
