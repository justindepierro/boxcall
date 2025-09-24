-- ===========================================
-- SEASON STATS VIEW
-- ===========================================

CREATE VIEW season_stats AS
SELECT
  tp.id as player_id,
  tp.first_name,
  tp.last_name,
  tp.jersey_number,
  tp.position,
  t.name as team_name,
  t.season_year,
  COALESCE(SUM(CASE WHEN pc.result = 'complete' THEN 1 ELSE 0 END), 0) as pass_completions,
  COALESCE(SUM(CASE WHEN pc.result = 'incomplete' THEN 1 ELSE 0 END), 0) as pass_attempts,
  COALESCE(SUM(CASE WHEN pc.result = 'touchdown' THEN 1 ELSE 0 END), 0) as passing_touchdowns,
  COALESCE(SUM(CASE WHEN pc.result = 'interception' THEN 1 ELSE 0 END), 0) as interceptions,
  COALESCE(SUM(CASE WHEN pc.result = 'rush' THEN 1 ELSE 0 END), 0) as rush_attempts,
  COALESCE(SUM(CASE WHEN pc.result = 'rush_td' THEN 1 ELSE 0 END), 0) as rushing_touchdowns,
  COALESCE(SUM(CASE WHEN pc.result = 'reception' THEN 1 ELSE 0 END), 0) as receptions,
  COALESCE(SUM(CASE WHEN pc.result = 'receiving_td' THEN 1 ELSE 0 END), 0) as receiving_touchdowns,
  0 as achievements_count,  -- Achievements are now user-based, not player-based
  0 as stickers_count       -- Helmet stickers are now user-based, not player-based
FROM team_players tp
JOIN teams t ON t.id = tp.team_id
LEFT JOIN play_calls pc ON pc.game_id IN (
  SELECT gr.id FROM game_results gr WHERE gr.team_id = t.id
)
WHERE tp.is_active = true
GROUP BY tp.id, tp.first_name, tp.last_name, tp.jersey_number, tp.position, t.name, t.season_year;