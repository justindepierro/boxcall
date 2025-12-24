-- Global Search RPC + trigram indexes
-- Provides a single fast search endpoint for GlobalSearch (Cmd/Ctrl+K)

-- Enable trigram extension for fast ILIKE/Similarity search
-- Supabase linter prefers extensions not installed into the public schema.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    BEGIN
      EXECUTE 'ALTER EXTENSION pg_trgm SET SCHEMA extensions';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION pg_trgm SET SCHEMA extensions (insufficient privileges)';
      WHEN others THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION pg_trgm SET SCHEMA extensions (%).', SQLERRM;
    END;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Trigram indexes (accelerate ILIKE '%q%')
-- -----------------------------------------------------------------------------

-- Plays (search across multiple play fields)
CREATE INDEX IF NOT EXISTS idx_plays_global_search_trgm
  ON plays
  USING gin (
    (
      COALESCE(play_name, '') || ' ' ||
      COALESCE(one_word_play, '') || ' ' ||
      COALESCE(formation, '') || ' ' ||
      COALESCE(personnel, '') || ' ' ||
      COALESCE(p_type, '')
    ) gin_trgm_ops
  );

-- Formations
CREATE INDEX IF NOT EXISTS idx_formations_name_trgm
  ON formations
  USING gin ((COALESCE(name, '')) gin_trgm_ops);

-- Players
CREATE INDEX IF NOT EXISTS idx_team_players_global_search_trgm
  ON team_players
  USING gin (
    (
      COALESCE(first_name, '') || ' ' ||
      COALESCE(last_name, '') || ' ' ||
      COALESCE(nickname, '') || ' ' ||
      COALESCE(position, '') || ' ' ||
      COALESCE(jersey_number::text, '')
    ) gin_trgm_ops
  );

-- Team announcements
CREATE INDEX IF NOT EXISTS idx_team_announcements_global_search_trgm
  ON team_announcements
  USING gin (
    (
      COALESCE(title, '') || ' ' ||
      COALESCE(content, '')
    ) gin_trgm_ops
  );

-- Game plans
CREATE INDEX IF NOT EXISTS idx_game_plans_opponent_trgm
  ON game_plans
  USING gin ((COALESCE(opponent, '')) gin_trgm_ops);

-- Practice scripts
CREATE INDEX IF NOT EXISTS idx_practice_scripts_title_trgm
  ON practice_scripts
  USING gin ((COALESCE(title, '')) gin_trgm_ops);

-- Calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_global_search_trgm
  ON calendar_events
  USING gin (
    (
      COALESCE(title, '') || ' ' ||
      COALESCE(event_type, '') || ' ' ||
      COALESCE(location, '')
    ) gin_trgm_ops
  );

-- Equipment
CREATE INDEX IF NOT EXISTS idx_equipment_global_search_trgm
  ON equipment
  USING gin (
    (
      COALESCE(name, '') || ' ' ||
      COALESCE(category, '')
    ) gin_trgm_ops
  );

-- -----------------------------------------------------------------------------
-- RPC: boxcall_global_search
-- -----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS boxcall_global_search(UUID, TEXT, UUID, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION boxcall_global_search(
  p_team_id UUID,
  p_query TEXT,
  p_playbook_id UUID DEFAULT NULL,
  p_limit_per_type INTEGER DEFAULT 5,
  p_limit_total INTEGER DEFAULT 20
)
RETURNS TABLE (
  result_type TEXT,
  id UUID,

  -- Plays
  play_name TEXT,
  formation TEXT,
  one_word_play TEXT,
  personnel TEXT,
  p_type TEXT,

  -- Shared "name" (formations + equipment)
  name TEXT,

  -- Players
  first_name TEXT,
  last_name TEXT,
  jersey_number INTEGER,
  player_position TEXT,

  -- Shared "title" (announcements + practice scripts + calendar)
  title TEXT,

  -- Announcements
  created_at TIMESTAMPTZ,

  -- Game plans
  opponent TEXT,
  game_date DATE,

  -- Calendar
  event_date DATE,
  event_type TEXT,

  -- Equipment
  category TEXT,
  quantity INTEGER,

  -- Ranking
  score REAL
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
WITH
q AS (
  SELECT NULLIF(BTRIM(p_query), '') AS query
),
active_playbook AS (
  SELECT pb.id
  FROM playbooks pb
  WHERE pb.team_id = p_team_id
    AND pb.is_active = true
  ORDER BY pb.updated_at DESC
  LIMIT 1
),
playbook_ctx AS (
  SELECT COALESCE(p_playbook_id, (SELECT id FROM active_playbook)) AS playbook_id
),

plays_cte AS (
  SELECT
    'play'::text AS result_type,
    pl.id,
    pl.play_name,
    pl.formation,
    pl.one_word_play,
    pl.personnel,
    pl.p_type,
    NULL::text AS name,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::int AS jersey_number,
    NULL::text AS player_position,
    NULL::text AS title,
    NULL::timestamptz AS created_at,
    NULL::text AS opponent,
    NULL::date AS game_date,
    NULL::date AS event_date,
    NULL::text AS event_type,
    NULL::text AS category,
    NULL::int AS quantity,
    GREATEST(
      similarity(COALESCE(lower(pl.play_name), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(pl.one_word_play), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(pl.formation), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(pl.personnel), ''), lower((SELECT query FROM q)))
    )::real AS score
  FROM plays pl
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND pl.playbook_id = (SELECT playbook_id FROM playbook_ctx)
    AND (
      pl.play_name ILIKE '%' || (SELECT query FROM q) || '%'
      OR pl.one_word_play ILIKE '%' || (SELECT query FROM q) || '%'
      OR pl.formation ILIKE '%' || (SELECT query FROM q) || '%'
      OR pl.personnel ILIKE '%' || (SELECT query FROM q) || '%'
      OR pl.p_type ILIKE '%' || (SELECT query FROM q) || '%'
    )
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
),

formations_cte AS (
  SELECT
    'formation'::text AS result_type,
    f.id,
    NULL::text AS play_name,
    NULL::text AS formation,
    NULL::text AS one_word_play,
    NULL::text AS personnel,
    NULL::text AS p_type,
    f.name,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::int AS jersey_number,
    NULL::text AS player_position,
    NULL::text AS title,
    NULL::timestamptz AS created_at,
    NULL::text AS opponent,
    NULL::date AS game_date,
    NULL::date AS event_date,
    NULL::text AS event_type,
    NULL::text AS category,
    NULL::int AS quantity,
    similarity(COALESCE(lower(f.name), ''), lower((SELECT query FROM q)))::real AS score
  FROM formations f
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND f.playbook_id = (SELECT playbook_id FROM playbook_ctx)
    AND f.name ILIKE '%' || (SELECT query FROM q) || '%'
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
),

players_cte AS (
  SELECT
    'player'::text AS result_type,
    tp.id,
    NULL::text AS play_name,
    NULL::text AS formation,
    NULL::text AS one_word_play,
    NULL::text AS personnel,
    NULL::text AS p_type,
    NULL::text AS name,
    tp.first_name,
    tp.last_name,
    tp.jersey_number,
    tp.position AS player_position,
    NULL::text AS title,
    NULL::timestamptz AS created_at,
    NULL::text AS opponent,
    NULL::date AS game_date,
    NULL::date AS event_date,
    NULL::text AS event_type,
    NULL::text AS category,
    NULL::int AS quantity,
    GREATEST(
      similarity(COALESCE(lower(tp.first_name), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(tp.last_name), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(tp.nickname), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(tp.position), ''), lower((SELECT query FROM q)))
    )::real AS score
  FROM team_players tp
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND tp.team_id = p_team_id
    AND tp.is_active = true
    AND (
      tp.first_name ILIKE '%' || (SELECT query FROM q) || '%'
      OR tp.last_name ILIKE '%' || (SELECT query FROM q) || '%'
      OR tp.nickname ILIKE '%' || (SELECT query FROM q) || '%'
      OR tp.position ILIKE '%' || (SELECT query FROM q) || '%'
      OR tp.jersey_number::text ILIKE '%' || (SELECT query FROM q) || '%'
    )
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
),

announcements_cte AS (
  SELECT
    'announcement'::text AS result_type,
    ta.id,
    NULL::text AS play_name,
    NULL::text AS formation,
    NULL::text AS one_word_play,
    NULL::text AS personnel,
    NULL::text AS p_type,
    NULL::text AS name,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::int AS jersey_number,
    NULL::text AS player_position,
    ta.title,
    ta.created_at,
    NULL::text AS opponent,
    NULL::date AS game_date,
    NULL::date AS event_date,
    NULL::text AS event_type,
    NULL::text AS category,
    NULL::int AS quantity,
    GREATEST(
      similarity(COALESCE(lower(ta.title), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(ta.content), ''), lower((SELECT query FROM q)))
    )::real AS score
  FROM team_announcements ta
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND ta.team_id = p_team_id
    AND (ta.deleted_at IS NULL)
    AND (
      ta.title ILIKE '%' || (SELECT query FROM q) || '%'
      OR ta.content ILIKE '%' || (SELECT query FROM q) || '%'
    )
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
),

game_plans_cte AS (
  SELECT
    'game_plan'::text AS result_type,
    gp.id,
    NULL::text AS play_name,
    NULL::text AS formation,
    NULL::text AS one_word_play,
    NULL::text AS personnel,
    NULL::text AS p_type,
    NULL::text AS name,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::int AS jersey_number,
    NULL::text AS player_position,
    NULL::text AS title,
    NULL::timestamptz AS created_at,
    gp.opponent,
    gp.game_date,
    NULL::date AS event_date,
    NULL::text AS event_type,
    NULL::text AS category,
    NULL::int AS quantity,
    similarity(COALESCE(lower(gp.opponent), ''), lower((SELECT query FROM q)))::real AS score
  FROM game_plans gp
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND gp.team_id = p_team_id
    AND gp.opponent ILIKE '%' || (SELECT query FROM q) || '%'
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
),

practice_scripts_cte AS (
  SELECT
    'practice_script'::text AS result_type,
    ps.id,
    NULL::text AS play_name,
    NULL::text AS formation,
    NULL::text AS one_word_play,
    NULL::text AS personnel,
    NULL::text AS p_type,
    NULL::text AS name,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::int AS jersey_number,
    NULL::text AS player_position,
    ps.title,
    NULL::timestamptz AS created_at,
    NULL::text AS opponent,
    NULL::date AS game_date,
    NULL::date AS event_date,
    NULL::text AS event_type,
    NULL::text AS category,
    NULL::int AS quantity,
    similarity(COALESCE(lower(ps.title), ''), lower((SELECT query FROM q)))::real AS score
  FROM practice_scripts ps
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND ps.team_id = p_team_id
    AND ps.title ILIKE '%' || (SELECT query FROM q) || '%'
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
),

calendar_events_cte AS (
  SELECT
    'calendar_event'::text AS result_type,
    ce.id,
    NULL::text AS play_name,
    NULL::text AS formation,
    NULL::text AS one_word_play,
    NULL::text AS personnel,
    NULL::text AS p_type,
    NULL::text AS name,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::int AS jersey_number,
    NULL::text AS player_position,
    ce.title,
    NULL::timestamptz AS created_at,
    NULL::text AS opponent,
    NULL::date AS game_date,
    ce.event_date,
    ce.event_type,
    NULL::text AS category,
    NULL::int AS quantity,
    GREATEST(
      similarity(COALESCE(lower(ce.title), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(ce.event_type), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(ce.location), ''), lower((SELECT query FROM q)))
    )::real AS score
  FROM calendar_events ce
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND ce.team_id = p_team_id
    AND (
      ce.title ILIKE '%' || (SELECT query FROM q) || '%'
      OR ce.event_type ILIKE '%' || (SELECT query FROM q) || '%'
      OR ce.location ILIKE '%' || (SELECT query FROM q) || '%'
    )
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
),

equipment_cte AS (
  SELECT
    'equipment'::text AS result_type,
    e.id,
    NULL::text AS play_name,
    NULL::text AS formation,
    NULL::text AS one_word_play,
    NULL::text AS personnel,
    NULL::text AS p_type,
    e.name,
    NULL::text AS first_name,
    NULL::text AS last_name,
    NULL::int AS jersey_number,
    NULL::text AS player_position,
    NULL::text AS title,
    NULL::timestamptz AS created_at,
    NULL::text AS opponent,
    NULL::date AS game_date,
    NULL::date AS event_date,
    NULL::text AS event_type,
    e.category,
    e.quantity,
    GREATEST(
      similarity(COALESCE(lower(e.name), ''), lower((SELECT query FROM q))),
      similarity(COALESCE(lower(e.category), ''), lower((SELECT query FROM q)))
    )::real AS score
  FROM equipment e
  WHERE (SELECT query FROM q) IS NOT NULL
    AND length((SELECT query FROM q)) >= 2
    AND e.team_id = p_team_id
    AND (
      e.name ILIKE '%' || (SELECT query FROM q) || '%'
      OR e.category ILIKE '%' || (SELECT query FROM q) || '%'
    )
  ORDER BY score DESC NULLS LAST
  LIMIT p_limit_per_type
)

SELECT * FROM plays_cte
UNION ALL SELECT * FROM formations_cte
UNION ALL SELECT * FROM players_cte
UNION ALL SELECT * FROM announcements_cte
UNION ALL SELECT * FROM game_plans_cte
UNION ALL SELECT * FROM practice_scripts_cte
UNION ALL SELECT * FROM calendar_events_cte
UNION ALL SELECT * FROM equipment_cte
ORDER BY score DESC NULLS LAST
LIMIT p_limit_total;
$$;

GRANT EXECUTE ON FUNCTION boxcall_global_search(UUID, TEXT, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION boxcall_global_search(UUID, TEXT, UUID, INTEGER, INTEGER) TO anon;
