-- Dynamic Field Zones (v2)
--
-- Purpose:
-- - Support arbitrary (6–12+) coach-defined field zones
-- - Keep analytics stable via zone IDs (labels can change safely)
--
-- Data model:
-- - teams.settings->situation_definitions->field_zones_v2 is an array of:
--   { id, label, start_yard_line, end_yard_line }
-- - yard_line remains canonical 0..100 (0=own goal line, 100=opponent goal line)

-- ---------------------------------------------------------------------------
-- Bucketing helpers (stable keys + coach-editable labels)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bc_field_zone_key(p_team_id UUID, p_yard_line INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  defs JSONB := COALESCE(public.bc_team_situation_definitions(p_team_id), '{}'::jsonb);
  zones JSONB := defs->'field_zones_v2';
  z JSONB;
  start_yl INTEGER;
  end_yl INTEGER;

  backed_up_max INTEGER := public.bc_jsonb_int(defs#>'{field_zones,backed_up_max}', 20);
  plus_min INTEGER := public.bc_jsonb_int(defs#>'{field_zones,plus_min}', 50);
  red_zone_min INTEGER := public.bc_jsonb_int(defs#>'{field_zones,red_zone_min}', 80);
  goal_line_min INTEGER := public.bc_jsonb_int(defs#>'{field_zones,goal_line_min}', 95);
BEGIN
  IF p_yard_line IS NULL THEN
    RETURN 'unknown';
  END IF;

  -- Prefer v2 zones list when present
  IF zones IS NOT NULL AND jsonb_typeof(zones) = 'array' THEN
    FOR z IN SELECT * FROM jsonb_array_elements(zones)
    LOOP
      start_yl := public.bc_jsonb_int(z->'start_yard_line', -1);
      end_yl := public.bc_jsonb_int(z->'end_yard_line', -1);

      IF start_yl >= 0 AND end_yl >= start_yl AND p_yard_line BETWEEN start_yl AND end_yl THEN
        RETURN COALESCE(z->>'id', 'unknown');
      END IF;
    END LOOP;
  END IF;

  -- Legacy threshold fallback (stable keys)
  IF p_yard_line < backed_up_max THEN
    RETURN 'backed_up';
  ELSIF p_yard_line < plus_min THEN
    RETURN 'open_field';
  ELSIF p_yard_line < red_zone_min THEN
    RETURN 'plus_territory';
  ELSIF p_yard_line < goal_line_min THEN
    RETURN 'red_zone';
  ELSE
    RETURN 'goal_line';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.bc_field_zone_label(p_team_id UUID, p_zone_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  defs JSONB := COALESCE(public.bc_team_situation_definitions(p_team_id), '{}'::jsonb);
  zones JSONB := defs->'field_zones_v2';
  z JSONB;
BEGIN
  IF p_zone_key IS NULL OR p_zone_key = '' THEN
    RETURN 'Unknown';
  END IF;

  -- Prefer v2 zone labels when present
  IF zones IS NOT NULL AND jsonb_typeof(zones) = 'array' THEN
    FOR z IN SELECT * FROM jsonb_array_elements(zones)
    LOOP
      IF (z->>'id') = p_zone_key THEN
        RETURN COALESCE(z->>'label', p_zone_key);
      END IF;
    END LOOP;
  END IF;

  -- Legacy defaults
  CASE lower(p_zone_key)
    WHEN 'backed_up' THEN RETURN 'Backed Up';
    WHEN 'open_field' THEN RETURN 'Open Field';
    WHEN 'plus_territory' THEN RETURN 'Plus Territory';
    WHEN 'red_zone' THEN RETURN 'Red Zone';
    WHEN 'goal_line' THEN RETURN 'Goal Line';
    WHEN 'unknown' THEN RETURN 'Unknown';
    ELSE RETURN p_zone_key;
  END CASE;
END;
$$;

-- Backward-compatible label function
CREATE OR REPLACE FUNCTION public.bc_field_zone(p_team_id UUID, p_yard_line INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN public.bc_field_zone_label(
    p_team_id,
    public.bc_field_zone_key(p_team_id, p_yard_line)
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Views: add stable field_zone_key and group by key
-- ---------------------------------------------------------------------------

-- Postgres cannot change view column names/order via CREATE OR REPLACE VIEW.
-- Drop dependent views first, then recreate with the updated schema.
DROP VIEW IF EXISTS public.v_play_stats_by_zone;
DROP VIEW IF EXISTS public.v_play_stats_by_down;
DROP VIEW IF EXISTS public.v_play_execution_buckets;

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
  public.bc_field_zone_key(e.team_id, e.yard_line) AS field_zone_key,
  public.bc_field_zone(e.team_id, e.yard_line) AS field_zone,
  public.bc_distance_bucket(e.team_id, e.distance) AS distance_bucket,
  public.bc_down_distance_bucket(e.team_id, e.down, e.distance) AS down_distance_bucket
FROM public.play_executions e;

ALTER VIEW public.v_play_execution_buckets SET (security_invoker = true);

CREATE OR REPLACE VIEW public.v_play_stats_by_zone AS
SELECT
  b.team_id,
  b.play_id,
  COALESCE(b.field_zone_key, 'unknown') AS field_zone_key,
  public.bc_field_zone_label(b.team_id, COALESCE(b.field_zone_key, 'unknown')) AS field_zone,
  COUNT(*) FILTER (WHERE b.result <> 'skipped')::INTEGER AS times_called,
  COUNT(*) FILTER (WHERE b.result = 'success')::INTEGER AS times_successful,
  ROUND(
    (COUNT(*) FILTER (WHERE b.result = 'success')::NUMERIC /
      NULLIF(COUNT(*) FILTER (WHERE b.result <> 'skipped'), 0)) * 100,
    2
  ) AS success_rate
FROM public.v_play_execution_buckets b
GROUP BY
  b.team_id,
  b.play_id,
  COALESCE(b.field_zone_key, 'unknown');

ALTER VIEW public.v_play_stats_by_zone SET (security_invoker = true);

-- ---------------------------------------------------------------------------
-- Relax hard-coded constraints that block coach-defined zones
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  c RECORD;
BEGIN
  -- practice_script_plays.field_position CHECK constraint(s)
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.practice_script_plays'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%field_position%'
  LOOP
    EXECUTE format('ALTER TABLE public.practice_script_plays DROP CONSTRAINT %I', c.conname);
  END LOOP;

  -- play_executions.field_zone CHECK constraint(s) (legacy column)
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.play_executions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%field_zone%'
  LOOP
    EXECUTE format('ALTER TABLE public.play_executions DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
