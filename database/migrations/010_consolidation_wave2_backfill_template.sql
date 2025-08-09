-- Migration 010: Consolidation Wave 2 (Backfill Template - DO NOT RUN in prod until reviewed)
-- Purpose: Example SQL for data migration from legacy recognition tables into player_recognitions
-- This file is a template; adapt and test in staging. Wrap in transaction when executing.

-- BEGIN;  -- Uncomment when executing for real

-- 1. Backfill achievements -> player_recognitions (skip if already migrated)
INSERT INTO player_recognitions (id, team_id, user_id, recognition_type, source_table, title, description, points_value, icon, color, category, difficulty, awarded_at, metadata, created_at, updated_at)
SELECT 
  a.id,
  a.team_id,
  a.user_id,
  'achievement',
  'achievements',
  a.title,
  a.description,
  COALESCE(a.points_value,0),
  a.icon,
  a.color,
  a.category,
  a.difficulty,
  a.earned_at,
  jsonb_build_object('is_repeatable', a.is_repeatable, 'max_times', a.max_times),
  a.earned_at,
  a.earned_at
FROM achievements a
LEFT JOIN player_recognitions pr ON pr.id = a.id
WHERE pr.id IS NULL;

-- 2. Backfill helmet_stickers
INSERT INTO player_recognitions (id, team_id, user_id, recognition_type, source_table, title, description, points_value, icon, color, category, difficulty, awarded_at, metadata, created_at, updated_at)
SELECT 
  h.id,
  h.team_id,
  h.user_id,
  'sticker',
  'helmet_stickers',
  h.reason AS title,
  h.description,
  0,
  NULL,
  h.color,
  'helmet',
  NULL,
  h.awarded_at,
  jsonb_build_object('practice_id', h.practice_id, 'game_id', h.game_id, 'sticker_type', h.sticker_type, 'pos_x', h.position_x, 'pos_y', h.position_y, 'size', h.size),
  h.awarded_at,
  h.awarded_at
FROM helmet_stickers h
LEFT JOIN player_recognitions pr ON pr.id = h.id
WHERE pr.id IS NULL;

-- 3. Backfill player_awards
INSERT INTO player_recognitions (id, team_id, user_id, recognition_type, source_table, title, description, points_value, icon, color, category, difficulty, awarded_at, metadata, created_at, updated_at)
SELECT 
  aw.id,
  aw.team_id,
  aw.user_id,
  'award',
  'player_awards',
  aw.title,
  aw.description,
  0,
  NULL,
  NULL,
  aw.category,
  NULL,
  aw.awarded_at,
  '{}'::jsonb,
  aw.awarded_at,
  aw.awarded_at
FROM player_awards aw
LEFT JOIN player_recognitions pr ON pr.id = aw.id
WHERE pr.id IS NULL;

-- 4. Backfill player_milestones
INSERT INTO player_recognitions (id, team_id, user_id, recognition_type, source_table, title, description, points_value, icon, color, category, difficulty, awarded_at, metadata, created_at, updated_at)
SELECT 
  m.id,
  m.team_id,
  m.user_id,
  'milestone',
  'player_milestones',
  m.milestone_name AS title,
  m.milestone_description AS description,
  COALESCE(m.points_value,0),
  NULL,
  NULL,
  m.category,
  NULL,
  m.achieved_at,
  '{}'::jsonb,
  m.achieved_at,
  m.achieved_at
FROM player_milestones m
LEFT JOIN player_recognitions pr ON pr.id = m.id
WHERE pr.id IS NULL;

-- 5. Verification queries (example)
-- SELECT recognition_type, COUNT(*) FROM player_recognitions GROUP BY 1;
-- SELECT COUNT(*) legacy_total FROM (
--   SELECT id FROM achievements
--   UNION ALL SELECT id FROM helmet_stickers
--   UNION ALL SELECT id FROM player_awards
--   UNION ALL SELECT id FROM player_milestones
-- ) t;

-- 6. (Optional) After successful verification create a materialized aggregation view
-- CREATE MATERIALIZED VIEW IF NOT EXISTS player_recognitions_summary AS
-- SELECT team_id, user_id, recognition_type, COUNT(*) AS count, MAX(awarded_at) AS last_awarded
-- FROM player_recognitions GROUP BY 1,2,3;

-- 7. (Deferred) Drop legacy tables AFTER cutover window
-- DROP TABLE achievements, helmet_stickers, player_awards, player_milestones;

-- COMMIT;  -- Uncomment when executing for real

-- NOTE: Run VACUUM ANALYZE player_recognitions after large backfill.
