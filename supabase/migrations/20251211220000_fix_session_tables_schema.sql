-- ============================================================================
-- FIX SESSION TABLES SCHEMA
-- ============================================================================
-- Adds missing columns expected by the codebase
-- Run this in Supabase SQL Editor AFTER the missing tables migration
-- ============================================================================

-- ============================================================================
-- PRACTICE_SESSIONS: Add missing columns
-- ============================================================================

-- Add session_mode column
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS session_mode TEXT NOT NULL DEFAULT 'live' CHECK (session_mode IN ('live', 'retroactive'));

-- Add session_date column (the code queries by this, not started_at)
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS session_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Add weather and field conditions
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS weather TEXT;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS field_conditions TEXT;

-- Add recorded_by column
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add is_archived for soft delete
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add stats columns
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS total_plays INTEGER DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS completed_reps INTEGER DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS successful_reps INTEGER DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS failed_reps INTEGER DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS neutral_reps INTEGER DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- ============================================================================
-- GAME_SESSIONS: Add missing columns
-- ============================================================================

-- Add session_mode column
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS session_mode TEXT NOT NULL DEFAULT 'live' CHECK (session_mode IN ('live', 'retroactive'));

-- Add opponent column (code uses 'opponent', not 'opponent_name')
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS opponent TEXT;

-- Add weather and field conditions  
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS weather TEXT;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS field_conditions TEXT;

-- Add recorded_by column
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add is_archived for soft delete
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Rename score columns to match code expectations
ALTER TABLE game_sessions RENAME COLUMN home_score TO team_score;
ALTER TABLE game_sessions RENAME COLUMN away_score TO opponent_score;

-- Add stats columns
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS total_plays INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS successful_plays INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS failed_plays INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS neutral_plays INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS total_yards INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS total_touchdowns INTEGER DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS total_turnovers INTEGER DEFAULT 0;

-- ============================================================================
-- PLAY_EXECUTIONS: Complete overhaul to match code expectations
-- ============================================================================

-- Drop the existing table and recreate with correct schema
DROP TABLE IF EXISTS play_executions CASCADE;

CREATE TABLE play_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Session references (one will be set)
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  
  -- Play reference
  play_id UUID REFERENCES plays(id) ON DELETE SET NULL,
  formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
  
  -- Result
  result TEXT NOT NULL DEFAULT 'neutral' CHECK (result IN ('success', 'failure', 'neutral', 'skipped')),
  yards_gained INTEGER,
  
  -- Game context (only for game sessions)
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  time_remaining TEXT,
  down INTEGER CHECK (down BETWEEN 1 AND 4),
  distance INTEGER,
  yard_line INTEGER CHECK (yard_line BETWEEN 0 AND 100),
  hash_mark TEXT CHECK (hash_mark IN ('left', 'middle', 'right')),
  opponent_coverage TEXT,
  
  -- Practice context (only for practice sessions)
  rep_number INTEGER,
  
  -- Play outcome details
  was_touchdown BOOLEAN DEFAULT false,
  was_turnover BOOLEAN DEFAULT false,
  was_penalty BOOLEAN DEFAULT false,
  penalty_yards INTEGER,
  
  -- Notes
  notes TEXT,
  quick_tags TEXT[], -- Array of tags like 'good_timing', 'missed_block'
  
  -- Confidence tracking (Phase 11)
  confidence_before INTEGER CHECK (confidence_before BETWEEN 0 AND 100),
  confidence_after INTEGER CHECK (confidence_after BETWEEN 0 AND 100),
  
  -- Timestamps
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_mode TEXT NOT NULL DEFAULT 'live' CHECK (recorded_mode IN ('live', 'retroactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure at least one session reference
  CONSTRAINT at_least_one_session CHECK (practice_session_id IS NOT NULL OR game_session_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE play_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "play_executions_select" ON play_executions
  FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "play_executions_insert" ON play_executions
  FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "play_executions_update" ON play_executions
  FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));

CREATE POLICY "play_executions_delete" ON play_executions
  FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_practice_sessions_session_date ON practice_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_is_archived ON practice_sessions(is_archived);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_date ON game_sessions(game_date DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_is_archived ON game_sessions(is_archived);
CREATE INDEX IF NOT EXISTS idx_play_executions_practice_session ON play_executions(practice_session_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_game_session ON play_executions(game_session_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_executed_at ON play_executions(executed_at DESC);

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT 'SUCCESS: Session tables schema fixed!' as result;
