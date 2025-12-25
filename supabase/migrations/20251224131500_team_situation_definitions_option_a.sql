-- Option A (Phase 1): Views/functions-first situation bucketing
--
-- Goal: A single, team-configurable taxonomy for:
-- - Playbook filters/presets
-- - Execution event bucketing
-- - Analytics views
--
-- Implementation notes:
-- - Store team-level situation definitions on teams.settings (JSONB)
-- - Bucketize via SQL functions
-- - Expose read-optimized views grouped by bucket

-- ---------------------------------------------------------------------------
-- Team settings storage
-- ---------------------------------------------------------------------------

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.teams.settings IS
  'Team-scoped settings JSON. Includes situation_definitions used for analytics bucketing.';

-- ---------------------------------------------------------------------------
-- JSON helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bc_jsonb_int(p_val JSONB, p_default INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_val IS NULL THEN
    RETURN p_default;
  END IF;

  IF jsonb_typeof(p_val) = 'number' THEN
    RETURN (p_val::text)::integer;
  END IF;

  IF jsonb_typeof(p_val) = 'string' THEN
    BEGIN
      RETURN (trim(both '"' from p_val::text))::integer;
    EXCEPTION WHEN others THEN
      RETURN p_default;
    END;
  END IF;

  RETURN p_default;
END;
$$;

-- ---------------------------------------------------------------------------
-- Situation definition accessors
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bc_team_situation_definitions(p_team_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(t.settings->'situation_definitions', '{}'::jsonb)
  FROM public.teams t
  WHERE t.id = p_team_id;
$$;

-- ---------------------------------------------------------------------------
-- Bucketing functions (single source of truth)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bc_field_zone(p_team_id UUID, p_yard_line INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  defs JSONB := COALESCE(public.bc_team_situation_definitions(p_team_id), '{}'::jsonb);
  backed_up_max INTEGER := public.bc_jsonb_int(defs#>'{field_zones,backed_up_max}', 20);
  plus_min INTEGER := public.bc_jsonb_int(defs#>'{field_zones,plus_min}', 50);
  red_zone_min INTEGER := public.bc_jsonb_int(defs#>'{field_zones,red_zone_min}', 80);
  goal_line_min INTEGER := public.bc_jsonb_int(defs#>'{field_zones,goal_line_min}', 95);
BEGIN
  IF p_yard_line IS NULL THEN
    RETURN 'Unknown';
  END IF;

  -- Assumption: yard_line is 0..100 where 100 is opponent goal line.
  IF p_yard_line < backed_up_max THEN
    RETURN 'Backed Up';
  ELSIF p_yard_line < plus_min THEN
    RETURN 'Open Field';
  ELSIF p_yard_line < red_zone_min THEN
    RETURN 'Plus Territory';
  ELSIF p_yard_line < goal_line_min THEN
    RETURN 'Red Zone';
  ELSE
    RETURN 'Goal Line';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.bc_distance_bucket(p_team_id UUID, p_distance INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  defs JSONB := COALESCE(public.bc_team_situation_definitions(p_team_id), '{}'::jsonb);
  short_max INTEGER := public.bc_jsonb_int(defs#>'{down_distance,short_max}', 3);
  medium_max INTEGER := public.bc_jsonb_int(defs#>'{down_distance,medium_max}', 7);
  long_max INTEGER := public.bc_jsonb_int(defs#>'{down_distance,long_max}', 10);
BEGIN
  IF p_distance IS NULL THEN
    RETURN 'Unknown';
  END IF;

  IF p_distance <= short_max THEN
    RETURN 'Short';
  ELSIF p_distance <= medium_max THEN
    RETURN 'Medium';
  ELSIF p_distance <= long_max THEN
    RETURN 'Long';
  ELSE
    RETURN 'Very Long';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.bc_down_distance_bucket(
  p_team_id UUID,
  p_down INTEGER,
  p_distance INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  down_label TEXT;
  dist_label TEXT;
BEGIN
  IF p_down IS NULL THEN
    RETURN 'Unknown';
  END IF;

  dist_label := public.bc_distance_bucket(p_team_id, p_distance);

  down_label := CASE p_down
    WHEN 1 THEN '1st'
    WHEN 2 THEN '2nd'
    WHEN 3 THEN '3rd'
    WHEN 4 THEN '4th'
    ELSE p_down::text || 'th'
  END;

  IF dist_label = 'Unknown' THEN
    RETURN down_label;
  END IF;

  RETURN down_label || ' & ' || dist_label;
END;
$$;

-- ---------------------------------------------------------------------------
-- Read-optimized views
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_play_execution_buckets AS
SELECT
  e.id,
  e.team_id,
  e.play_id,
  e.practice_session_id,
  e.game_session_id,
  e.result,
  e.yards_gained,
  e.down,
  e.distance,
  e.yard_line,
  e.executed_at,
  public.bc_field_zone(e.team_id, e.yard_line) AS field_zone,
  public.bc_distance_bucket(e.team_id, e.distance) AS distance_bucket,
  public.bc_down_distance_bucket(e.team_id, e.down, e.distance) AS down_distance_bucket
FROM public.play_executions e;

ALTER VIEW public.v_play_execution_buckets SET (security_invoker = true);

CREATE OR REPLACE VIEW public.v_play_stats_overall AS
SELECT
  e.team_id,
  e.play_id,
  COUNT(*) FILTER (WHERE e.result <> 'skipped')::INTEGER AS times_called,
  COUNT(*) FILTER (WHERE e.result = 'success')::INTEGER AS times_successful,
  ROUND(
    (COUNT(*) FILTER (WHERE e.result = 'success')::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE e.result <> 'skipped'), 0)) * 100,
    2
  ) AS success_rate,
  AVG(e.yards_gained) FILTER (WHERE e.yards_gained IS NOT NULL AND e.result <> 'skipped') AS avg_yards,
  MAX(e.executed_at) AS last_executed_at
FROM public.play_executions e
GROUP BY e.team_id, e.play_id;

ALTER VIEW public.v_play_stats_overall SET (security_invoker = true);

CREATE OR REPLACE VIEW public.v_play_stats_by_down AS
SELECT
  b.team_id,
  b.play_id,
  COALESCE(b.down_distance_bucket, 'Unknown') AS down_distance_bucket,
  COUNT(*) FILTER (WHERE b.result <> 'skipped')::INTEGER AS times_called,
  COUNT(*) FILTER (WHERE b.result = 'success')::INTEGER AS times_successful,
  ROUND(
    (COUNT(*) FILTER (WHERE b.result = 'success')::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE b.result <> 'skipped'), 0)) * 100,
    2
  ) AS success_rate
FROM public.v_play_execution_buckets b
GROUP BY b.team_id, b.play_id, COALESCE(b.down_distance_bucket, 'Unknown');

ALTER VIEW public.v_play_stats_by_down SET (security_invoker = true);

CREATE OR REPLACE VIEW public.v_play_stats_by_zone AS
SELECT
  b.team_id,
  b.play_id,
  COALESCE(b.field_zone, 'Unknown') AS field_zone,
  COUNT(*) FILTER (WHERE b.result <> 'skipped')::INTEGER AS times_called,
  COUNT(*) FILTER (WHERE b.result = 'success')::INTEGER AS times_successful,
  ROUND(
    (COUNT(*) FILTER (WHERE b.result = 'success')::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE b.result <> 'skipped'), 0)) * 100,
    2
  ) AS success_rate
FROM public.v_play_execution_buckets b
GROUP BY b.team_id, b.play_id, COALESCE(b.field_zone, 'Unknown');

ALTER VIEW public.v_play_stats_by_zone SET (security_invoker = true);
