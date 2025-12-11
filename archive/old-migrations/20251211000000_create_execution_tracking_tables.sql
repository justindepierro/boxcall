-- Migration: Create Execution Tracking Tables
-- Date: December 11, 2025
-- Purpose: Add practice_sessions, game_sessions, and play_executions tables
--          for BoxCall live/retroactive tracking feature (Phase 13)
-- 
-- These tables enable:
-- - Live practice rep tracking
-- - Live game play tracking  
-- - Retroactive session logging
-- - Execution analytics and success rate tracking

-- ============================================
-- PRACTICE SESSIONS TABLE
-- ============================================
-- Tracks individual practice session recordings

CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  practice_script_id UUID REFERENCES practice_scripts(id) ON DELETE SET NULL,
  
  -- Session metadata
  session_mode TEXT NOT NULL CHECK (session_mode IN ('live', 'retroactive')),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Execution stats (auto-calculated via triggers or app logic)
  total_plays INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  completed_reps INTEGER DEFAULT 0,
  successful_reps INTEGER DEFAULT 0,
  failed_reps INTEGER DEFAULT 0,
  neutral_reps INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  
  -- Context
  weather TEXT,
  field_conditions TEXT,
  notes TEXT,
  
  -- Tracking
  recorded_by UUID REFERENCES auth.users(id),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for practice_sessions
CREATE INDEX IF NOT EXISTS idx_practice_sessions_team_id ON practice_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_script_id ON practice_sessions(practice_script_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_date ON practice_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_active ON practice_sessions(team_id, is_archived) WHERE is_archived = FALSE;

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
-- Tracks individual game session recordings

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE SET NULL,
  
  -- Session metadata
  session_mode TEXT NOT NULL CHECK (session_mode IN ('live', 'retroactive')),
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  opponent TEXT NOT NULL,
  is_home_game BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Score tracking
  team_score INTEGER,
  opponent_score INTEGER,
  
  -- Execution stats (auto-calculated via triggers or app logic)
  total_plays INTEGER DEFAULT 0,
  successful_plays INTEGER DEFAULT 0,
  failed_plays INTEGER DEFAULT 0,
  neutral_plays INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  total_yards INTEGER DEFAULT 0,
  total_touchdowns INTEGER DEFAULT 0,
  total_turnovers INTEGER DEFAULT 0,
  
  -- Context
  weather TEXT,
  field_conditions TEXT,
  notes TEXT,
  
  -- Tracking
  recorded_by UUID REFERENCES auth.users(id),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for game_sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_team_id ON game_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_plan_id ON game_sessions(game_plan_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_date ON game_sessions(game_date DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_active ON game_sessions(team_id, is_archived) WHERE is_archived = FALSE;

-- ============================================
-- PLAY EXECUTIONS TABLE
-- ============================================
-- Individual play/rep execution records

CREATE TABLE IF NOT EXISTS play_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Link to either practice or game session (one must be set)
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  
  -- Play reference
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
  
  -- Execution result
  result TEXT NOT NULL CHECK (result IN ('success', 'partial', 'failure', 'neutral', 'penalty', 'turnover')),
  yards_gained INTEGER,
  was_touchdown BOOLEAN DEFAULT FALSE,
  was_turnover BOOLEAN DEFAULT FALSE,
  was_penalty BOOLEAN DEFAULT FALSE,
  penalty_yards INTEGER,
  
  -- Game context (for game sessions)
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 5), -- 5 for OT
  time_remaining TEXT, -- Format: "MM:SS"
  down INTEGER CHECK (down BETWEEN 1 AND 4),
  distance INTEGER,
  yard_line INTEGER CHECK (yard_line BETWEEN 1 AND 99),
  hash_mark TEXT CHECK (hash_mark IN ('left', 'middle', 'right')),
  
  -- Practice context (for practice sessions)
  rep_number INTEGER,
  
  -- Phase 13.2: Coverage tracking
  opponent_coverage TEXT,
  
  -- Confidence tracking (optional)
  confidence_before INTEGER CHECK (confidence_before BETWEEN 1 AND 5),
  confidence_after INTEGER CHECK (confidence_after BETWEEN 1 AND 5),
  
  -- Tagging and notes
  tags TEXT[],
  quick_tags TEXT[], -- Predefined quick-select tags
  notes TEXT,
  
  -- Tracking
  recorded_mode TEXT NOT NULL CHECK (recorded_mode IN ('live', 'retroactive')),
  recorded_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure execution belongs to either practice OR game session, not both
  CONSTRAINT execution_session_check CHECK (
    (practice_session_id IS NOT NULL AND game_session_id IS NULL) OR
    (practice_session_id IS NULL AND game_session_id IS NOT NULL)
  )
);

-- Indexes for play_executions
CREATE INDEX IF NOT EXISTS idx_play_executions_team_id ON play_executions(team_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_practice_session ON play_executions(practice_session_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_game_session ON play_executions(game_session_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_play_id ON play_executions(play_id);
CREATE INDEX IF NOT EXISTS idx_play_executions_result ON play_executions(result);
CREATE INDEX IF NOT EXISTS idx_play_executions_executed_at ON play_executions(executed_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_executions ENABLE ROW LEVEL SECURITY;

-- Practice Sessions Policies
CREATE POLICY "Users can view practice sessions for their teams"
  ON practice_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Coaches can insert practice sessions for their teams"
  ON practice_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can update practice sessions for their teams"
  ON practice_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can delete practice sessions for their teams"
  ON practice_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- Game Sessions Policies
CREATE POLICY "Users can view game sessions for their teams"
  ON game_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Coaches can insert game sessions for their teams"
  ON game_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can update game sessions for their teams"
  ON game_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can delete game sessions for their teams"
  ON game_sessions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_sessions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- Play Executions Policies
CREATE POLICY "Users can view play executions for their teams"
  ON play_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = play_executions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Coaches can insert play executions for their teams"
  ON play_executions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = play_executions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can update play executions for their teams"
  ON play_executions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = play_executions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can delete play executions for their teams"
  ON play_executions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = play_executions.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_execution_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_sessions_updated_at
  BEFORE UPDATE ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_execution_tracking_updated_at();

CREATE TRIGGER game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_execution_tracking_updated_at();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE practice_sessions IS 'Tracks practice session recordings for rep/execution tracking (BoxCall Phase 13)';
COMMENT ON TABLE game_sessions IS 'Tracks game session recordings for play-by-play tracking (BoxCall Phase 13)';
COMMENT ON TABLE play_executions IS 'Individual play/rep execution records linked to practice or game sessions';

COMMENT ON COLUMN play_executions.result IS 'Execution outcome: success, partial, failure, neutral, penalty, turnover';
COMMENT ON COLUMN play_executions.recorded_mode IS 'How this was recorded: live (during session) or retroactive (after session)';
COMMENT ON COLUMN play_executions.opponent_coverage IS 'Phase 13.2: Track opponent defensive coverage for analytics';
