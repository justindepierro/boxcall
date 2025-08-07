-- =============================================================================
-- GAME PLANNING SYSTEM MIGRATION (Brian Billick Methodology)
-- Phase 2: Core Football Features
-- Created: August 7, 2025
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENHANCE EXISTING GAME PLANS TABLE
-- =============================================================================

-- Add Brian Billick methodology columns to existing game_plans table
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS
  scouting_report JSONB DEFAULT '{}',
  weather_considerations JSONB DEFAULT '{}',
  key_matchups TEXT[],
  injury_considerations TEXT[],
  personnel_rotations JSONB DEFAULT '{}',
  coaching_points TEXT[],
  success_metrics JSONB DEFAULT '{}',
  preparation_status TEXT DEFAULT 'draft' CHECK (preparation_status IN ('draft', 'in_progress', 'complete', 'game_ready')),
  total_situations INTEGER DEFAULT 0,
  total_plays_assigned INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_plans_status_team 
  ON game_plans(team_id, preparation_status);

-- =============================================================================
-- GAME PLAN SITUATIONS (Brian Billick Categories)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(game_plan_id, sequence_order)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_situations_game_plan 
  ON game_plan_situations(game_plan_id, is_active);
CREATE INDEX IF NOT EXISTS idx_situations_category_type 
  ON game_plan_situations(category_type, priority_level);

-- =============================================================================
-- GAME PLAN PLAYS (Enhanced with Billick methodology)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(situation_id, sequence_order),
  CONSTRAINT valid_success_rate CHECK (success_count <= execution_count)
);

-- Indexes for performance and querying
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_situation 
  ON game_plan_plays(situation_id, priority_level, sequence_order);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_play 
  ON game_plan_plays(play_id, is_active);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_performance 
  ON game_plan_plays(success_probability DESC, risk_level ASC);

-- =============================================================================
-- COACH CARDS (Sideline Reference System)
-- =============================================================================

CREATE TABLE IF NOT EXISTS coach_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('situation', 'personnel', 'two_minute', 'red_zone', 'special_teams', 'adjustments')),
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL, -- Card layout data and play information
  print_order INTEGER,
  card_size TEXT DEFAULT 'standard' CHECK (card_size IN ('standard', 'large', 'pocket')),
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(game_plan_id, print_order)
);

-- Index for coach card retrieval
CREATE INDEX IF NOT EXISTS idx_coach_cards_game_plan 
  ON coach_cards(game_plan_id, print_order);

-- =============================================================================
-- GAME PLAN TEMPLATES (Reusable Patterns)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('base_offense', 'situational', 'opponent_specific', 'weather_specific')),
  description TEXT,
  situation_categories JSONB NOT NULL DEFAULT '[]', -- Template situations to create
  default_plays JSONB NOT NULL DEFAULT '{}', -- Default play assignments
  coaching_philosophy TEXT,
  is_public BOOLEAN DEFAULT false, -- Can other teams use this template
  usage_count INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, template_name)
);

-- Index for template searching
CREATE INDEX IF NOT EXISTS idx_templates_team_type 
  ON game_plan_templates(team_id, template_type);
CREATE INDEX IF NOT EXISTS idx_templates_public 
  ON game_plan_templates(is_public, usage_count DESC);

-- =============================================================================
-- GAME PLAN ANALYTICS (Performance Tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_plan_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_game_plan_time 
  ON game_plan_analytics(game_plan_id, execution_time);
CREATE INDEX IF NOT EXISTS idx_analytics_situation_outcome 
  ON game_plan_analytics(situation_id, outcome);
CREATE INDEX IF NOT EXISTS idx_analytics_play_performance 
  ON game_plan_analytics(play_id, outcome, execution_quality);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_analytics ENABLE ROW LEVEL SECURITY;

-- Game Plan Situations - Team members only
CREATE POLICY "team_members_game_plan_situations" ON game_plan_situations
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Game Plan Plays - Team members only
CREATE POLICY "team_members_game_plan_plays" ON game_plan_plays
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Coach Cards - Team members only
CREATE POLICY "team_members_coach_cards" ON coach_cards
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Templates - Team members + public templates
CREATE POLICY "team_members_templates" ON game_plan_templates
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR is_public = true
  );

-- Analytics - Team members only
CREATE POLICY "team_members_analytics" ON game_plan_analytics
  FOR ALL TO authenticated
  USING (
    game_plan_id IN (
      SELECT gp.id FROM game_plans gp
      JOIN teams t ON t.id = gp.team_id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- =============================================================================

-- Update game_plans total counts when situations change
CREATE OR REPLACE FUNCTION update_game_plan_situation_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE game_plans 
    SET total_situations = (
      SELECT COUNT(*) FROM game_plan_situations 
      WHERE game_plan_id = NEW.game_plan_id AND is_active = true
    )
    WHERE id = NEW.game_plan_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE game_plans 
    SET total_situations = (
      SELECT COUNT(*) FROM game_plan_situations 
      WHERE game_plan_id = OLD.game_plan_id AND is_active = true
    )
    WHERE id = OLD.game_plan_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_situation_count
  AFTER INSERT OR UPDATE OR DELETE ON game_plan_situations
  FOR EACH ROW
  EXECUTE FUNCTION update_game_plan_situation_count();

-- Update situation play counts when plays change
CREATE OR REPLACE FUNCTION update_situation_play_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE game_plan_situations 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays 
      WHERE situation_id = NEW.situation_id AND is_active = true
    )
    WHERE id = NEW.situation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE game_plan_situations 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays 
      WHERE situation_id = OLD.situation_id AND is_active = true
    )
    WHERE id = OLD.situation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_play_count
  AFTER INSERT OR UPDATE OR DELETE ON game_plan_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_situation_play_count();

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert default Brian Billick situation categories (will be used by service)
-- This will be handled by the GamePlanService.createBillickSituations() method

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

COMMENT ON TABLE game_plan_situations IS 'Brian Billick methodology: Situational categories for game planning';
COMMENT ON TABLE game_plan_plays IS 'Play assignments within situations with priority and analytics';
COMMENT ON TABLE coach_cards IS 'Printable sideline reference cards for coaches';
COMMENT ON TABLE game_plan_templates IS 'Reusable game plan patterns and philosophies';
COMMENT ON TABLE game_plan_analytics IS 'Real-time execution tracking and performance analysis';
