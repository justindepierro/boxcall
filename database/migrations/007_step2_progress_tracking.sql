-- =============================================================================
-- MIGRATION 007 STEP 2: PLAYER PROGRESS TRACKING
-- Long-term development monitoring and skill assessment
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- PLAYER PROGRESS TRACKING - Long-term Development Monitoring
-- =============================================================================

CREATE TABLE player_progress_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Progress Measurement Period
  tracking_period TEXT NOT NULL CHECK (tracking_period IN (
    'weekly', 'monthly', 'season', 'annual'
  )),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Baseline and Current Measurements
  baseline_measurements JSONB DEFAULT '{}', -- Starting point measurements
  current_measurements JSONB DEFAULT '{}', -- Current performance levels
  target_measurements JSONB DEFAULT '{}', -- Goals for end of period
  
  -- Skill Development Areas
  technical_skills JSONB DEFAULT '{}', -- Position-specific technical abilities
  physical_attributes JSONB DEFAULT '{}', -- Speed, strength, agility, endurance
  mental_aspects JSONB DEFAULT '{}', -- Game knowledge, decision making, focus
  leadership_qualities JSONB DEFAULT '{}', -- Communication, motivation, example-setting
  
  -- Progress Indicators
  improvement_rate TEXT CHECK (improvement_rate IN (
    'excellent', 'good', 'average', 'below_average', 'concerning'
  )),
  consistency_rating INTEGER CHECK (consistency_rating BETWEEN 1 AND 10) DEFAULT 5,
  coachability_rating INTEGER CHECK (coachability_rating BETWEEN 1 AND 10) DEFAULT 5,
  
  -- Development Plan
  focus_areas TEXT[] DEFAULT '{}', -- Primary areas for improvement
  development_activities TEXT[] DEFAULT '{}', -- Specific training activities
  milestone_targets JSONB DEFAULT '{}', -- Specific measurable goals
  
  -- Assessment Information
  assessed_by TEXT NOT NULL, -- Coach user_id
  assessment_method TEXT DEFAULT 'observation', -- 'observation', 'testing', 'video_analysis'
  next_assessment_date DATE,
  
  -- Progress Notes
  achievements_this_period TEXT[] DEFAULT '{}',
  challenges_faced TEXT[] DEFAULT '{}',
  coaching_adjustments_made TEXT[] DEFAULT '{}',
  parent_guardian_feedback TEXT,
  player_self_assessment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PLAYER SKILL ASSESSMENTS - Detailed Skill Evaluation
-- =============================================================================

CREATE TABLE player_skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Assessment Context
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN (
    'preseason', 'midseason', 'postseason', 'combine', 'camp', 'injury_return'
  )),
  assessor_id TEXT NOT NULL, -- Coach conducting assessment
  
  -- Physical Skills (1-10 scale)
  speed_rating INTEGER CHECK (speed_rating BETWEEN 1 AND 10),
  agility_rating INTEGER CHECK (agility_rating BETWEEN 1 AND 10),
  strength_rating INTEGER CHECK (strength_rating BETWEEN 1 AND 10),
  endurance_rating INTEGER CHECK (endurance_rating BETWEEN 1 AND 10),
  coordination_rating INTEGER CHECK (coordination_rating BETWEEN 1 AND 10),
  
  -- Position-Specific Technical Skills (1-10 scale)
  position_technique_rating INTEGER CHECK (position_technique_rating BETWEEN 1 AND 10),
  ball_handling_rating INTEGER CHECK (ball_handling_rating BETWEEN 1 AND 10),
  route_running_rating INTEGER CHECK (route_running_rating BETWEEN 1 AND 10),
  blocking_rating INTEGER CHECK (blocking_rating BETWEEN 1 AND 10),
  tackling_rating INTEGER CHECK (tackling_rating BETWEEN 1 AND 10),
  
  -- Mental/Cognitive Skills (1-10 scale)
  game_knowledge_rating INTEGER CHECK (game_knowledge_rating BETWEEN 1 AND 10),
  decision_making_rating INTEGER CHECK (decision_making_rating BETWEEN 1 AND 10),
  situational_awareness_rating INTEGER CHECK (situational_awareness_rating BETWEEN 1 AND 10),
  adaptability_rating INTEGER CHECK (adaptability_rating BETWEEN 1 AND 10),
  
  -- Character/Intangible Skills (1-10 scale)
  work_ethic_rating INTEGER CHECK (work_ethic_rating BETWEEN 1 AND 10),
  teamwork_rating INTEGER CHECK (teamwork_rating BETWEEN 1 AND 10),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 10),
  leadership_potential_rating INTEGER CHECK (leadership_potential_rating BETWEEN 1 AND 10),
  
  -- Measurable Performance Data
  forty_yard_dash_time DECIMAL(4,2), -- Time in seconds
  bench_press_max INTEGER, -- Maximum weight in pounds
  vertical_jump_inches INTEGER, -- Jump height in inches
  broad_jump_inches INTEGER, -- Distance in inches
  shuttle_run_time DECIMAL(4,2), -- Time in seconds
  
  -- Position-Specific Measurements (stored as JSONB for flexibility)
  position_specific_tests JSONB DEFAULT '{}',
  
  -- Overall Assessment
  overall_grade TEXT CHECK (overall_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F')),
  potential_rating INTEGER CHECK (potential_rating BETWEEN 1 AND 10),
  ceiling_assessment TEXT, -- Written assessment of player's potential
  
  -- Recommendations
  training_recommendations TEXT[] DEFAULT '{}',
  position_recommendations TEXT[] DEFAULT '{}',
  development_timeline TEXT, -- Short-term, medium-term, long-term goals
  
  -- Assessment Notes
  strengths_identified TEXT[] DEFAULT '{}',
  weaknesses_identified TEXT[] DEFAULT '{}',
  injury_considerations TEXT[] DEFAULT '{}',
  assessment_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY - PROGRESS AND ASSESSMENTS
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE player_progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_skill_assessments ENABLE ROW LEVEL SECURITY;

-- Progress Tracking - Team members can view, coaches can write
CREATE POLICY "progress_tracking_team_read" ON player_progress_tracking
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "progress_tracking_coaches_write" ON player_progress_tracking
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Skill Assessments - Similar policies
CREATE POLICY "skill_assessments_team_read" ON player_skill_assessments
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "skill_assessments_coaches_write" ON player_skill_assessments
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('coach', 'admin')
    )
  );

-- =============================================================================
-- BASIC INDEXES - PROGRESS AND ASSESSMENTS
-- =============================================================================

-- Progress tracking indexes
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_period 
  ON player_progress_tracking(user_id, tracking_period, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_team_period 
  ON player_progress_tracking(team_id, tracking_period, period_end DESC);

-- Skill assessment indexes
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_date 
  ON player_skill_assessments(user_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_team_type 
  ON player_skill_assessments(team_id, assessment_type, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_overall 
  ON player_skill_assessments(overall_grade, potential_rating DESC);

-- =============================================================================
-- STEP 2 COMPLETION STATUS
-- =============================================================================

-- Migration 007 Step 2: Player Progress Tracking
-- ✅ player_progress_tracking table created
-- ✅ player_skill_assessments table created
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created

-- Ready for Step 3: Achievement System
