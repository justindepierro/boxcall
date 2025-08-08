-- =============================================================================
-- GAME PLANNING SYSTEM MIGRATION (Brian Billick Methodology) - VERSION 3
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- Extra safe version with explicit column checks
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENHANCE EXISTING GAME PLANS TABLE FIRST
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Starting Game Planning System Migration v3...';
  RAISE NOTICE 'Step 1: Adding columns to game_plans table...';
END;
$$;

-- Add all columns to game_plans table FIRST, before any functions or triggers
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS scouting_report JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS weather_considerations JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS key_matchups TEXT[];
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS injury_considerations TEXT[];
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS personnel_rotations JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS coaching_points TEXT[];
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS success_metrics JSONB DEFAULT '{}';
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS preparation_status TEXT DEFAULT 'draft' 
  CHECK (preparation_status IN ('draft', 'in_progress', 'complete', 'game_ready'));
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS total_situations INTEGER DEFAULT 0;
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS total_plays_assigned INTEGER DEFAULT 0;
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Verify the columns were added
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns 
  WHERE table_name = 'game_plans' 
    AND column_name IN ('is_active', 'total_situations', 'total_plays_assigned');
  
  RAISE NOTICE 'Added % new columns to game_plans table', col_count;
  
  IF col_count < 3 THEN
    RAISE WARNING 'Some columns may not have been added to game_plans table';
  END IF;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_plans_status_team 
  ON game_plans(team_id, preparation_status);

-- =============================================================================
-- CREATE ALL TABLES NEXT
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Step 2: Creating game planning tables...';
END;
$$;

-- GAME PLAN SITUATIONS (Brian Billick Categories)
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

-- GAME PLAN PLAYS (Enhanced with Billick methodology)
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

-- COACH CARDS (Sideline Reference System)
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

-- GAME PLAN TEMPLATES (Reusable Patterns)
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

-- GAME PLAN ANALYTICS (Performance Tracking)
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

-- Create all indexes
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
-- SIMPLE TRIGGER FUNCTIONS (No dynamic column checking needed)
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Step 3: Creating trigger functions...';
END;
$$;

-- Simple function for situation counts - columns are guaranteed to exist now
CREATE OR REPLACE FUNCTION update_game_plan_counts()
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

-- Simple function for play counts - columns are guaranteed to exist now
CREATE OR REPLACE FUNCTION update_play_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update situation play count
    UPDATE game_plan_situations 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays 
      WHERE situation_id = NEW.situation_id AND is_active = true
    )
    WHERE id = NEW.situation_id;
    
    -- Update game plan total
    UPDATE game_plans 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays gpp
      JOIN game_plan_situations gps ON gps.id = gpp.situation_id
      WHERE gps.game_plan_id = NEW.game_plan_id AND gpp.is_active = true
    )
    WHERE id = NEW.game_plan_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update situation play count
    UPDATE game_plan_situations 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays 
      WHERE situation_id = OLD.situation_id AND is_active = true
    )
    WHERE id = OLD.situation_id;
    
    -- Update game plan total
    UPDATE game_plans 
    SET total_plays_assigned = (
      SELECT COUNT(*) FROM game_plan_plays gpp
      JOIN game_plan_situations gps ON gps.id = gpp.situation_id
      WHERE gps.game_plan_id = OLD.game_plan_id AND gpp.is_active = true
    )
    WHERE id = OLD.game_plan_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- CREATE TRIGGERS LAST
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Step 4: Creating triggers...';
  
  -- Drop any existing triggers first
  DROP TRIGGER IF EXISTS trigger_game_plan_situation_count ON game_plan_situations;
  DROP TRIGGER IF EXISTS trigger_game_plan_play_count ON game_plan_plays;
  
  -- Create situation count trigger
  CREATE TRIGGER trigger_game_plan_situation_count
    AFTER INSERT OR UPDATE OR DELETE ON game_plan_situations
    FOR EACH ROW
    EXECUTE FUNCTION update_game_plan_counts();
    
  -- Create play count trigger
  CREATE TRIGGER trigger_game_plan_play_count
    AFTER INSERT OR UPDATE OR DELETE ON game_plan_plays
    FOR EACH ROW
    EXECUTE FUNCTION update_play_counts();
    
  RAISE NOTICE 'Triggers created successfully!';
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Step 5: Setting up Row Level Security...';
END;
$$;

-- Enable RLS on all new tables
ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_analytics ENABLE ROW LEVEL SECURITY;

-- Game Plan Situations - Team members only
DROP POLICY IF EXISTS "team_members_game_plan_situations" ON game_plan_situations;
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
DROP POLICY IF EXISTS "team_members_game_plan_plays" ON game_plan_plays;
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
DROP POLICY IF EXISTS "team_members_coach_cards" ON coach_cards;
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
DROP POLICY IF EXISTS "team_members_templates" ON game_plan_templates;
CREATE POLICY "team_members_templates" ON game_plan_templates
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()
    ) OR is_public = true
  );

-- Analytics - Team members only
DROP POLICY IF EXISTS "team_members_analytics" ON game_plan_analytics;
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
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Game Planning System Migration v3 COMPLETE';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Tables created successfully:';
  RAISE NOTICE '  ✓ Enhanced game_plans table';
  RAISE NOTICE '  ✓ game_plan_situations';
  RAISE NOTICE '  ✓ game_plan_plays';
  RAISE NOTICE '  ✓ coach_cards';
  RAISE NOTICE '  ✓ game_plan_templates';
  RAISE NOTICE '  ✓ game_plan_analytics';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ Brian Billick methodology columns';
  RAISE NOTICE '  ✓ Automatic count triggers';
  RAISE NOTICE '  ✓ Row Level Security policies';
  RAISE NOTICE '  ✓ Performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for Phase 2 game planning! 🏈';
  RAISE NOTICE '===========================================';
END;
$$;

-- Table comments for documentation
COMMENT ON TABLE game_plan_situations IS 'Brian Billick methodology: Situational categories for game planning (1st & 10, Red Zone, etc.)';
COMMENT ON TABLE game_plan_plays IS 'Play assignments within situations with priority, risk analysis, and execution tracking';
COMMENT ON TABLE coach_cards IS 'Printable sideline reference cards for coaches with game plan information';
COMMENT ON TABLE game_plan_templates IS 'Reusable game plan patterns and coaching philosophies';
COMMENT ON TABLE game_plan_analytics IS 'Real-time execution tracking and performance analysis for continuous improvement';
