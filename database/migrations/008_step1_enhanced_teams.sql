-- =============================================================================
-- MIGRATION 008 STEP 1: ENHANCED TEAM STRUCTURE
-- Organizational hierarchy, settings, and team identity
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- ENHANCED TEAM STRUCTURE - Organizational Hierarchy and Settings
-- =============================================================================

-- Add columns to existing teams table for enhanced management
ALTER TABLE teams ADD COLUMN IF NOT EXISTS organization_id UUID; -- Parent organization (league, school district, etc.)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_level TEXT CHECK (team_level IN (
  'youth', 'middle_school', 'jv', 'varsity', 'college', 'semi_pro', 'pro'
)) DEFAULT 'varsity';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS division TEXT; -- Conference, league division, etc.
ALTER TABLE teams ADD COLUMN IF NOT EXISTS league_name TEXT;

-- Team Configuration
ALTER TABLE teams ADD COLUMN IF NOT EXISTS max_roster_size INTEGER DEFAULT 50;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS scholarship_count INTEGER DEFAULT 0; -- For college/pro teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS budget_allocation DECIMAL(12,2) DEFAULT 0.00;

-- Team Identity
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1E40AF';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#FFFFFF';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS mascot_name TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS fight_song TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_motto TEXT;

-- Season Information  
ALTER TABLE teams ADD COLUMN IF NOT EXISTS season_start_date DATE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS season_end_date DATE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS playoff_eligible BOOLEAN DEFAULT true;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS current_record TEXT; -- "5-2", "0-0", etc.

-- Contact and Location
ALTER TABLE teams ADD COLUMN IF NOT EXISTS home_field TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS practice_facility TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS mailing_address TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;

-- Team Settings
ALTER TABLE teams ADD COLUMN IF NOT EXISTS public_roster BOOLEAN DEFAULT false; -- Is roster visible to public?
ALTER TABLE teams ADD COLUMN IF NOT EXISTS allow_parent_access BOOLEAN DEFAULT true;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS require_physical BOOLEAN DEFAULT true;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS require_insurance BOOLEAN DEFAULT true;

-- =============================================================================
-- ORGANIZATIONS - Parent Organizations for Team Hierarchy
-- =============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN (
    'school_district', 'athletic_conference', 'league', 'club', 'academy'
  )),
  
  -- Organization Details
  description TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Location Information
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  
  -- Organization Settings
  allows_public_access BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  membership_fee DECIMAL(10,2) DEFAULT 0.00,
  
  -- Metadata
  established_date DATE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1E40AF',
  secondary_color TEXT DEFAULT '#FFFFFF',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for organization_id in teams
ALTER TABLE teams ADD CONSTRAINT fk_teams_organization 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- =============================================================================
-- COACHING STAFF - Detailed Coaching Hierarchy
-- =============================================================================

CREATE TABLE coaching_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Coaching Position
  position_title TEXT NOT NULL, -- 'Head Coach', 'Offensive Coordinator', 'Position Coach', etc.
  coaching_level TEXT NOT NULL CHECK (coaching_level IN (
    'head_coach', 'coordinator', 'position_coach', 'assistant_coach', 'volunteer', 'intern'
  )),
  position_group TEXT, -- 'Offense', 'Defense', 'Special Teams', 'Strength & Conditioning'
  specific_positions TEXT[], -- ['QB', 'WR'] for position coaches
  
  -- Employment Details
  employment_type TEXT CHECK (employment_type IN (
    'full_time', 'part_time', 'volunteer', 'contract'
  )) DEFAULT 'part_time',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL for current staff
  salary_range TEXT, -- '$50,000-$60,000' or similar
  
  -- Qualifications
  years_experience INTEGER DEFAULT 0,
  previous_positions TEXT[],
  certifications TEXT[],
  education_background TEXT,
  
  -- Responsibilities
  primary_duties TEXT[],
  recruiting_responsibilities TEXT[],
  administrative_duties TEXT[],
  
  -- Contact Information
  office_location TEXT,
  office_phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  
  -- Performance and Status
  performance_reviews JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  background_check_completed BOOLEAN DEFAULT false,
  background_check_date DATE,
  
  -- Coaching Philosophy
  coaching_philosophy TEXT,
  specialty_areas TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, user_id) -- A user can only have one coaching position per team
);

-- =============================================================================
-- ROW LEVEL SECURITY - ENHANCED TEAMS AND STAFF
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_staff ENABLE ROW LEVEL SECURITY;

-- Organizations - Public read for discovery, admin write
CREATE POLICY "organizations_public_read" ON organizations
  FOR SELECT TO authenticated
  USING (allows_public_access = true OR id IN (
    SELECT t.organization_id FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  ));

CREATE POLICY "organizations_admin_write" ON organizations
  FOR ALL TO authenticated
  USING (id IN (
    SELECT t.organization_id FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid() AND tm.role IN ('admin')
  ));

-- Coaching Staff - Team members read, admins write
CREATE POLICY "coaching_staff_team_read" ON coaching_staff
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "coaching_staff_admin_write" ON coaching_staff
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role IN ('admin', 'coach')
    )
  );

-- Coaches can view and update their own record
CREATE POLICY "coaching_staff_self_manage" ON coaching_staff
  FOR ALL TO authenticated
  USING (user_id = auth.uid()::text);

-- =============================================================================
-- BASIC INDEXES - ENHANCED TEAMS AND STAFF
-- =============================================================================

-- Enhanced teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_organization_level 
  ON teams(organization_id, team_level, season_year);
CREATE INDEX IF NOT EXISTS idx_teams_location 
  ON teams(home_field, practice_facility) WHERE home_field IS NOT NULL;

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_type 
  ON organizations(organization_type, allows_public_access);

-- Coaching staff indexes
CREATE INDEX IF NOT EXISTS idx_coaching_staff_team_level 
  ON coaching_staff(team_id, coaching_level, is_active);
CREATE INDEX IF NOT EXISTS idx_coaching_staff_position 
  ON coaching_staff(position_group, specific_positions);
CREATE INDEX IF NOT EXISTS idx_coaching_staff_active 
  ON coaching_staff(is_active, team_id) WHERE is_active = true;

-- =============================================================================
-- STEP 1 COMPLETION STATUS
-- =============================================================================

-- Migration 008 Step 1: Enhanced Team Structure
-- ✅ Enhanced teams table with organizational hierarchy
-- ✅ organizations table for parent organization management
-- ✅ coaching_staff table for detailed coaching hierarchy
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created

-- Ready for Step 2: Player Roster Management
