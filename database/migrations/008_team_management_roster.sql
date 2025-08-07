-- =============================================================================
-- MIGRATION 008: TEAM MANAGEMENT & ROSTER SYSTEM
-- Enhanced team structure, player roster management, depth charts, and hierarchy
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENHANCED TEAM STRUCTURE - Organizational Hierarchy and Settings
-- =============================================================================

-- Add columns to existing teams table for enhanced management
ALTER TABLE teams ADD COLUMN IF NOT EXISTS
  organization_id UUID, -- Parent organization (league, school district, etc.)
  team_level TEXT CHECK (team_level IN (
    'youth', 'middle_school', 'jv', 'varsity', 'college', 'semi_pro', 'pro'
  )) DEFAULT 'varsity',
  division TEXT, -- Conference, league division, etc.
  league_name TEXT,
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Team Configuration
  max_roster_size INTEGER DEFAULT 50,
  scholarship_count INTEGER DEFAULT 0, -- For college/pro teams
  budget_allocation DECIMAL(12,2) DEFAULT 0.00,
  
  -- Team Identity
  primary_color TEXT DEFAULT '#1E40AF',
  secondary_color TEXT DEFAULT '#FFFFFF',
  mascot_name TEXT,
  fight_song TEXT,
  team_motto TEXT,
  
  -- Season Information  
  season_start_date DATE,
  season_end_date DATE,
  playoff_eligible BOOLEAN DEFAULT true,
  current_record TEXT, -- "5-2", "0-0", etc.
  
  -- Contact and Location
  home_field TEXT,
  practice_facility TEXT,
  mailing_address TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  
  -- Team Settings
  public_roster BOOLEAN DEFAULT false, -- Is roster visible to public?
  allow_parent_access BOOLEAN DEFAULT true,
  require_physical BOOLEAN DEFAULT true,
  require_insurance BOOLEAN DEFAULT true,
  
  updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for enhanced teams queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_organization_level
  ON teams(organization_id, team_level, season_year);

-- =============================================================================
-- PLAYER ROSTER MANAGEMENT - Detailed Player Information
-- =============================================================================

CREATE TABLE player_roster (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Roster Information
  jersey_number INTEGER CHECK (jersey_number BETWEEN 0 AND 99),
  primary_position TEXT NOT NULL, -- 'QB', 'RB', 'WR', 'TE', 'OL', etc.
  secondary_positions TEXT[] DEFAULT '{}', -- Additional positions player can play
  
  -- Player Classification
  class_year TEXT CHECK (class_year IN (
    'freshman', 'sophomore', 'junior', 'senior', 'graduate', 'redshirt'
  )),
  eligibility_years_remaining INTEGER DEFAULT 4,
  roster_status TEXT NOT NULL DEFAULT 'active' CHECK (roster_status IN (
    'active', 'injured', 'suspended', 'academic_probation', 'inactive', 'transferred'
  )),
  
  -- Physical Information
  height_inches INTEGER CHECK (height_inches BETWEEN 48 AND 96), -- 4'0" to 8'0"
  weight_pounds INTEGER CHECK (weight_pounds BETWEEN 80 AND 400),
  dominant_hand TEXT CHECK (dominant_hand IN ('left', 'right', 'ambidextrous')) DEFAULT 'right',
  
  -- Academic Information
  gpa DECIMAL(3,2) CHECK (gpa BETWEEN 0.00 AND 4.00),
  academic_standing TEXT CHECK (academic_standing IN (
    'excellent', 'good', 'warning', 'probation', 'ineligible'
  )) DEFAULT 'good',
  graduation_year INTEGER,
  major TEXT, -- For college players
  
  -- Medical and Safety
  medical_clearance BOOLEAN DEFAULT false,
  medical_clearance_date DATE,
  medical_clearance_expires DATE,
  insurance_verified BOOLEAN DEFAULT false,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT,
  
  -- Player Background
  previous_teams TEXT[] DEFAULT '{}',
  years_playing_football INTEGER DEFAULT 0,
  other_sports TEXT[] DEFAULT '{}',
  recruiting_notes TEXT, -- For coaches' recruiting information
  
  -- Parent/Guardian Information
  parent_guardian_1_name TEXT,
  parent_guardian_1_phone TEXT,
  parent_guardian_1_email TEXT,
  parent_guardian_2_name TEXT,
  parent_guardian_2_phone TEXT,
  parent_guardian_2_email TEXT,
  
  -- Roster Dates
  joined_team_date DATE NOT NULL DEFAULT CURRENT_DATE,
  left_team_date DATE,
  last_active_date DATE,
  
  -- Notes and Observations
  coaching_notes TEXT,
  behavioral_notes TEXT,
  special_accommodations TEXT,
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(team_id, jersey_number) WHERE roster_status = 'active', -- No duplicate active jersey numbers
  UNIQUE(user_id, team_id), -- Each user can only be on roster once per team
  
  -- Indexes
  INDEX idx_player_roster_team_position (team_id, primary_position, roster_status),
  INDEX idx_player_roster_status (roster_status, team_id),
  INDEX idx_player_roster_jersey (team_id, jersey_number) WHERE roster_status = 'active'
);

-- =============================================================================
-- DEPTH CHART SYSTEM - Position Rankings and Rotation
-- =============================================================================

CREATE TABLE depth_chart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  position TEXT NOT NULL, -- 'QB', 'RB1', 'RB2', 'LT', 'LG', etc.
  position_group TEXT NOT NULL, -- 'offense', 'defense', 'special_teams'
  
  -- Depth Chart Structure
  depth_order INTEGER NOT NULL CHECK (depth_order >= 1), -- 1 = starter, 2 = backup, etc.
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  
  -- Position Details
  formation_specific TEXT, -- '11 personnel', '12 personnel', 'nickel', 'dime'
  situation_specific TEXT, -- 'short_yardage', 'passing_downs', 'goal_line'
  
  -- Status and Notes
  is_starter BOOLEAN GENERATED ALWAYS AS (depth_order = 1) STORED,
  injury_replacement BOOLEAN DEFAULT false, -- Temporarily elevated due to injury
  projected_playing_time_pct DECIMAL(5,2) CHECK (projected_playing_time_pct BETWEEN 0 AND 100),
  
  -- Coaching Information
  ready_to_start BOOLEAN DEFAULT false, -- Coach assessment of readiness
  development_priority INTEGER CHECK (development_priority BETWEEN 1 AND 5) DEFAULT 3,
  competition_notes TEXT, -- Notes about position competition
  
  -- Seasonal Tracking
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  last_updated_by TEXT NOT NULL,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(team_id, position, depth_order, season_year), -- No duplicate depth positions
  
  -- Indexes
  INDEX idx_depth_chart_team_position (team_id, position_group, position, depth_order),
  INDEX idx_depth_chart_player (player_id, is_starter),
  INDEX idx_depth_chart_season (team_id, season_year, position_group)
);

-- =============================================================================
-- COACHING STAFF MANAGEMENT - Roles and Responsibilities
-- =============================================================================

CREATE TABLE coaching_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Coaching Position
  title TEXT NOT NULL, -- 'Head Coach', 'Offensive Coordinator', 'Position Coach'
  position_group TEXT, -- 'offense', 'defense', 'special_teams', 'general'
  specific_positions TEXT[] DEFAULT '{}', -- Specific positions coached
  
  -- Hierarchy
  reports_to UUID REFERENCES coaching_staff(id), -- Who this coach reports to
  seniority_level INTEGER DEFAULT 1 CHECK (seniority_level BETWEEN 1 AND 10),
  can_recruit BOOLEAN DEFAULT false,
  can_discipline BOOLEAN DEFAULT false,
  
  -- Contact and Bio
  phone_number TEXT,
  email_address TEXT,
  bio TEXT,
  coaching_philosophy TEXT,
  years_coaching INTEGER DEFAULT 0,
  years_at_current_position INTEGER DEFAULT 0,
  
  -- Credentials
  certifications TEXT[] DEFAULT '{}', -- Coaching certifications
  education_background TEXT,
  previous_coaching_positions TEXT[] DEFAULT '{}',
  playing_background TEXT,
  
  -- Responsibilities
  primary_responsibilities TEXT[] DEFAULT '{}',
  recruiting_territories TEXT[] DEFAULT '{}',
  administrative_duties TEXT[] DEFAULT '{}',
  
  -- Employment Information
  employment_type TEXT CHECK (employment_type IN (
    'full_time', 'part_time', 'volunteer', 'graduate_assistant', 'intern'
  )) DEFAULT 'part_time',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  salary_range TEXT, -- Optional salary information
  
  -- Performance and Evaluation
  last_evaluation_date DATE,
  contract_renewal_date DATE,
  performance_notes TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, team_id) WHERE is_active = true, -- One active coaching role per team
  
  -- Indexes
  INDEX idx_coaching_staff_team_active (team_id, is_active, seniority_level),
  INDEX idx_coaching_staff_position_group (position_group, team_id),
  INDEX idx_coaching_staff_hierarchy (reports_to, seniority_level)
);

-- =============================================================================
-- TEAM CAPTAIN AND LEADERSHIP - Player Leadership Structure
-- =============================================================================

CREATE TABLE team_captains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Captain Information
  captain_type TEXT NOT NULL CHECK (captain_type IN (
    'team_captain', 'offensive_captain', 'defensive_captain', 'special_teams_captain'
  )),
  is_head_captain BOOLEAN DEFAULT false,
  
  -- Selection Information
  selection_method TEXT CHECK (selection_method IN (
    'coach_selected', 'player_elected', 'combination'
  )) DEFAULT 'coach_selected',
  selection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Leadership Responsibilities
  responsibilities TEXT[] DEFAULT '{}',
  leadership_goals TEXT[] DEFAULT '{}',
  
  -- Performance Tracking
  leadership_rating INTEGER CHECK (leadership_rating BETWEEN 1 AND 10),
  peer_respect_rating INTEGER CHECK (peer_respect_rating BETWEEN 1 AND 10),
  coach_confidence_rating INTEGER CHECK (coach_confidence_rating BETWEEN 1 AND 10),
  
  -- Duration
  season_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  is_active BOOLEAN DEFAULT true,
  end_date DATE,
  end_reason TEXT,
  
  -- Notes
  selection_notes TEXT,
  performance_notes TEXT,
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(player_id, captain_type, season_year), -- One captain role per player per season
  
  -- Indexes
  INDEX idx_team_captains_team_season (team_id, season_year, is_active),
  INDEX idx_team_captains_type (captain_type, is_head_captain)
);

-- =============================================================================
-- PLAYER ELIGIBILITY TRACKING - Academic and Athletic Eligibility
-- =============================================================================

CREATE TABLE player_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Eligibility Period
  eligibility_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_period TEXT CHECK (review_period IN (
    'weekly', 'monthly', 'quarterly', 'semester', 'annual'
  )) DEFAULT 'weekly',
  
  -- Academic Eligibility
  academic_eligible BOOLEAN DEFAULT true,
  current_gpa DECIMAL(3,2),
  credit_hours_completed INTEGER,
  credit_hours_required INTEGER,
  academic_warnings TEXT[] DEFAULT '{}',
  
  -- Athletic Eligibility
  athletic_eligible BOOLEAN DEFAULT true,
  medical_clearance_current BOOLEAN DEFAULT true,
  insurance_current BOOLEAN DEFAULT true,
  physical_current BOOLEAN DEFAULT true,
  concussion_protocol_cleared BOOLEAN DEFAULT true,
  
  -- Disciplinary Status
  disciplinary_eligible BOOLEAN DEFAULT true,
  active_suspensions TEXT[] DEFAULT '{}',
  disciplinary_warnings TEXT[] DEFAULT '{}',
  community_service_hours INTEGER DEFAULT 0,
  community_service_required INTEGER DEFAULT 0,
  
  -- Transfer and Recruiting
  transfer_eligible BOOLEAN DEFAULT true,
  recruiting_contact_eligible BOOLEAN DEFAULT true,
  ncaa_clearinghouse_status TEXT, -- For college-bound players
  
  -- Overall Status
  overall_eligible BOOLEAN GENERATED ALWAYS AS (
    academic_eligible AND athletic_eligible AND disciplinary_eligible
  ) STORED,
  
  -- Review Information
  reviewed_by TEXT NOT NULL,
  review_date DATE DEFAULT CURRENT_DATE,
  next_review_date DATE,
  review_notes TEXT,
  
  -- Alerts and Actions
  requires_attention BOOLEAN DEFAULT false,
  action_items TEXT[] DEFAULT '{}',
  follow_up_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_player_eligibility_status (overall_eligible, team_id, eligibility_date DESC),
  INDEX idx_player_eligibility_player (player_id, eligibility_date DESC),
  INDEX idx_player_eligibility_review (next_review_date, requires_attention)
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE player_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE depth_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_eligibility ENABLE ROW LEVEL SECURITY;

-- Player Roster - Players can read their own info, coaches/staff can manage team data
CREATE POLICY "player_roster_self_read" ON player_roster
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "player_roster_team_read" ON player_roster
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

CREATE POLICY "player_roster_coaches_manage" ON player_roster
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Depth Chart - Team members can read, coaches can manage
CREATE POLICY "depth_chart_team_read" ON depth_chart
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

CREATE POLICY "depth_chart_coaches_manage" ON depth_chart
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Coaching Staff - Staff can read their own info and team info
CREATE POLICY "coaching_staff_self_read" ON coaching_staff
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "coaching_staff_team_read" ON coaching_staff
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

CREATE POLICY "coaching_staff_admins_manage" ON coaching_staff
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
      AND tm.role = 'admin'
    )
  );

-- Team Captains - Team members can read, coaches can manage
CREATE POLICY "team_captains_team_read" ON team_captains
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

CREATE POLICY "team_captains_coaches_manage" ON team_captains
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Player Eligibility - Players can read their own, coaches can manage
CREATE POLICY "player_eligibility_self_read" ON player_eligibility
  FOR SELECT TO authenticated
  USING (
    player_id IN (
      SELECT pr.id FROM player_roster pr
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "player_eligibility_coaches_all" ON player_eligibility
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
      AND tm.role IN ('coach', 'admin')
    )
  );

-- =============================================================================
-- TRIGGERS AND AUTOMATED FUNCTIONS
-- =============================================================================

-- Auto-update team member role when coaching staff record is created
CREATE OR REPLACE FUNCTION sync_coaching_staff_with_team_members()
RETURNS TRIGGER AS $$
BEGIN
  -- Update team_members role to coach if not already
  UPDATE team_members SET 
    role = 'coach',
    updated_at = NOW()
  WHERE user_id = NEW.user_id 
    AND team_id = NEW.team_id 
    AND role != 'coach';
    
  -- Insert team_member record if it doesn't exist
  INSERT INTO team_members (user_id, team_id, role, joined_date, is_active)
  VALUES (NEW.user_id, NEW.team_id, 'coach', NEW.start_date, NEW.is_active)
  ON CONFLICT (user_id, team_id) DO UPDATE SET
    role = 'coach',
    is_active = NEW.is_active,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_coaching_staff
  AFTER INSERT OR UPDATE ON coaching_staff
  FOR EACH ROW
  EXECUTE FUNCTION sync_coaching_staff_with_team_members();

-- Auto-update player eligibility when roster status changes
CREATE OR REPLACE FUNCTION update_eligibility_on_roster_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If player becomes inactive, mark as ineligible
  IF NEW.roster_status != 'active' AND OLD.roster_status = 'active' THEN
    INSERT INTO player_eligibility (
      player_id, team_id, athletic_eligible, overall_eligible, 
      reviewed_by, review_notes
    ) VALUES (
      NEW.id, NEW.team_id, false, false,
      COALESCE(auth.uid()::TEXT, 'system'),
      'Automatically marked ineligible due to roster status change to: ' || NEW.roster_status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_eligibility
  AFTER UPDATE ON player_roster
  FOR EACH ROW
  WHEN (OLD.roster_status != NEW.roster_status)
  EXECUTE FUNCTION update_eligibility_on_roster_change();

-- Auto-assign jersey numbers for new players (find lowest available)
CREATE OR REPLACE FUNCTION assign_jersey_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  -- Only assign if no jersey number provided
  IF NEW.jersey_number IS NULL THEN
    -- Find the lowest available jersey number
    SELECT MIN(candidate) INTO next_number
    FROM generate_series(1, 99) AS candidate
    WHERE candidate NOT IN (
      SELECT jersey_number 
      FROM player_roster 
      WHERE team_id = NEW.team_id 
        AND roster_status = 'active' 
        AND jersey_number IS NOT NULL
    );
    
    NEW.jersey_number := COALESCE(next_number, 99);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assign_jersey_number
  BEFORE INSERT ON player_roster
  FOR EACH ROW
  EXECUTE FUNCTION assign_jersey_number();

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_roster_search
  ON player_roster(team_id, primary_position, roster_status, jersey_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_depth_chart_starters
  ON depth_chart(team_id, position_group, is_starter, depth_order)
  WHERE is_starter = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eligibility_alerts
  ON player_eligibility(requires_attention, next_review_date, overall_eligible)
  WHERE requires_attention = true OR overall_eligible = false;

-- =============================================================================
-- COMPLETION STATUS
-- =============================================================================

-- Migration 008: Team Management & Roster System
-- ✅ Enhanced teams table with organizational hierarchy and settings
-- ✅ Comprehensive player roster management with detailed player information
-- ✅ Depth chart system with position rankings and situational assignments
-- ✅ Coaching staff management with hierarchy and responsibilities  
-- ✅ Team captain and leadership structure tracking
-- ✅ Player eligibility tracking with academic and athletic monitoring
-- ✅ Row Level Security with appropriate access controls for all roles
-- ✅ Automated triggers for roster management and eligibility updates
-- ✅ Performance indexes for efficient roster and staff queries

-- Ready for Team Management Service Implementation
