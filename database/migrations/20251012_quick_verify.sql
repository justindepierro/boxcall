-- QUICK VERIFICATION - Paste this into Supabase SQL Editor
-- This will show if the migration was successful

-- CHECK 1: Do the new columns exist?
SELECT 'COLUMNS CHECK' as check_type, 
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'plays' AND column_name = 'diagram_data') as diagram_data_exists,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'plays' AND column_name = 'diagram_version') as diagram_version_exists;

-- CHECK 2: Do the indexes exist?
SELECT 'INDEXES CHECK' as check_type,
  EXISTS(SELECT 1 FROM pg_indexes WHERE tablename = 'plays' AND indexname = 'idx_plays_diagram_data') as idx_diagram_data_exists,
  EXISTS(SELECT 1 FROM pg_indexes WHERE tablename = 'plays' AND indexname = 'idx_plays_diagram_version') as idx_diagram_version_exists,
  EXISTS(SELECT 1 FROM pg_indexes WHERE tablename = 'plays' AND indexname = 'idx_plays_diagram_players') as idx_diagram_players_exists;

-- CHECK 3: Do the constraints exist?
SELECT 'CONSTRAINTS CHECK' as check_type,
  EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid = 'plays'::regclass AND conname = 'plays_diagram_version_check') as version_check_exists,
  EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid = 'plays'::regclass AND conname = 'plays_diagram_requires_version') as requires_version_exists;

-- CHECK 4: Do the helper functions exist?
SELECT 'FUNCTIONS CHECK' as check_type,
  EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_diagram_player_count') as player_count_func_exists,
  EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_diagram_players_by_team') as players_by_team_func_exists;

-- CHECK 5: Data migration status
SELECT 
  'DATA CHECK' as check_type,
  COUNT(*) FILTER (WHERE diagram_data IS NOT NULL) as plays_with_diagram_data,
  COUNT(*) FILTER (WHERE diagram_version IS NOT NULL) as plays_with_version,
  COUNT(*) as total_plays
FROM plays;

-- CHECK 6: Test helper function (if data exists)
SELECT 
  'FUNCTION TEST' as check_type,
  get_diagram_player_count('{"version": 2, "players": [{"id": "1"}, {"id": "2"}]}'::jsonb) as should_return_2;
