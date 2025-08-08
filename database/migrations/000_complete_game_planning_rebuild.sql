-- =============================================================================
-- GAME PLANNING SYSTEM - COMPLETE REBUILD WITH CASCADE
-- Phase 2: Core Football Features  
-- Created: August 7, 2025
-- This will DROP game_plans and ALL dependent objects, then recreate everything
-- =============================================================================

-- ⚠️  WARNING: This will delete ALL game plan related data and dependent objects!

DO $$
BEGIN
  RAISE NOTICE '🚨 STARTING COMPLETE REBUILD OF GAME_PLANS SYSTEM 🚨';
  RAISE NOTICE 'This will drop game_plans table and ALL dependent objects!';
END;
$$;

-- First, let's see what depends on game_plans
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE 'Objects that depend on game_plans table:';
  
  FOR rec IN 
    SELECT DISTINCT 
      conname as constraint_name,
      conrelid::regclass as table_name
    FROM pg_constraint 
    WHERE confrelid = 'game_plans'::regclass
  LOOP
    RAISE NOTICE '  - Constraint: % on table: %', rec.constraint_name, rec.table_name;
  END LOOP;
  
  -- Also check for any existing game_plan_* tables
  FOR rec IN
    SELECT tablename 
    FROM pg_tables 
    WHERE tablename LIKE 'game_plan%' 
      AND schemaname = 'public'
  LOOP
    RAISE NOTICE '  - Related table: %', rec.tablename;
  END LOOP;
END;
$$;

-- Drop game_plans table with CASCADE (this will drop all dependent objects)
DROP TABLE IF EXISTS game_plans CASCADE;

-- Drop any existing game planning tables from previous migration attempts
DROP TABLE IF EXISTS game_plan_situations CASCADE;
DROP TABLE IF EXISTS game_plan_plays CASCADE;
DROP TABLE IF EXISTS coach_cards CASCADE;
DROP TABLE IF EXISTS game_plan_templates CASCADE;
DROP TABLE IF EXISTS game_plan_analytics CASCADE;

-- Drop any existing trigger functions
DROP FUNCTION IF EXISTS update_game_plan_counts() CASCADE;
DROP FUNCTION IF EXISTS update_play_counts() CASCADE;

DO $$
BEGIN
  RAISE NOTICE '✓ Dropped all existing game planning objects';
  RAISE NOTICE '';
  RAISE NOTICE 'Now creating fresh game_plans table...';
END;
$$;

-- =============================================================================
-- CREATE FRESH GAME_PLANS TABLE WITH ALL COLUMNS
-- =============================================================================

CREATE TABLE game_plans (
  -- Core identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Game information
  week_number INTEGER,
  opponent TEXT,
  game_date DATE,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  
  -- Legacy play tracking
  total_plays INTEGER DEFAULT 0,
  
  -- Brian Billick methodology columns
  scouting_report JSONB DEFAULT '{}',
  weather_considerations JSONB DEFAULT '{}',
  key_matchups TEXT[],
  injury_considerations TEXT[],
  personnel_rotations JSONB DEFAULT '{}',
  coaching_points TEXT[],
  success_metrics JSONB DEFAULT '{}',
  preparation_status TEXT DEFAULT 'draft' 
    CHECK (preparation_status IN ('draft', 'in_progress', 'complete', 'game_ready')),
  total_situations INTEGER DEFAULT 0,
  total_plays_assigned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- =============================================================================
-- CREATE ALL GAME PLANNING TABLES
-- =============================================================================

-- Game Plan Situations (Brian Billick Categories)
CREATE TABLE game_plan_situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('down_distance', 'field_position', 'game_situation', 'special_teams')),
  description TEXT,
  success_criteria TEXT,
  preferred_personnel TEXT,
  down_distance_range TEXT,
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

-- Game Plan Plays
CREATE TABLE game_plan_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
  personnel_required TEXT,
  formation_strength TEXT CHECK (formation_strength IN ('strong_right', 'strong_left', 'weak_right', 'weak_left', 'balanced')),
  expected_coverage TEXT[],
  success_probability DECIMAL(3,2) DEFAULT 0.50 CHECK (success_probability BETWEEN 0.00 AND 1.00),
  risk_level INTEGER DEFAULT 3 CHECK (risk_level BETWEEN 1 AND 5),
  coaching_notes TEXT,
  sequence_order INTEGER NOT NULL,
  is_scripted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(situation_id, sequence_order),
  CONSTRAINT valid_success_rate CHECK (success_count <= execution_count)
);

-- Coach Cards
CREATE TABLE coach_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('situation', 'personnel', 'two_minute', 'red_zone', 'special_teams', 'adjustments')),
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL,
  print_order INTEGER,
  card_size TEXT DEFAULT 'standard' CHECK (card_size IN ('standard', 'large', 'pocket')),
  is_active BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(game_plan_id, print_order)
);

-- Game Plan Templates
CREATE TABLE game_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('base_offense', 'situational', 'opponent_specific', 'weather_specific')),
  description TEXT,
  situation_categories JSONB NOT NULL DEFAULT '[]',
  default_plays JSONB NOT NULL DEFAULT '{}',
  coaching_philosophy TEXT,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, template_name)
);

-- Game Plan Analytics
CREATE TABLE game_plan_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE SET NULL,
  play_id UUID REFERENCES plays(id) ON DELETE SET NULL,
  execution_time TIMESTAMPTZ NOT NULL,
  game_context JSONB NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'partial_success', 'failure', 'penalty', 'turnover')),
  yards_gained INTEGER,
  execution_quality INTEGER CHECK (execution_quality BETWEEN 1 AND 10),
  coaching_assessment TEXT,
  adjustments_made TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CREATE ALL INDEXES
-- =============================================================================

-- Game plans indexes
CREATE INDEX idx_game_plans_team_week ON game_plans(team_id, week_number DESC);
CREATE INDEX idx_game_plans_status_team ON game_plans(team_id, preparation_status);
CREATE INDEX idx_game_plans_active ON game_plans(is_active, team_id);

-- Other table indexes
CREATE INDEX idx_situations_game_plan ON game_plan_situations(game_plan_id, is_active);
CREATE INDEX idx_situations_category_type ON game_plan_situations(category_type, priority_level);
CREATE INDEX idx_game_plan_plays_situation ON game_plan_plays(situation_id, priority_level, sequence_order);
CREATE INDEX idx_game_plan_plays_play ON game_plan_plays(play_id, is_active);
CREATE INDEX idx_game_plan_plays_performance ON game_plan_plays(success_probability DESC, risk_level ASC);
CREATE INDEX idx_coach_cards_game_plan ON coach_cards(game_plan_id, print_order);
CREATE INDEX idx_templates_team_type ON game_plan_templates(team_id, template_type);
CREATE INDEX idx_templates_public ON game_plan_templates(is_public, usage_count DESC);
CREATE INDEX idx_analytics_game_plan_time ON game_plan_analytics(game_plan_id, execution_time);
CREATE INDEX idx_analytics_situation_outcome ON game_plan_analytics(situation_id, outcome);
CREATE INDEX idx_analytics_play_performance ON game_plan_analytics(play_id, outcome, execution_quality);

-- =============================================================================
-- CREATE TRIGGER FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update game plan situation counts
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

-- Function to update play counts
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

-- Create triggers
CREATE TRIGGER trigger_game_plan_situation_count
  AFTER INSERT OR UPDATE OR DELETE ON game_plan_situations
  FOR EACH ROW
  EXECUTE FUNCTION update_game_plan_counts();

CREATE TRIGGER trigger_game_plan_play_count
  AFTER INSERT OR UPDATE OR DELETE ON game_plan_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_play_counts();

-- Recreate updated_at trigger if the function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER trigger_game_plans_updated_at 
      BEFORE UPDATE ON game_plans 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE '✓ Recreated updated_at trigger';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠ Could not create updated_at trigger: %', SQLERRM;
END;
$$;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "team_members_game_plans" ON game_plans
  FOR ALL TO authenticated
  USING (team_id IN (SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()));

CREATE POLICY "team_members_game_plan_situations" ON game_plan_situations
  FOR ALL TO authenticated
  USING (game_plan_id IN (
    SELECT gp.id FROM game_plans gp
    JOIN teams t ON t.id = gp.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  ));

CREATE POLICY "team_members_game_plan_plays" ON game_plan_plays
  FOR ALL TO authenticated
  USING (game_plan_id IN (
    SELECT gp.id FROM game_plans gp
    JOIN teams t ON t.id = gp.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  ));

CREATE POLICY "team_members_coach_cards" ON coach_cards
  FOR ALL TO authenticated
  USING (game_plan_id IN (
    SELECT gp.id FROM game_plans gp
    JOIN teams t ON t.id = gp.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  ));

CREATE POLICY "team_members_templates" ON game_plan_templates
  FOR ALL TO authenticated
  USING (team_id IN (SELECT tm.team_id FROM team_members tm WHERE tm.user_id = auth.uid()) OR is_public = true);

CREATE POLICY "team_members_analytics" ON game_plan_analytics
  FOR ALL TO authenticated
  USING (game_plan_id IN (
    SELECT gp.id FROM game_plans gp
    JOIN teams t ON t.id = gp.team_id
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = auth.uid()
  ));

-- =============================================================================
-- FINAL VERIFICATION AND COMPLETION
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 COMPLETE GAME PLANNING SYSTEM REBUILD SUCCESSFUL! 🎉';
  RAISE NOTICE '=========================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✓ game_plans (with all Brian Billick columns)';
  RAISE NOTICE '  ✓ game_plan_situations';
  RAISE NOTICE '  ✓ game_plan_plays';
  RAISE NOTICE '  ✓ coach_cards';
  RAISE NOTICE '  ✓ game_plan_templates';
  RAISE NOTICE '  ✓ game_plan_analytics';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ All Brian Billick methodology columns';
  RAISE NOTICE '  ✓ Automatic count triggers';
  RAISE NOTICE '  ✓ Row Level Security policies';
  RAISE NOTICE '  ✓ Performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Database is ready for Phase 2 game planning! 🏈';
  RAISE NOTICE '=========================================================';
END;
$$;

-- Add table comments
COMMENT ON TABLE game_plans IS 'Game plans with full Brian Billick methodology support';
COMMENT ON TABLE game_plan_situations IS 'Brian Billick methodology: Situational categories for game planning';
COMMENT ON TABLE game_plan_plays IS 'Play assignments within situations with priority, risk analysis, and execution tracking';
COMMENT ON TABLE coach_cards IS 'Printable sideline reference cards for coaches';
COMMENT ON TABLE game_plan_templates IS 'Reusable game plan patterns and coaching philosophies';
COMMENT ON TABLE game_plan_analytics IS 'Real-time execution tracking and performance analysis';
