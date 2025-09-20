-- Migration: 021_assembly_line_workflow.sql
-- Date: September 20, 2025
-- Description: Add data structures for assembly line workflow tracking

-- =====================================================
-- ASSEMBLY LINE WORKFLOW TABLES
-- =====================================================

-- Play Usage Events table
-- Tracks when plays are used in practice or games for maturity calculation
CREATE TABLE play_usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('practice_script_added', 'game_plan_added', 'practice_executed', 'game_executed')),
  context_type TEXT NOT NULL CHECK (context_type IN ('practice_script', 'game_plan', 'live_execution')),
  context_id UUID NOT NULL, -- References practice_scripts.id or game_plans.id
  context_name TEXT, -- Cached name for performance
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()

  -- Removed generated event_date column due to immutability constraint
  -- Date extraction will be handled in queries/indexes as needed
);

-- Play Maturity Levels table
-- Calculated maturity levels for each play based on usage patterns
CREATE TABLE play_maturity_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  maturity_level TEXT NOT NULL CHECK (maturity_level IN ('new', 'practice_tested', 'game_ready', 'proven')),
  maturity_score INTEGER NOT NULL CHECK (maturity_score BETWEEN 0 AND 100),
  usage_count INTEGER DEFAULT 0,
  sections_used TEXT[] DEFAULT '{}', -- ['practice', 'game_plan', 'live']
  last_used_at TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  next_recalculation_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),

  UNIQUE(team_id, play_id)
);

-- Workflow Progress table
-- Tracks team progress through the assembly line workflow
CREATE TABLE workflow_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('playbook', 'practice', 'game_plan', 'boxcall')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  metrics JSONB DEFAULT '{}', -- Store section-specific metrics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, section)
);

-- Data Flow Analytics table
-- Aggregated analytics for data flow between sections
CREATE TABLE data_flow_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  total_plays INTEGER DEFAULT 0,
  plays_in_practice INTEGER DEFAULT 0,
  plays_in_game_plans INTEGER DEFAULT 0,
  average_maturity_score DECIMAL(5,2) DEFAULT 0.00,
  recent_activities_count INTEGER DEFAULT 0,
  workflow_completion_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, date_recorded)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Play usage events - optimized for common queries
CREATE INDEX idx_play_usage_events_team_play ON play_usage_events(team_id, play_id);
-- Removed date index due to immutability constraint - date queries can use created_at directly
CREATE INDEX idx_play_usage_events_context ON play_usage_events(context_type, context_id);

-- Play maturity levels - optimized for dashboard queries
CREATE INDEX idx_play_maturity_team_level ON play_maturity_levels(team_id, maturity_level);
CREATE INDEX idx_play_maturity_team_score ON play_maturity_levels(team_id, maturity_score DESC);
-- Removed recalc index due to immutability constraint - recalculation can be handled in application code

-- Workflow progress - optimized for real-time dashboard
CREATE INDEX idx_workflow_progress_team ON workflow_progress(team_id, section);
CREATE INDEX idx_workflow_progress_status ON workflow_progress(status, updated_at DESC);

-- Data flow analytics - optimized for historical queries
CREATE INDEX idx_data_flow_team_date ON data_flow_analytics(team_id, date_recorded DESC);

-- =====================================================
-- FUNCTIONS FOR MATURITY CALCULATION
-- =====================================================

-- Function to calculate play maturity level
CREATE OR REPLACE FUNCTION calculate_play_maturity(p_team_id UUID, p_play_id UUID)
RETURNS TABLE (
  maturity_level TEXT,
  maturity_score INTEGER,
  usage_count INTEGER,
  sections_used TEXT[]
) AS $$
DECLARE
  practice_count INTEGER := 0;
  game_plan_count INTEGER := 0;
  live_execution_count INTEGER := 0;
  total_usage INTEGER := 0;
  score INTEGER := 0;
  sections TEXT[] := '{}';
BEGIN
  -- Count usage in different contexts
  SELECT COUNT(*) INTO practice_count
  FROM play_usage_events
  WHERE team_id = p_team_id AND play_id = p_play_id
    AND event_type IN ('practice_script_added', 'practice_executed');

  SELECT COUNT(*) INTO game_plan_count
  FROM play_usage_events
  WHERE team_id = p_team_id AND play_id = p_play_id
    AND event_type IN ('game_plan_added', 'game_executed');

  SELECT COUNT(*) INTO live_execution_count
  FROM play_usage_events
  WHERE team_id = p_team_id AND play_id = p_play_id
    AND event_type = 'game_executed';

  total_usage := practice_count + game_plan_count + live_execution_count;

  -- Build sections used array
  IF practice_count > 0 THEN sections := sections || 'practice'; END IF;
  IF game_plan_count > 0 THEN sections := sections || 'game_plan'; END IF;
  IF live_execution_count > 0 THEN sections := sections || 'live'; END IF;

  -- Calculate maturity score (0-100)
  -- Base score from usage count
  score := LEAST(total_usage * 10, 40);

  -- Bonus for practice usage
  IF practice_count > 0 THEN score := score + 20; END IF;

  -- Bonus for game plan usage
  IF game_plan_count > 0 THEN score := score + 25; END IF;

  -- Bonus for live execution
  IF live_execution_count > 0 THEN score := score + 15; END IF;

  -- Cap at 100
  score := LEAST(score, 100);

  -- Determine maturity level
  RETURN QUERY
  SELECT
    CASE
      WHEN score < 20 THEN 'new'
      WHEN score < 60 THEN 'practice_tested'
      WHEN score < 90 THEN 'game_ready'
      ELSE 'proven'
    END::TEXT as maturity_level,
    score as maturity_score,
    total_usage as usage_count,
    sections as sections_used;
END;
$$ LANGUAGE plpgsql;

-- Function to update play maturity levels
CREATE OR REPLACE FUNCTION update_play_maturity_levels(p_team_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  play_record RECORD;
  maturity_data RECORD;
  updated_count INTEGER := 0;
BEGIN
  -- Loop through all plays for the team (or all teams if NULL)
  FOR play_record IN
    SELECT p.id, p.team_id
    FROM plays p
    JOIN playbooks pb ON p.playbook_id = pb.id
    WHERE (p_team_id IS NULL OR pb.team_id = p_team_id)
  LOOP
    -- Calculate maturity for this play
    SELECT * INTO maturity_data
    FROM calculate_play_maturity(play_record.team_id, play_record.id);

    -- Upsert maturity level
    INSERT INTO play_maturity_levels (
      team_id, play_id, maturity_level, maturity_score,
      usage_count, sections_used, last_used_at, calculated_at, next_recalculation_at
    ) VALUES (
      play_record.team_id,
      play_record.id,
      maturity_data.maturity_level,
      maturity_data.maturity_score,
      maturity_data.usage_count,
      maturity_data.sections_used,
      CASE WHEN maturity_data.usage_count > 0
           THEN (SELECT MAX(created_at) FROM play_usage_events
                 WHERE team_id = play_record.team_id AND play_id = play_record.id)
           ELSE NULL END,
      NOW(),
      NOW() + INTERVAL '1 hour'
    )
    ON CONFLICT (team_id, play_id)
    DO UPDATE SET
      maturity_level = EXCLUDED.maturity_level,
      maturity_score = EXCLUDED.maturity_score,
      usage_count = EXCLUDED.usage_count,
      sections_used = EXCLUDED.sections_used,
      last_used_at = EXCLUDED.last_used_at,
      calculated_at = EXCLUDED.calculated_at,
      next_recalculation_at = EXCLUDED.next_recalculation_at;

    updated_count := updated_count + 1;
  END LOOP;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to automatically create usage events when plays are added to practice scripts
CREATE OR REPLACE FUNCTION track_practice_script_play_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO play_usage_events (
    team_id, play_id, event_type, context_type, context_id, context_name, created_by
  )
  SELECT
    ps.team_id,
    NEW.play_id,
    'practice_script_added',
    'practice_script',
    NEW.script_id,
    ps.name,
    ps.created_by
  FROM practice_scripts ps
  WHERE ps.id = NEW.script_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_practice_script_play_usage
  AFTER INSERT ON script_plays
  FOR EACH ROW EXECUTE FUNCTION track_practice_script_play_usage();

-- Trigger to automatically create usage events when plays are added to game plans
CREATE OR REPLACE FUNCTION track_game_plan_play_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO play_usage_events (
    team_id, play_id, event_type, context_type, context_id, context_name, created_by
  )
  SELECT
    gp.team_id,
    NEW.play_id,
    'game_plan_added',
    'game_plan',
    NEW.situation_id,
    gps.name || ' (' || gp.name || ')',
    gp.created_by
  FROM game_plan_situations gps
  JOIN game_plans gp ON gps.game_plan_id = gp.id
  WHERE gps.id = NEW.situation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_game_plan_play_usage
  AFTER INSERT ON game_plan_plays
  FOR EACH ROW EXECUTE FUNCTION track_game_plan_play_usage();

-- =====================================================
-- INITIAL DATA POPULATION
-- =====================================================

-- Initialize workflow progress for existing teams
INSERT INTO workflow_progress (team_id, section, progress_percentage, status)
SELECT
  t.id as team_id,
  section,
  CASE
    WHEN section = 'playbook' AND EXISTS (SELECT 1 FROM plays p JOIN playbooks pb ON p.playbook_id = pb.id WHERE pb.team_id = t.id) THEN 100
    WHEN section = 'practice' AND EXISTS (SELECT 1 FROM practice_scripts ps WHERE ps.team_id = t.id) THEN 75
    WHEN section = 'game_plan' AND EXISTS (SELECT 1 FROM game_plans gp WHERE gp.team_id = t.id) THEN 50
    ELSE 0
  END as progress_percentage,
  CASE
    WHEN section = 'playbook' AND EXISTS (SELECT 1 FROM plays p JOIN playbooks pb ON p.playbook_id = pb.id WHERE pb.team_id = t.id) THEN 'completed'
    WHEN section = 'practice' AND EXISTS (SELECT 1 FROM practice_scripts ps WHERE ps.team_id = t.id) THEN 'in_progress'
    WHEN section = 'game_plan' AND EXISTS (SELECT 1 FROM game_plans gp WHERE gp.team_id = t.id) THEN 'in_progress'
    ELSE 'not_started'
  END as status
FROM teams t
CROSS JOIN (VALUES ('playbook'), ('practice'), ('game_plan'), ('boxcall')) AS sections(section)
ON CONFLICT (team_id, section) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE play_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_maturity_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_flow_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic for now - will be enhanced with proper auth)
CREATE POLICY "Enable read access for all users" ON play_usage_events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON play_maturity_levels FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON workflow_progress FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON data_flow_analytics FOR SELECT USING (true);

CREATE POLICY "Enable write access for all users" ON play_usage_events FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON play_maturity_levels FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON workflow_progress FOR ALL USING (true);
CREATE POLICY "Enable write access for all users" ON data_flow_analytics FOR ALL USING (true);