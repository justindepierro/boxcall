-- ============================================================================
-- BOXCALL BULLETPROOF DATABASE - PART 5: FIX GAME_PLANS SCHEMA
-- ============================================================================
-- Run this FIFTH to fix game_plans table schema mismatches
-- ============================================================================

-- ============================================================================
-- SECTION 1: ADD MISSING COLUMNS TO GAME_PLANS
-- ============================================================================

-- Add name column (display name for the game plan)
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS name TEXT;

-- Add notes column
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add created_by column (who created it)
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add is_archived for soft delete
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add game_location as alias for venue (code uses game_location)
-- First check if game_location exists, if not create it
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS game_location TEXT;

-- Copy venue data to game_location if venue exists and game_location is empty
UPDATE game_plans SET game_location = venue WHERE game_location IS NULL AND venue IS NOT NULL;

-- ============================================================================
-- SECTION 2: ADD MISSING COLUMNS TO GAME_SESSIONS
-- ============================================================================

-- The is_home_game column (service uses this, table has is_home_team)
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS is_home_game BOOLEAN DEFAULT true;

-- Copy is_home_team to is_home_game
UPDATE game_sessions SET is_home_game = is_home_team WHERE is_home_game IS NULL AND is_home_team IS NOT NULL;

-- ============================================================================
-- SECTION 3: ADD RLS POLICY FOR GAME_SESSIONS
-- ============================================================================

-- Enable RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "game_sessions_select_bulletproof" ON game_sessions;
DROP POLICY IF EXISTS "game_sessions_insert_bulletproof" ON game_sessions;
DROP POLICY IF EXISTS "game_sessions_update_bulletproof" ON game_sessions;
DROP POLICY IF EXISTS "game_sessions_delete_bulletproof" ON game_sessions;

DROP POLICY IF EXISTS "practice_sessions_select_bulletproof" ON practice_sessions;
DROP POLICY IF EXISTS "practice_sessions_insert_bulletproof" ON practice_sessions;
DROP POLICY IF EXISTS "practice_sessions_update_bulletproof" ON practice_sessions;
DROP POLICY IF EXISTS "practice_sessions_delete_bulletproof" ON practice_sessions;

DROP POLICY IF EXISTS "play_executions_select_bulletproof" ON play_executions;
DROP POLICY IF EXISTS "play_executions_insert_bulletproof" ON play_executions;
DROP POLICY IF EXISTS "play_executions_update_bulletproof" ON play_executions;
DROP POLICY IF EXISTS "play_executions_delete_bulletproof" ON play_executions;

DROP POLICY IF EXISTS "games_select_bulletproof" ON games;
DROP POLICY IF EXISTS "games_insert_bulletproof" ON games;
DROP POLICY IF EXISTS "games_update_bulletproof" ON games;
DROP POLICY IF EXISTS "games_delete_bulletproof" ON games;

-- GAME_SESSIONS RLS
CREATE POLICY "game_sessions_select_bulletproof" ON game_sessions FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_sessions_insert_bulletproof" ON game_sessions FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_sessions_update_bulletproof" ON game_sessions FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_sessions_delete_bulletproof" ON game_sessions FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- PRACTICE_SESSIONS RLS
CREATE POLICY "practice_sessions_select_bulletproof" ON practice_sessions FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_sessions_insert_bulletproof" ON practice_sessions FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_sessions_update_bulletproof" ON practice_sessions FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_sessions_delete_bulletproof" ON practice_sessions FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- PLAY_EXECUTIONS RLS
CREATE POLICY "play_executions_select_bulletproof" ON play_executions FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "play_executions_insert_bulletproof" ON play_executions FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "play_executions_update_bulletproof" ON play_executions FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "play_executions_delete_bulletproof" ON play_executions FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- GAMES RLS
CREATE POLICY "games_select_bulletproof" ON games FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "games_insert_bulletproof" ON games FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "games_update_bulletproof" ON games FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "games_delete_bulletproof" ON games FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- ============================================================================
-- SECTION 4: INDEXES FOR NEW COLUMNS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_game_plans_is_archived ON game_plans(is_archived);
CREATE INDEX IF NOT EXISTS idx_game_plans_created_by ON game_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_game_sessions_team ON game_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_is_archived ON game_sessions(is_archived);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_team ON practice_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_is_archived ON practice_sessions(is_archived);
CREATE INDEX IF NOT EXISTS idx_play_executions_team ON play_executions(team_id);
CREATE INDEX IF NOT EXISTS idx_games_team ON games(team_id);

-- ============================================================================
-- FINAL SUCCESS MESSAGE
-- ============================================================================

SELECT 'PART 5 COMPLETE: game_plans schema fixed, session RLS added!' as result;
