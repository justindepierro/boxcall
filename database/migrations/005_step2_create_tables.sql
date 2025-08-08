-- =============================================================================
-- GAME PLANNING SYSTEM - STEP 2: CREATE GAME PLAN TABLES
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- Prerequisites: Step 1 must be completed first
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'STEP 2: Creating game planning tables...';
  
  -- Verify game_plans table has required columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'game_plans' AND column_name = 'is_active'
  ) THEN
    RAISE EXCEPTION 'Step 1 must be completed first - game_plans table missing is_active column';
  END IF;
  
  RAISE NOTICE 'Prerequisites verified - proceeding with table creation...';
END;
$$;

-- =============================================================================
-- GAME PLAN SITUATIONS (Brian Billick Categories)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL, -- '1st & 10', '3rd & Short', 'Red Zone'
  category_type TEXT NOT NULL CHECK (category_type IN ('down_distance', 'field_position', 'game_situation', 'special_teams')),
  description TEXT,
  success_criteria TEXT,
  preferred_personnel TEXT, -- '11', '12', '21', etc.
  down_distance_range TEXT, -- '3rd-1-3', '1st-10+', '2nd-4-7'
  field_position TEXT CHECK (field_position IN ('red_zone', 'goal_line', 'plus_territory', 'midfield', 'backed_up', 'any')),
  game_situation TEXT CHECK (game_situation IN ('two_minute', 'clock_management', 'fourth_down', 'short_yardage', 'normal', 'hurry_up')),
  priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
  sequence_order INTEGER NOT NULL,
  total_plays_assigned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(game_plan_id, sequence_order)
);

-- =============================================================================
-- GAME PLAN PLAYS (Enhanced with Billick methodology)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
  personnel_required TEXT, -- '11', '12', '21', '22', etc.
  formation_strength TEXT CHECK (formation_strength IN ('strong_right', 'strong_left', 'weak_right', 'weak_left', 'balanced')),
  expected_coverage TEXT[], -- ['cover_2', 'man_coverage', 'zone_blitz']
  success_probability DECIMAL(3,2) DEFAULT 0.50 CHECK (success_probability BETWEEN 0.00 AND 1.00),
  risk_level INTEGER DEFAULT 3 CHECK (risk_level BETWEEN 1 AND 5),
  coaching_notes TEXT,
  sequence_order INTEGER NOT NULL,
  is_scripted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0, -- Track how often this play is called
  success_count INTEGER DEFAULT 0, -- Track successful executions
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(situation_id, sequence_order),
  CONSTRAINT valid_success_rate CHECK (success_count <= execution_count)
);

-- =============================================================================
-- COACH CARDS (Sideline Reference System)
-- =============================================================================

CREATE TABLE IF NOT EXISTS coach_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('situation', 'personnel', 'two_minute', 'red_zone', 'special_teams', 'adjustments')),
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL, -- Card layout data and play information
  print_order INTEGER,
  card_size TEXT DEFAULT 'standard' CHECK (card_size IN ('standard', 'large', 'pocket')),
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(game_plan_id, print_order)
);

-- =============================================================================
-- GAME PLAN TEMPLATES (Reusable Patterns)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('base_offense', 'situational', 'opponent_specific', 'weather_specific')),
  description TEXT,
  situation_categories JSONB NOT NULL DEFAULT '[]', -- Template situations to create
  default_plays JSONB NOT NULL DEFAULT '{}', -- Default play assignments
  coaching_philosophy TEXT,
  is_public BOOLEAN DEFAULT false, -- Can other teams use this template
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, template_name)
);

-- =============================================================================
-- GAME PLAN ANALYTICS (Performance Tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE SET NULL,
  play_id UUID REFERENCES plays(id) ON DELETE SET NULL,
  execution_time TIMESTAMPTZ NOT NULL,
  game_context JSONB NOT NULL, -- Down, distance, field position, score, time
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'partial_success', 'failure', 'penalty', 'turnover')),
  yards_gained INTEGER,
  execution_quality INTEGER CHECK (execution_quality BETWEEN 1 AND 10),
  coaching_assessment TEXT,
  adjustments_made TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_situations_game_plan ON game_plan_situations(game_plan_id, is_active);
CREATE INDEX IF NOT EXISTS idx_situations_category_type ON game_plan_situations(category_type, priority_level);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_situation ON game_plan_plays(situation_id, priority_level, sequence_order);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_play ON game_plan_plays(play_id, is_active);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_performance ON game_plan_plays(success_probability DESC, risk_level ASC);
CREATE INDEX IF NOT EXISTS idx_coach_cards_game_plan ON coach_cards(game_plan_id, print_order);
CREATE INDEX IF NOT EXISTS idx_templates_team_type ON game_plan_templates(team_id, template_type);
CREATE INDEX IF NOT EXISTS idx_templates_public ON game_plan_templates(is_public, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_game_plan_time ON game_plan_analytics(game_plan_id, execution_time);
CREATE INDEX IF NOT EXISTS idx_analytics_situation_outcome ON game_plan_analytics(situation_id, outcome);
CREATE INDEX IF NOT EXISTS idx_analytics_play_performance ON game_plan_analytics(play_id, outcome, execution_quality);

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ STEP 2 COMPLETE: All game planning tables created successfully';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - game_plan_situations';
  RAISE NOTICE '  - game_plan_plays';
  RAISE NOTICE '  - coach_cards';
  RAISE NOTICE '  - game_plan_templates';
  RAISE NOTICE '  - game_plan_analytics';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run Step 3 to create trigger functions and triggers';
END;
$$;
