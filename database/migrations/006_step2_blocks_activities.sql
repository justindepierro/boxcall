-- =============================================================================
-- MIGRATION 006 STEP 2: PRACTICE BLOCKS AND ACTIVITIES
-- Detailed practice organization and activity tracking
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

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
  UNIQUE(schedule_id, sequence_order)
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
  UNIQUE(block_id, sequence_order)
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - BLOCKS AND ACTIVITIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE practice_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_activities ENABLE ROW LEVEL SECURITY;

-- Practice Blocks - Team members only
CREATE POLICY "practice_blocks_team_access" ON practice_blocks
  FOR ALL TO authenticated
  USING (
    schedule_id IN (
      SELECT ps.id FROM practice_schedules ps
      JOIN teams t ON t.id = ps.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
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
      WHERE tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- BASIC INDEXES FOR BLOCKS AND ACTIVITIES
-- =============================================================================

-- Basic indexes for practice_blocks
CREATE INDEX IF NOT EXISTS idx_practice_blocks_schedule_sequence 
  ON practice_blocks(schedule_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_practice_blocks_type 
  ON practice_blocks(block_type, is_template);

-- Basic indexes for practice_activities  
CREATE INDEX IF NOT EXISTS idx_practice_activities_block_sequence 
  ON practice_activities(block_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_practice_activities_type 
  ON practice_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_practice_activities_play 
  ON practice_activities(play_id) WHERE play_id IS NOT NULL;

-- =============================================================================
-- STEP 2 COMPLETION STATUS
-- =============================================================================

-- Migration 006 Step 2: Practice Blocks and Activities
-- ✅ practice_blocks table created
-- ✅ practice_activities table created
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created

-- Ready for Step 3: Practice Duration Triggers
