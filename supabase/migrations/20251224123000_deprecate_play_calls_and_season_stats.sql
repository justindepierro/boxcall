-- Deprecate legacy play_calls usage and remove downstream dependencies.
--
-- Context:
-- - BoxCall's canonical play-by-play execution log is `play_executions`.
-- - `play_calls` is retained for historical compatibility, but is not used by the app.
-- - The initial schema snapshot defined a `season_stats` view that joined `play_calls`.
--   That creates ongoing ambiguity and can break in environments where `play_calls` remains locked down.

COMMENT ON TABLE public.play_calls IS
  'DEPRECATED: Legacy play-by-play table. BoxCall uses play_executions for execution tracking and play analytics. Retained for historical compatibility; not used by the application.';

-- Keep the `season_stats` view signature stable, but remove dependency on `play_calls`.
-- This view is currently not used by the app (the UI derives season stats from `game_results`).
CREATE OR REPLACE VIEW public.season_stats AS
SELECT
  tp.id as player_id,
  tp.first_name,
  tp.last_name,
  tp.jersey_number,
  tp.position,
  t.name as team_name,
  t.season_year,
  0::bigint as pass_completions,
  0::bigint as pass_attempts,
  0::bigint as passing_touchdowns,
  0::bigint as interceptions,
  0::bigint as rush_attempts,
  0::bigint as rushing_touchdowns,
  0::bigint as receptions,
  0::bigint as receiving_touchdowns,
  COUNT(DISTINCT a.id) as achievements_count,
  COUNT(DISTINCT hs.id) as stickers_count
FROM team_players tp
JOIN teams t ON t.id = tp.team_id
LEFT JOIN achievements a ON a.player_id = tp.id
LEFT JOIN helmet_stickers hs ON hs.player_id = tp.id
WHERE tp.is_active = true
GROUP BY tp.id, tp.first_name, tp.last_name, tp.jersey_number, tp.position, t.name, t.season_year;
