-- =============================================================================
-- MIGRATION 008 STEP 2: PLAYER ROSTER MANAGEMENT
-- Detailed player information, roster status, and eligibility
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

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
  insurance_carrier TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Background Information
  hometown TEXT,
  high_school TEXT, -- For college players
  previous_teams TEXT[],
  years_playing_football INTEGER DEFAULT 0,
  
  -- Player Development
  recruited_by TEXT, -- Coach who recruited them
  scholarship_amount DECIMAL(10,2) DEFAULT 0.00,
  scholarship_type TEXT CHECK (scholarship_type IN (
    'full', 'partial', 'academic', 'need_based', 'walk_on'
  )),
  
  -- Status Tracking
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_physical_date DATE,
  last_concussion_test_date DATE,
  suspension_details JSONB DEFAULT '{}',
  injury_history JSONB DEFAULT '{}',
  
  -- Player Notes
  scouting_notes TEXT,
  development_goals TEXT[],
  parent_guardian_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(team_id, user_id) -- One roster entry per player per team
);

-- =============================================================================
-- DEPTH CHART MANAGEMENT - Position Depth Organization
-- =============================================================================

CREATE TABLE depth_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Depth Chart Information
  position_group TEXT NOT NULL, -- 'Offense', 'Defense', 'Special Teams'
  specific_position TEXT NOT NULL, -- 'QB', 'RB', 'WR', 'LB', etc.
  formation_context TEXT, -- '11 Personnel', 'Goal Line', 'Nickel', etc.
  
  -- Depth Order
  depth_order INTEGER NOT NULL CHECK (depth_order > 0), -- 1 = starter, 2 = backup, etc.
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  
  -- Status and Notes
  is_starter BOOLEAN DEFAULT false,
  injury_replacement BOOLEAN DEFAULT false, -- Temporary due to injury
  special_packages TEXT[], -- Special situations where this player is used
  
  -- Performance Context
  last_updated_by TEXT NOT NULL, -- Coach who updated the depth chart
  last_updated_reason TEXT, -- 'performance', 'injury', 'discipline', etc.
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Coaching Notes
  strengths_in_position TEXT[],
  development_needs TEXT[],
  position_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(team_id, position_group, specific_position, formation_context, depth_order),
  UNIQUE(team_id, player_id, position_group, specific_position, formation_context)
);

-- =============================================================================
-- PLAYER ELIGIBILITY TRACKING - Academic and Athletic Eligibility
-- =============================================================================

CREATE TABLE player_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES player_roster(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Eligibility Period
  eligibility_period TEXT NOT NULL, -- 'Fall 2024', 'Spring 2025', etc.
  academic_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  semester_quarter TEXT, -- 'Fall', 'Spring', 'Q1', 'Q2', etc.
  
  -- Academic Eligibility
  academic_eligible BOOLEAN DEFAULT true,
  current_gpa DECIMAL(3,2) CHECK (current_gpa BETWEEN 0.00 AND 4.00),
  required_gpa DECIMAL(3,2) DEFAULT 2.00,
  credits_enrolled INTEGER DEFAULT 0,
  credits_required INTEGER DEFAULT 12, -- Full-time student requirement
  failing_courses INTEGER DEFAULT 0,
  academic_probation BOOLEAN DEFAULT false,
  
  -- Athletic Eligibility
  athletic_eligible BOOLEAN DEFAULT true,
  seasons_played INTEGER DEFAULT 0,
  seasons_remaining INTEGER DEFAULT 4,
  redshirt_status BOOLEAN DEFAULT false,
  transfer_rules_met BOOLEAN DEFAULT true,
  
  -- Disciplinary Status
  disciplinary_issues BOOLEAN DEFAULT false,
  suspension_active BOOLEAN DEFAULT false,
  suspension_details TEXT,
  community_service_hours INTEGER DEFAULT 0,
  required_community_service INTEGER DEFAULT 0,
  
  -- Medical Clearance
  medical_eligible BOOLEAN DEFAULT true,
  physical_exam_current BOOLEAN DEFAULT false,
  physical_exam_date DATE,
  concussion_protocol_cleared BOOLEAN DEFAULT true,
  injury_clearances TEXT[],
  
  -- Verification
  verified_by TEXT NOT NULL, -- Athletic director, compliance officer, etc.
  verification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_review_date DATE,
  
  -- Documentation
  supporting_documents TEXT[], -- Links to transcripts, medical records, etc.
  eligibility_notes TEXT,
  compliance_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id, eligibility_period)
);

-- =============================================================================
-- ROW LEVEL SECURITY - ROSTER AND ELIGIBILITY
-- =============================================================================

-- Enable RLS on roster tables
ALTER TABLE player_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE depth_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_eligibility ENABLE ROW LEVEL SECURITY;

-- Player Roster - Team members read, coaches write, players read own
CREATE POLICY "player_roster_team_read" ON player_roster
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "player_roster_coaches_write" ON player_roster
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "player_roster_self_read" ON player_roster
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

-- Depth Charts - Team members read, coaches write
CREATE POLICY "depth_charts_team_read" ON depth_charts
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "depth_charts_coaches_write" ON depth_charts
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role IN ('coach', 'admin')
    )
  );

-- Player Eligibility - Restricted access (coaches and admins)
CREATE POLICY "player_eligibility_coaches_read" ON player_eligibility
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "player_eligibility_admins_write" ON player_eligibility
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.role = 'admin'
    )
  );

-- =============================================================================
-- BASIC INDEXES - ROSTER AND ELIGIBILITY
-- =============================================================================

-- Player roster indexes
CREATE INDEX IF NOT EXISTS idx_player_roster_team_position 
  ON player_roster(team_id, primary_position, roster_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_roster_jersey_unique
  ON player_roster(team_id, jersey_number) WHERE roster_status = 'active';
CREATE INDEX IF NOT EXISTS idx_player_roster_status 
  ON player_roster(roster_status, team_id);

-- Depth chart indexes
CREATE INDEX IF NOT EXISTS idx_depth_charts_position_order 
  ON depth_charts(team_id, position_group, specific_position, depth_order);
CREATE INDEX IF NOT EXISTS idx_depth_charts_player 
  ON depth_charts(player_id, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_depth_charts_starters 
  ON depth_charts(team_id, is_starter) WHERE is_starter = true;

-- Player eligibility indexes
CREATE INDEX IF NOT EXISTS idx_player_eligibility_period 
  ON player_eligibility(eligibility_period, academic_year);
CREATE INDEX IF NOT EXISTS idx_player_eligibility_status 
  ON player_eligibility(academic_eligible, athletic_eligible, team_id);

-- =============================================================================
-- STEP 2 COMPLETION STATUS
-- =============================================================================

-- Migration 008 Step 2: Player Roster Management
-- ✅ player_roster table with detailed player information
-- ✅ depth_charts table for position depth organization
-- ✅ player_eligibility table for academic/athletic eligibility tracking
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created

-- Ready for Step 3: Parent/Guardian Communication System
