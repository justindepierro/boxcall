-- =============================================================================
-- MIGRATION 006: PRACTICE PLANNING SYSTEM - DATABASE IMPLEMENTATION
-- Advanced Practice Architecture with 8-Box Layout Support
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PRACTICE BLOCKS - Timeline Segments for Practice Organization
-- =============================================================================

CREATE TABLE practice_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  
  -- Block Identification
  name TEXT NOT NULL, -- 'Warm-up', 'Individual Skills', '7-on-7', 'Team Periods'
  block_type TEXT NOT NULL CHECK (block_type IN (
    'warmup', 'individual', 'group', 'team', 'special_teams', 
    'conditioning', 'cool_down', 'meeting', 'film_study'
  )),
  
  -- Timing and Sequence
  sequence_order INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  start_offset_minutes INTEGER DEFAULT 0, -- Minutes from practice start
  
  -- Organization and Focus
  focus_area TEXT, -- 'passing', 'running', 'defense', 'special_teams', 'conditioning'
  intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 10) DEFAULT 5,
  
  -- Resources Required
  equipment_needed TEXT[] DEFAULT '{}',
  field_areas TEXT[] DEFAULT '{}', -- 'end_zone', 'hash_marks', 'sideline'
  personnel_groupings TEXT[] DEFAULT '{}', -- '11', '12', '21', 'special'
  
  -- Coaching Information
  coaching_points TEXT[] DEFAULT '{}',
  safety_considerations TEXT[] DEFAULT '{}',
  success_criteria TEXT,
  
  -- Metadata
  is_template BOOLEAN DEFAULT false,
  template_category TEXT, -- For reusable block templates
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(schedule_id, sequence_order),
  
  -- Indexes for performance
  INDEX idx_practice_blocks_schedule_sequence (schedule_id, sequence_order),
  INDEX idx_practice_blocks_type (block_type, is_template)
);

-- =============================================================================
-- PRACTICE ACTIVITIES - Detailed Breakdown of Block Contents
-- =============================================================================

CREATE TABLE practice_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID REFERENCES practice_blocks(id) ON DELETE CASCADE,
  
  -- Activity Identification
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'drill', 'play_run', 'conditioning', 'walkthrough', 'scrimmage',
    'meeting', 'individual_instruction', 'group_work', 'competition'
  )),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Timing and Execution
  sequence_order INTEGER NOT NULL,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  repetitions INTEGER DEFAULT 1 CHECK (repetitions > 0),
  rest_between_reps_seconds INTEGER DEFAULT 0,
  
  -- Play Integration
  play_id UUID REFERENCES plays(id), -- Optional: specific play being practiced
  play_variations TEXT[] DEFAULT '{}', -- Variations of the play
  
  -- Coaching and Performance
  coaching_emphasis TEXT[] DEFAULT '{}',
  technique_focus TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  success_criteria TEXT,
  measurement_method TEXT, -- 'completion_rate', 'time', 'accuracy', 'form'
  target_performance TEXT, -- '80% completion', 'under 5 seconds', etc.
  
  -- Organization
  personnel_requirements TEXT, -- '11 offense vs 11 defense'
  formation_requirements TEXT,
  field_setup TEXT,
  equipment_specific TEXT[] DEFAULT '{}',
  
  -- Competition and Motivation
  is_competitive BOOLEAN DEFAULT false,
  scoring_method TEXT, -- 'points', 'winner_take_all', 'bracket'
  winner_reward TEXT,
  loser_consequence TEXT,
  
  -- Metadata
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10) DEFAULT 5,
  injury_risk_level INTEGER CHECK (injury_risk_level BETWEEN 1 AND 5) DEFAULT 2,
  weather_suitability TEXT[] DEFAULT '{"any"}', -- 'sunny', 'rainy', 'hot', 'cold'
  
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(block_id, sequence_order),
  
  -- Indexes
  INDEX idx_practice_activities_block_sequence (block_id, sequence_order),
  INDEX idx_practice_activities_type (activity_type),
  INDEX idx_practice_activities_play (play_id) WHERE play_id IS NOT NULL
);

-- =============================================================================
-- PRACTICE TEMPLATES - Reusable Practice Structures
-- =============================================================================

CREATE TABLE practice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Template Identification
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'preseason', 'regular_season', 'playoffs', 'off_season',
    'game_prep', 'fundamentals', 'conditioning', 'walkthrough'
  )),
  
  -- Template Configuration
  total_duration_minutes INTEGER NOT NULL CHECK (total_duration_minutes > 0),
  recommended_participants INTEGER,
  equipment_list TEXT[] DEFAULT '{}',
  field_requirements TEXT[] DEFAULT '{}',
  
  -- Usage and Performance
  usage_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  last_used_date DATE,
  
  -- Template Metadata
  is_public BOOLEAN DEFAULT false, -- Can other teams use this template?
  created_by TEXT NOT NULL,
  shared_by_coach TEXT, -- Original creator if shared
  coaching_level TEXT[] DEFAULT '{}', -- 'youth', 'high_school', 'college', 'pro'
  
  -- Seasonal Information
  best_season TEXT[] DEFAULT '{}', -- 'preseason', 'early_season', 'mid_season', 'playoffs'
  weather_suitability TEXT[] DEFAULT '{"any"}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_practice_templates_team_category (team_id, category),
  INDEX idx_practice_templates_public (is_public, category) WHERE is_public = true
);

-- =============================================================================
-- PRACTICE EXECUTION TRACKING - Real Performance Data
-- =============================================================================

CREATE TABLE practice_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES practice_activities(id),
  
  -- Execution Context
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actual_duration_minutes INTEGER,
  participants_present INTEGER,
  weather_conditions TEXT,
  field_conditions TEXT,
  
  -- Performance Metrics
  execution_quality INTEGER CHECK (execution_quality BETWEEN 1 AND 10),
  completion_rate DECIMAL(5,2), -- Percentage (0.00 to 100.00)
  success_count INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  
  -- Coaching Observations
  what_went_well TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  coaching_adjustments_made TEXT[] DEFAULT '{}',
  player_standouts TEXT[] DEFAULT '{}', -- User IDs or names
  
  -- Metrics and Analytics
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  focus_level INTEGER CHECK (focus_level BETWEEN 1 AND 10),
  injury_incidents INTEGER DEFAULT 0,
  equipment_issues TEXT[] DEFAULT '{}',
  
  -- Follow-up Actions
  needs_repeat BOOLEAN DEFAULT false,
  repeat_reason TEXT,
  next_practice_notes TEXT,
  
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_practice_executions_practice_date (practice_id, executed_at),
  INDEX idx_practice_executions_activity (activity_id),
  INDEX idx_practice_executions_quality (execution_quality, completion_rate)
);

-- =============================================================================
-- 8-BOX LAYOUT SYSTEM - Visual Practice Organization
-- =============================================================================

CREATE TABLE practice_layout_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  
  -- Box Position in 2x4 Grid
  box_number INTEGER NOT NULL CHECK (box_number BETWEEN 1 AND 8),
  grid_row INTEGER NOT NULL CHECK (grid_row IN (1, 2)),
  grid_column INTEGER NOT NULL CHECK (grid_column BETWEEN 1 AND 4),
  
  -- Box Content
  title TEXT NOT NULL,
  subtitle TEXT,
  primary_color TEXT DEFAULT '#3B82F6', -- Blue
  accent_color TEXT DEFAULT '#1E40AF', -- Dark blue
  icon_name TEXT, -- For UI icons
  
  -- Time Allocation
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  start_time TIME, -- Actual time (e.g., 3:30 PM)
  end_time TIME,
  
  -- Content References
  block_ids UUID[] DEFAULT '{}', -- References to practice_blocks
  activity_count INTEGER DEFAULT 0,
  key_activities TEXT[] DEFAULT '{}', -- Summary of main activities
  
  -- Visual Customization
  layout_style TEXT DEFAULT 'standard' CHECK (layout_style IN (
    'standard', 'compact', 'detailed', 'time_focused'
  )),
  show_time BOOLEAN DEFAULT true,
  show_equipment BOOLEAN DEFAULT true,
  show_personnel BOOLEAN DEFAULT false,
  
  -- Print and Export Settings
  print_priority INTEGER DEFAULT 1 CHECK (print_priority BETWEEN 1 AND 3),
  include_in_coach_card BOOLEAN DEFAULT true,
  include_in_player_card BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(schedule_id, box_number),
  UNIQUE(schedule_id, grid_row, grid_column),
  
  -- Indexes
  INDEX idx_practice_layout_boxes_schedule (schedule_id, box_number),
  INDEX idx_practice_layout_boxes_grid (grid_row, grid_column)
);

-- =============================================================================
-- PRACTICE ANALYTICS AND INSIGHTS
-- =============================================================================

CREATE TABLE practice_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practice_schedules(id),
  
  -- Aggregated Performance Data
  total_practices INTEGER DEFAULT 0,
  avg_practice_duration INTEGER, -- Minutes
  avg_execution_quality DECIMAL(3,2),
  avg_completion_rate DECIMAL(5,2),
  
  -- Time Distribution Analysis
  warmup_time_pct DECIMAL(5,2),
  individual_time_pct DECIMAL(5,2),
  group_time_pct DECIMAL(5,2),
  team_time_pct DECIMAL(5,2),
  conditioning_time_pct DECIMAL(5,2),
  
  -- Effectiveness Metrics
  most_effective_activities TEXT[] DEFAULT '{}',
  least_effective_activities TEXT[] DEFAULT '{}',
  optimal_practice_duration INTEGER, -- Recommended duration
  fatigue_point_minutes INTEGER, -- When performance drops
  
  -- Trend Analysis
  improvement_areas TEXT[] DEFAULT '{}',
  performance_trends JSONB DEFAULT '{}',
  seasonal_patterns JSONB DEFAULT '{}',
  
  -- Period Analysis
  analysis_period TEXT NOT NULL, -- 'weekly', 'monthly', 'season'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_practice_analytics_team_period (team_id, analysis_period, period_start),
  INDEX idx_practice_analytics_practice (practice_id) WHERE practice_id IS NOT NULL
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE practice_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_layout_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_analytics ENABLE ROW LEVEL SECURITY;

-- Practice Blocks - Team members only
CREATE POLICY "practice_blocks_team_access" ON practice_blocks
  FOR ALL TO authenticated
  USING (
    schedule_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

-- Practice Activities - Team members only
CREATE POLICY "practice_activities_team_access" ON practice_activities
  FOR ALL TO authenticated
  USING (
    block_id IN (
      SELECT pb.id FROM practice_blocks pb
      JOIN practice_schedules ps ON ps.id = pb.schedule_id
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

-- Practice Templates - Team access + public templates
CREATE POLICY "practice_templates_access" ON practice_templates
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
    OR is_public = true
  );

CREATE POLICY "practice_templates_modify" ON practice_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Practice Executions - Coaches can insert, all team members can read
CREATE POLICY "practice_executions_read" ON practice_executions
  FOR SELECT TO authenticated
  USING (
    practice_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

CREATE POLICY "practice_executions_coaches_write" ON practice_executions
  FOR INSERT TO authenticated
  WITH CHECK (
    practice_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Practice Layout Boxes - Team members access
CREATE POLICY "practice_layout_boxes_team_access" ON practice_layout_boxes
  FOR ALL TO authenticated
  USING (
    schedule_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

-- Practice Analytics - Team members read, system generates
CREATE POLICY "practice_analytics_team_read" ON practice_analytics
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid() AND tm.is_active = true
    )
  );

-- =============================================================================
-- TRIGGERS FOR AUTOMATED CALCULATIONS
-- =============================================================================

-- Update practice_schedules total_duration when blocks change
CREATE OR REPLACE FUNCTION update_practice_total_duration()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE practice_schedules 
  SET total_duration = (
    SELECT COALESCE(SUM(duration_minutes), 0)
    FROM practice_blocks 
    WHERE schedule_id = COALESCE(NEW.schedule_id, OLD.schedule_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.schedule_id, OLD.schedule_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_practice_duration
  AFTER INSERT OR UPDATE OR DELETE ON practice_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_total_duration();

-- Auto-calculate box times based on sequence
CREATE OR REPLACE FUNCTION calculate_box_times()
RETURNS TRIGGER AS $$
DECLARE
  practice_start TIME;
  cumulative_minutes INTEGER := 0;
  box_rec RECORD;
BEGIN
  -- Get practice start time
  SELECT start_time INTO practice_start
  FROM practice_schedules
  WHERE id = NEW.schedule_id;
  
  -- Calculate cumulative time for all previous boxes
  FOR box_rec IN 
    SELECT duration_minutes 
    FROM practice_layout_boxes 
    WHERE schedule_id = NEW.schedule_id 
    AND box_number < NEW.box_number 
    ORDER BY box_number
  LOOP
    cumulative_minutes := cumulative_minutes + box_rec.duration_minutes;
  END LOOP;
  
  -- Set start and end times
  NEW.start_time := practice_start + (cumulative_minutes || ' minutes')::INTERVAL;
  NEW.end_time := practice_start + ((cumulative_minutes + NEW.duration_minutes) || ' minutes')::INTERVAL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_box_times
  BEFORE INSERT OR UPDATE ON practice_layout_boxes
  FOR EACH ROW
  EXECUTE FUNCTION calculate_box_times();

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert default practice template categories
INSERT INTO practice_templates (
  id, team_id, name, description, category, total_duration_minutes,
  recommended_participants, is_public, created_by, coaching_level
) VALUES
  -- Public templates available to all teams
  (
    uuid_generate_v4(), 
    NULL, -- Public template
    'Standard Game Week Practice',
    'Comprehensive practice structure for regular season game preparation',
    'game_prep',
    120,
    40,
    true,
    'system',
    ARRAY['high_school', 'college']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Fundamentals Focus - Youth',
    'Basic skill development practice for youth football',
    'fundamentals',
    90,
    25,
    true,
    'system',
    ARRAY['youth']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Two-A-Day Morning Session',
    'High-intensity morning practice for preseason camps',
    'preseason',
    100,
    50,
    true,
    'system',
    ARRAY['high_school', 'college', 'pro']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Playoff Preparation',
    'Focused practice structure for playoff game preparation',
    'playoffs',
    110,
    45,
    true,
    'system',
    ARRAY['high_school', 'college', 'pro']
  ),
  (
    uuid_generate_v4(),
    NULL,
    'Walkthrough and Film',
    'Light practice with film study and mental preparation',
    'walkthrough',
    60,
    40,
    true,
    'system',
    ARRAY['high_school', 'college', 'pro']
  );

-- =============================================================================
-- PERFORMANCE INDEXES (CREATED CONCURRENTLY IN PRODUCTION)
-- =============================================================================

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_practice_blocks_schedule_time 
  ON practice_blocks(schedule_id, start_offset_minutes, duration_minutes);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_practice_activities_execution 
  ON practice_activities(activity_type, duration_minutes) 
  WHERE repetitions > 1;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_practice_executions_performance 
  ON practice_executions(execution_quality, completion_rate, executed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_practice_templates_search 
  ON practice_templates(category, coaching_level, is_public) 
  WHERE is_public = true;

-- =============================================================================
-- COMPLETION STATUS
-- =============================================================================

-- Migration 006: Practice Planning System Database Implementation
-- ✅ 6 new tables with comprehensive practice management
-- ✅ 8-box layout system support
-- ✅ Practice execution tracking and analytics
-- ✅ Row Level Security policies implemented  
-- ✅ Automated triggers for calculations
-- ✅ Performance indexes for scalability
-- ✅ Initial template data inserted

-- Ready for Phase 2 Practice Planning Service Implementation
