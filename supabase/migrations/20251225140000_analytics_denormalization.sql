-- ============================================================================
-- ANALYTICS DENORMALIZATION: A+ System Upgrade
-- ============================================================================
-- Adds denormalized columns to play_executions for instant analytics
-- No JOINs needed for tendency reports, success rate by type, etc.
-- ============================================================================

-- ============================================================================
-- STEP 1: Add denormalized columns to play_executions
-- ============================================================================

-- Play metadata (copied from plays table at execution time)
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS play_type TEXT;
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS play_family TEXT CHECK (play_family IN ('run', 'pass', 'screen', 'play_action', 'rpo', 'trick', 'special_teams', 'other'));
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS personnel TEXT;
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS play_name TEXT;

-- Computed situation buckets (calculated at execution time)
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS down_distance_bucket TEXT;
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS field_zone TEXT CHECK (field_zone IN ('own_red_zone', 'own_territory', 'midfield', 'plus_territory', 'red_zone', 'goal_line'));

-- Opponent context (denormalized from game_sessions)
ALTER TABLE play_executions ADD COLUMN IF NOT EXISTS opponent TEXT;

-- ============================================================================
-- STEP 2: Create bucket computation functions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.compute_down_distance_bucket(p_down INTEGER, p_distance INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_down IS NULL OR p_distance IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Standard football down/distance buckets
  CASE p_down
    WHEN 1 THEN
      RETURN '1st_10';
    WHEN 2 THEN
      IF p_distance <= 3 THEN RETURN '2nd_short';
      ELSIF p_distance <= 6 THEN RETURN '2nd_medium';
      ELSE RETURN '2nd_long';
      END IF;
    WHEN 3 THEN
      IF p_distance <= 3 THEN RETURN '3rd_short';
      ELSIF p_distance <= 6 THEN RETURN '3rd_medium';
      ELSE RETURN '3rd_long';
      END IF;
    WHEN 4 THEN
      IF p_distance <= 3 THEN RETURN '4th_short';
      ELSE RETURN '4th_long';
      END IF;
    ELSE
      RETURN 'unknown';
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.compute_field_zone(p_yard_line INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_yard_line IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Standard field zones (yard_line 0-100, 50 is midfield)
  -- Own 20 and in = own_red_zone (defending)
  -- Own 21-49 = own_territory
  -- 50 = midfield
  -- Opponent 49-21 = plus_territory
  -- Opponent 20-11 = red_zone
  -- Opponent 10 and in = goal_line
  
  IF p_yard_line <= 20 THEN RETURN 'own_red_zone';
  ELSIF p_yard_line <= 49 THEN RETURN 'own_territory';
  ELSIF p_yard_line = 50 THEN RETURN 'midfield';
  ELSIF p_yard_line <= 79 THEN RETURN 'plus_territory';
  ELSIF p_yard_line <= 89 THEN RETURN 'red_zone';
  ELSE RETURN 'goal_line';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_play_family(p_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  IF p_type IS NULL OR p_type = '' THEN
    RETURN 'other';
  END IF;
  
  normalized := LOWER(TRIM(p_type));
  
  -- Run family
  IF normalized ~ 'run|rush|dive|sweep|power|counter|trap|draw|stretch|zone|iso|lead' THEN
    RETURN 'run';
  END IF;
  
  -- Screen family
  IF normalized ~ 'screen|tunnel|bubble|jailbreak' THEN
    RETURN 'screen';
  END IF;
  
  -- Play action family
  IF normalized ~ 'play.?action|playaction|^pa$|^pa ' THEN
    RETURN 'play_action';
  END IF;
  
  -- RPO family
  IF normalized ~ 'rpo|run.?pass.?option' THEN
    RETURN 'rpo';
  END IF;
  
  -- Trick play family
  IF normalized ~ 'trick|reverse|flea.?flicker|double.?pass|gadget' THEN
    RETURN 'trick';
  END IF;
  
  -- Special teams family
  IF normalized ~ 'punt|kick|field.?goal|^fg$|onside|return' THEN
    RETURN 'special_teams';
  END IF;
  
  -- Pass family (check last as it's the broadest)
  IF normalized ~ 'pass|slant|curl|out|post|corner|seam|go|fade|hitch|dig|comeback|route' THEN
    RETURN 'pass';
  END IF;
  
  RETURN 'other';
END;
$$;

-- ============================================================================
-- STEP 3: Create trigger to auto-populate denormalized columns
-- ============================================================================

CREATE OR REPLACE FUNCTION public.populate_execution_denormalized_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_play RECORD;
  v_game_session RECORD;
BEGIN
  -- Fetch play metadata if play_id is set
  IF NEW.play_id IS NOT NULL THEN
    SELECT play_name, p_type, personnel
    INTO v_play
    FROM plays
    WHERE id = NEW.play_id;
    
    IF FOUND THEN
      NEW.play_name := v_play.play_name;
      NEW.play_type := v_play.p_type;
      NEW.personnel := v_play.personnel;
      NEW.play_family := public.detect_play_family(v_play.p_type);
    END IF;
  END IF;
  
  -- Compute down/distance bucket
  NEW.down_distance_bucket := public.compute_down_distance_bucket(NEW.down, NEW.distance);
  
  -- Compute field zone
  NEW.field_zone := public.compute_field_zone(NEW.yard_line);
  
  -- Fetch opponent from game_session if applicable
  IF NEW.game_session_id IS NOT NULL AND NEW.opponent IS NULL THEN
    SELECT opponent
    INTO v_game_session
    FROM game_sessions
    WHERE id = NEW.game_session_id;
    
    IF FOUND THEN
      NEW.opponent := v_game_session.opponent;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_play_executions_populate_denormalized ON play_executions;
CREATE TRIGGER trg_play_executions_populate_denormalized
BEFORE INSERT ON play_executions
FOR EACH ROW
EXECUTE FUNCTION public.populate_execution_denormalized_columns();

-- ============================================================================
-- STEP 4: Backfill existing executions
-- ============================================================================

-- Backfill play metadata (play_name, play_type, personnel, play_family)
UPDATE play_executions pe
SET
  play_name = p.play_name,
  play_type = p.p_type,
  personnel = p.personnel,
  play_family = public.detect_play_family(p.p_type),
  down_distance_bucket = public.compute_down_distance_bucket(pe.down, pe.distance),
  field_zone = public.compute_field_zone(pe.yard_line)
FROM plays p
WHERE pe.play_id = p.id;

-- Backfill opponent from game_sessions (separate update to avoid JOIN issue)
UPDATE play_executions pe
SET opponent = gs.opponent
FROM game_sessions gs
WHERE pe.game_session_id = gs.id
  AND pe.opponent IS NULL
  AND gs.opponent IS NOT NULL;

-- ============================================================================
-- STEP 5: Create analytics indexes
-- ============================================================================

-- Index for play type analytics (run vs pass success rate)
CREATE INDEX IF NOT EXISTS idx_play_executions_play_family ON play_executions(play_family) WHERE play_family IS NOT NULL;

-- Index for situational analytics (3rd down conversion, red zone, etc.)
CREATE INDEX IF NOT EXISTS idx_play_executions_down_distance_bucket ON play_executions(down_distance_bucket) WHERE down_distance_bucket IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_play_executions_field_zone ON play_executions(field_zone) WHERE field_zone IS NOT NULL;

-- Index for personnel tendency analytics
CREATE INDEX IF NOT EXISTS idx_play_executions_personnel ON play_executions(personnel) WHERE personnel IS NOT NULL;

-- Composite index for common analytics queries
CREATE INDEX IF NOT EXISTS idx_play_executions_analytics_composite 
ON play_executions(team_id, play_family, result) 
WHERE result <> 'skipped';

-- Index for opponent-specific analytics
CREATE INDEX IF NOT EXISTS idx_play_executions_opponent ON play_executions(opponent) WHERE opponent IS NOT NULL;

-- ============================================================================
-- STEP 6: Create fast analytics views (no JOINs needed!)
-- ============================================================================

-- Play family success rates (Run vs Pass vs Screen etc.)
CREATE OR REPLACE VIEW public.v_analytics_by_play_family
WITH (security_invoker = true)
AS
SELECT
  team_id,
  play_family,
  COUNT(*) FILTER (WHERE result <> 'skipped')::INTEGER AS total_calls,
  COUNT(*) FILTER (WHERE result = 'success')::INTEGER AS successes,
  COUNT(*) FILTER (WHERE result = 'failure')::INTEGER AS failures,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'success')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE result <> 'skipped'), 0) * 100, 
    1
  ) AS success_rate,
  ROUND(AVG(yards_gained) FILTER (WHERE yards_gained IS NOT NULL), 1) AS avg_yards
FROM play_executions
WHERE play_family IS NOT NULL
GROUP BY team_id, play_family;

-- Situational success rates (3rd down conversion, red zone, etc.)
CREATE OR REPLACE VIEW public.v_analytics_by_situation
WITH (security_invoker = true)
AS
SELECT
  team_id,
  down_distance_bucket,
  field_zone,
  play_family,
  COUNT(*) FILTER (WHERE result <> 'skipped')::INTEGER AS total_calls,
  COUNT(*) FILTER (WHERE result = 'success')::INTEGER AS successes,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'success')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE result <> 'skipped'), 0) * 100, 
    1
  ) AS success_rate
FROM play_executions
WHERE down_distance_bucket IS NOT NULL OR field_zone IS NOT NULL
GROUP BY team_id, down_distance_bucket, field_zone, play_family;

-- Personnel tendency analysis
CREATE OR REPLACE VIEW public.v_analytics_by_personnel
WITH (security_invoker = true)
AS
SELECT
  team_id,
  personnel,
  play_family,
  COUNT(*) FILTER (WHERE result <> 'skipped')::INTEGER AS total_calls,
  COUNT(*) FILTER (WHERE result = 'success')::INTEGER AS successes,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'success')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE result <> 'skipped'), 0) * 100, 
    1
  ) AS success_rate,
  ROUND(
    COUNT(*) FILTER (WHERE play_family = 'run')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE result <> 'skipped'), 0) * 100, 
    1
  ) AS run_percentage
FROM play_executions
WHERE personnel IS NOT NULL
GROUP BY team_id, personnel, play_family;

-- Opponent-specific analytics
CREATE OR REPLACE VIEW public.v_analytics_by_opponent
WITH (security_invoker = true)
AS
SELECT
  team_id,
  opponent,
  play_family,
  COUNT(*) FILTER (WHERE result <> 'skipped')::INTEGER AS total_calls,
  COUNT(*) FILTER (WHERE result = 'success')::INTEGER AS successes,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'success')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE result <> 'skipped'), 0) * 100, 
    1
  ) AS success_rate,
  ROUND(AVG(yards_gained) FILTER (WHERE yards_gained IS NOT NULL), 1) AS avg_yards,
  COUNT(*) FILTER (WHERE was_touchdown = true)::INTEGER AS touchdowns,
  COUNT(*) FILTER (WHERE was_turnover = true)::INTEGER AS turnovers
FROM play_executions
WHERE opponent IS NOT NULL
GROUP BY team_id, opponent, play_family;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN play_executions.play_family IS 'Denormalized from plays.p_type via detect_play_family() for instant analytics';
COMMENT ON COLUMN play_executions.down_distance_bucket IS 'Pre-computed situation bucket for instant GROUP BY';
COMMENT ON COLUMN play_executions.field_zone IS 'Pre-computed field position zone for instant GROUP BY';
COMMENT ON VIEW v_analytics_by_play_family IS 'Fast analytics by play type family (no JOINs needed)';
COMMENT ON VIEW v_analytics_by_situation IS 'Fast situational analytics (3rd down, red zone, etc.)';
COMMENT ON VIEW v_analytics_by_personnel IS 'Fast personnel tendency analysis';
COMMENT ON VIEW v_analytics_by_opponent IS 'Fast opponent-specific analytics';
