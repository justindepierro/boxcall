-- ============================================================================
-- BOXCALL CONFIDENCE SYSTEM - ANALYTICS & SITUATIONAL TRACKING
-- ============================================================================
-- Run after all previous migrations
-- Adds situational context to play_executions and creates analytics views
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENSURE BASE COLUMNS EXIST (fixes missing session_type issue)
-- ============================================================================

-- First ensure session_type column exists (may be missing if table was created before migrations)
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS session_type TEXT;

-- Update any NULL session_type to default 'practice'
UPDATE play_executions SET session_type = 'practice' WHERE session_type IS NULL;

-- Now add the constraint if it doesn't exist (ignore error if already exists)
DO $$ 
BEGIN
  ALTER TABLE play_executions ADD CONSTRAINT play_executions_session_type_check 
    CHECK (session_type IN ('practice', 'game'));
EXCEPTION WHEN duplicate_object THEN
  NULL; -- constraint already exists, ignore
END $$;

-- ============================================================================
-- SECTION 2: ENHANCE PLAY_EXECUTIONS FOR SITUATIONAL TRACKING
-- ============================================================================

-- Add detailed situational columns for confidence tracking
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS down INTEGER CHECK (down BETWEEN 1 AND 4);
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS distance INTEGER; -- yards to go
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS field_zone TEXT CHECK (field_zone IN ('backed_up', 'own_territory', 'midfield', 'plus_territory', 'red_zone', 'goal_line'));
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS hash TEXT CHECK (hash IN ('left', 'middle', 'right'));
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS quarter INTEGER CHECK (quarter BETWEEN 1 AND 5); -- 5 = OT
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS game_clock TEXT; -- MM:SS format
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS score_differential INTEGER; -- positive = winning, negative = losing
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS defensive_look TEXT; -- what defense showed
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS rep_number INTEGER DEFAULT 1;
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS is_scripted BOOLEAN DEFAULT true; -- was this from a script vs audible

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_play_executions_analytics 
  ON play_executions(play_id, result, down, field_zone);
CREATE INDEX IF NOT EXISTS idx_play_executions_situation 
  ON play_executions(team_id, session_type, down, distance, field_zone);
CREATE INDEX IF NOT EXISTS idx_play_executions_play_result 
  ON play_executions(play_id, result);

-- ============================================================================
-- SECTION 3: DISTANCE BUCKET FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION distance_bucket(distance INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN distance <= 2 THEN 'short'      -- 1-2 yards
    WHEN distance <= 5 THEN 'medium'     -- 3-5 yards  
    WHEN distance <= 8 THEN 'long'       -- 6-8 yards
    ELSE 'extra_long'                    -- 9+ yards
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SECTION 4: PLAY CONFIDENCE STATS VIEW (Core Analytics)
-- ============================================================================

CREATE OR REPLACE VIEW play_confidence_stats AS
SELECT 
  pe.team_id,
  pe.play_id,
  p.play_name,
  p.formation,
  p.personnel,
  pe.session_type,
  pe.down,
  distance_bucket(pe.distance) as distance_bucket,
  pe.field_zone,
  pe.hash,
  COUNT(*) as total_reps,
  COUNT(CASE WHEN pe.result = 'success' THEN 1 END) as successes,
  COUNT(CASE WHEN pe.result = 'incomplete' THEN 1 END) as incompletes,
  COUNT(CASE WHEN pe.result = 'turnover' THEN 1 END) as turnovers,
  COUNT(CASE WHEN pe.result = 'penalty' THEN 1 END) as penalties,
  ROUND(100.0 * COUNT(CASE WHEN pe.result = 'success' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as success_rate,
  AVG(CASE WHEN pe.yards_gained IS NOT NULL THEN pe.yards_gained ELSE 0 END)::NUMERIC(10,1) as avg_yards,
  CASE 
    WHEN COUNT(*) >= 20 AND ROUND(100.0 * COUNT(CASE WHEN pe.result = 'success' THEN 1 END) / COUNT(*), 1) >= 75 THEN 'HIGH'
    WHEN COUNT(*) >= 10 AND ROUND(100.0 * COUNT(CASE WHEN pe.result = 'success' THEN 1 END) / COUNT(*), 1) >= 60 THEN 'MEDIUM'
    WHEN COUNT(*) >= 5 THEN 'LOW'
    ELSE 'UNTESTED'
  END as confidence_level,
  MAX(pe.executed_at) as last_executed
FROM play_executions pe
LEFT JOIN plays p ON p.id = pe.play_id
WHERE pe.result IS NOT NULL
GROUP BY 
  pe.team_id, pe.play_id, p.play_name, p.formation, p.personnel,
  pe.session_type, pe.down, distance_bucket(pe.distance), pe.field_zone, pe.hash;

-- ============================================================================
-- SECTION 5: PLAY OVERALL CONFIDENCE (Aggregated across all situations)
-- ============================================================================

CREATE OR REPLACE VIEW play_overall_confidence AS
SELECT 
  team_id,
  play_id,
  play_name,
  formation,
  personnel,
  SUM(CASE WHEN session_type = 'practice' THEN total_reps ELSE 0 END) as practice_reps,
  SUM(CASE WHEN session_type = 'game' THEN total_reps ELSE 0 END) as game_reps,
  SUM(total_reps) as total_reps,
  ROUND(AVG(success_rate), 1) as avg_success_rate,
  ROUND(
    (0.3 * COALESCE(AVG(CASE WHEN session_type = 'practice' THEN success_rate END), 0)) +
    (0.7 * COALESCE(AVG(CASE WHEN session_type = 'game' THEN success_rate END), 0))
  , 1) as weighted_confidence,
  CASE 
    WHEN SUM(total_reps) >= 30 AND AVG(success_rate) >= 70 THEN 'PROVEN'
    WHEN SUM(total_reps) >= 15 AND AVG(success_rate) >= 60 THEN 'CONFIDENT'
    WHEN SUM(total_reps) >= 5 THEN 'DEVELOPING'
    ELSE 'UNTESTED'
  END as confidence_tier,
  MAX(last_executed) as last_executed
FROM play_confidence_stats
GROUP BY team_id, play_id, play_name, formation, personnel;

-- ============================================================================
-- SECTION 6: SITUATIONAL PLAY RECOMMENDATIONS
-- ============================================================================

CREATE OR REPLACE VIEW situational_play_recommendations AS
SELECT 
  team_id,
  down,
  distance_bucket,
  field_zone,
  play_id,
  play_name,
  formation,
  total_reps,
  success_rate,
  confidence_level,
  ROW_NUMBER() OVER (
    PARTITION BY team_id, down, distance_bucket, field_zone 
    ORDER BY 
      CASE confidence_level 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
        ELSE 4 
      END,
      success_rate DESC,
      total_reps DESC
  ) as rank
FROM play_confidence_stats
WHERE session_type = 'practice' OR session_type = 'game';

-- ============================================================================
-- SECTION 7: PRACTICE VS GAME COMPARISON (Validation View)
-- ============================================================================

CREATE OR REPLACE VIEW practice_vs_game_comparison AS
SELECT 
  p.team_id,
  p.play_id,
  p.play_name,
  p.formation,
  p.down,
  p.distance_bucket,
  p.field_zone,
  -- Practice stats
  p.total_reps as practice_reps,
  p.success_rate as practice_success_rate,
  p.confidence_level as practice_confidence,
  -- Game stats
  g.total_reps as game_reps,
  g.success_rate as game_success_rate,
  -- Variance (how accurate was practice prediction?)
  ROUND(COALESCE(g.success_rate, 0) - p.success_rate, 1) as variance,
  CASE 
    WHEN ABS(COALESCE(g.success_rate, 0) - p.success_rate) <= 10 THEN 'ACCURATE'
    WHEN g.success_rate > p.success_rate THEN 'OUTPERFORMED'
    ELSE 'UNDERPERFORMED'
  END as prediction_accuracy
FROM play_confidence_stats p
LEFT JOIN play_confidence_stats g ON 
  g.play_id = p.play_id AND 
  g.down = p.down AND 
  g.distance_bucket = p.distance_bucket AND
  g.field_zone = p.field_zone AND
  g.session_type = 'game'
WHERE p.session_type = 'practice';

-- ============================================================================
-- SECTION 8: TEAM DASHBOARD STATS
-- ============================================================================

CREATE OR REPLACE VIEW team_play_analytics_summary AS
SELECT 
  team_id,
  COUNT(DISTINCT play_id) as total_plays_tracked,
  SUM(total_reps) as total_reps_logged,
  COUNT(CASE WHEN confidence_tier = 'PROVEN' THEN 1 END) as proven_plays,
  COUNT(CASE WHEN confidence_tier = 'CONFIDENT' THEN 1 END) as confident_plays,
  COUNT(CASE WHEN confidence_tier = 'DEVELOPING' THEN 1 END) as developing_plays,
  COUNT(CASE WHEN confidence_tier = 'UNTESTED' THEN 1 END) as untested_plays,
  ROUND(AVG(avg_success_rate), 1) as overall_success_rate
FROM play_overall_confidence
GROUP BY team_id;

-- ============================================================================
-- SECTION 9: GRANT ACCESS TO VIEWS
-- ============================================================================

-- These views inherit RLS from the underlying tables (play_executions, plays)
-- No additional grants needed for authenticated users

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'CONFIDENCE SYSTEM INSTALLED: Views created for play analytics!' as result;
