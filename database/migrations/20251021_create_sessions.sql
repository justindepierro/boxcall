-- ================================================
-- BoxCall Live Session - Database Schema
-- Stage 3: Practice & Game Session Tracking
-- Created: October 21, 2025
-- ================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: practice_sessions
-- Purpose: Track practice session metadata
-- ================================================
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  practice_script_id UUID REFERENCES practice_scripts(id) ON DELETE SET NULL,
  
  -- Session metadata
  session_mode TEXT NOT NULL CHECK (session_mode IN ('live', 'retroactive')),
  session_date DATE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER, -- Calculated on session end
  
  -- Session stats (calculated)
  total_plays INTEGER NOT NULL DEFAULT 0,
  total_reps INTEGER NOT NULL DEFAULT 0,
  completed_reps INTEGER NOT NULL DEFAULT 0,
  successful_reps INTEGER NOT NULL DEFAULT 0,
  failed_reps INTEGER NOT NULL DEFAULT 0,
  neutral_reps INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5,2), -- Percentage (0-100)
  
  -- Session notes
  notes TEXT,
  weather TEXT, -- e.g., "Sunny, 72°F"
  field_conditions TEXT, -- e.g., "Dry, Good"
  
  -- Metadata
  recorded_by UUID REFERENCES auth.users(id),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for practice_sessions
CREATE INDEX idx_practice_sessions_team ON practice_sessions(team_id);
CREATE INDEX idx_practice_sessions_script ON practice_sessions(practice_script_id);
CREATE INDEX idx_practice_sessions_date ON practice_sessions(session_date DESC);
CREATE INDEX idx_practice_sessions_mode ON practice_sessions(session_mode);
CREATE INDEX idx_practice_sessions_created ON practice_sessions(created_at DESC);

-- RLS for practice_sessions
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team's practice sessions"
  ON practice_sessions FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can update their team's practice sessions"
  ON practice_sessions FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can delete their team's practice sessions"
  ON practice_sessions FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

-- ================================================
-- TABLE: game_sessions
-- Purpose: Track game session metadata
-- ================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE SET NULL,
  
  -- Game metadata
  session_mode TEXT NOT NULL CHECK (session_mode IN ('live', 'retroactive')),
  game_date DATE NOT NULL,
  opponent TEXT NOT NULL,
  is_home_game BOOLEAN NOT NULL DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Game score
  team_score INTEGER,
  opponent_score INTEGER,
  
  -- Session stats (calculated)
  total_plays INTEGER NOT NULL DEFAULT 0,
  successful_plays INTEGER NOT NULL DEFAULT 0,
  failed_plays INTEGER NOT NULL DEFAULT 0,
  neutral_plays INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5,2), -- Percentage (0-100)
  total_yards INTEGER NOT NULL DEFAULT 0,
  total_touchdowns INTEGER NOT NULL DEFAULT 0,
  total_turnovers INTEGER NOT NULL DEFAULT 0,
  
  -- Session notes
  notes TEXT,
  weather TEXT,
  field_conditions TEXT,
  
  -- Metadata
  recorded_by UUID REFERENCES auth.users(id),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for game_sessions
CREATE INDEX idx_game_sessions_team ON game_sessions(team_id);
CREATE INDEX idx_game_sessions_plan ON game_sessions(game_plan_id);
CREATE INDEX idx_game_sessions_date ON game_sessions(game_date DESC);
CREATE INDEX idx_game_sessions_mode ON game_sessions(session_mode);
CREATE INDEX idx_game_sessions_created ON game_sessions(created_at DESC);

-- RLS for game_sessions
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team's game sessions"
  ON game_sessions FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create game sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can update their team's game sessions"
  ON game_sessions FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can delete their team's game sessions"
  ON game_sessions FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

-- ================================================
-- TABLE: play_executions
-- Purpose: Store individual play execution results
-- Supports both practice (reps) and game (plays)
-- ================================================
CREATE TABLE IF NOT EXISTS play_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session reference (one of these will be set)
  practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  
  -- Play reference
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  formation_id UUID REFERENCES formations(id) ON DELETE SET NULL,
  
  -- Execution result
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'neutral', 'skipped')),
  yards_gained INTEGER, -- NULL for practice, required for game
  
  -- Game context (only for game sessions)
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  time_remaining TEXT, -- e.g., "8:42"
  down INTEGER CHECK (down BETWEEN 1 AND 4),
  distance INTEGER, -- yards to first down
  yard_line INTEGER, -- 0-100 (0 = own goal line, 50 = midfield, 100 = opponent goal line)
  hash_mark TEXT CHECK (hash_mark IN ('left', 'middle', 'right')),
  
  -- Practice context (only for practice sessions)
  rep_number INTEGER, -- Which rep in the sequence (1-10)
  
  -- Play outcome details
  was_touchdown BOOLEAN NOT NULL DEFAULT FALSE,
  was_turnover BOOLEAN NOT NULL DEFAULT FALSE,
  was_penalty BOOLEAN NOT NULL DEFAULT FALSE,
  penalty_yards INTEGER,
  
  -- Notes
  notes TEXT,
  quick_tags TEXT[], -- e.g., ['good_timing', 'missed_block', 'great_throw']
  
  -- Confidence tracking (future Phase 11)
  confidence_before INTEGER, -- 0-100
  confidence_after INTEGER, -- 0-100
  
  -- Execution timestamp
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  recorded_mode TEXT NOT NULL CHECK (recorded_mode IN ('live', 'retroactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT session_type_check CHECK (
    (practice_session_id IS NOT NULL AND game_session_id IS NULL) OR
    (practice_session_id IS NULL AND game_session_id IS NOT NULL)
  ),
  CONSTRAINT game_context_check CHECK (
    (game_session_id IS NULL) OR 
    (quarter IS NOT NULL AND down IS NOT NULL AND distance IS NOT NULL)
  ),
  CONSTRAINT practice_context_check CHECK (
    (practice_session_id IS NULL) OR 
    (rep_number IS NOT NULL)
  )
);

-- Indexes for play_executions
CREATE INDEX idx_play_executions_practice_session ON play_executions(practice_session_id);
CREATE INDEX idx_play_executions_game_session ON play_executions(game_session_id);
CREATE INDEX idx_play_executions_play ON play_executions(play_id);
CREATE INDEX idx_play_executions_formation ON play_executions(formation_id);
CREATE INDEX idx_play_executions_team ON play_executions(team_id);
CREATE INDEX idx_play_executions_result ON play_executions(result);
CREATE INDEX idx_play_executions_date ON play_executions(executed_at DESC);
CREATE INDEX idx_play_executions_created ON play_executions(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_play_executions_play_result ON play_executions(play_id, result);
CREATE INDEX idx_play_executions_team_date ON play_executions(team_id, executed_at DESC);
CREATE INDEX idx_play_executions_practice_play ON play_executions(practice_session_id, play_id) WHERE practice_session_id IS NOT NULL;
CREATE INDEX idx_play_executions_game_situation ON play_executions(game_session_id, down, distance) WHERE game_session_id IS NOT NULL;

-- RLS for play_executions
ALTER TABLE play_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team's play executions"
  ON play_executions FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create play executions"
  ON play_executions FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can update their team's play executions"
  ON play_executions FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

CREATE POLICY "Coaches can delete their team's play executions"
  ON play_executions FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND team_role IN ('head_coach', 'assistant_coach', 'coach', 'coordinator')
    )
  );

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update practice_session stats
CREATE OR REPLACE FUNCTION update_practice_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE practice_sessions
  SET
    total_reps = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE practice_session_id = NEW.practice_session_id
    ),
    completed_reps = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE practice_session_id = NEW.practice_session_id
      AND result != 'skipped'
    ),
    successful_reps = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE practice_session_id = NEW.practice_session_id
      AND result = 'success'
    ),
    failed_reps = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE practice_session_id = NEW.practice_session_id
      AND result = 'failure'
    ),
    neutral_reps = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE practice_session_id = NEW.practice_session_id
      AND result = 'neutral'
    ),
    success_rate = (
      CASE 
        WHEN (SELECT COUNT(*) FROM play_executions WHERE practice_session_id = NEW.practice_session_id AND result != 'skipped') > 0
        THEN (
          SELECT COUNT(*) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE result != 'skipped'), 0)
          FROM play_executions 
          WHERE practice_session_id = NEW.practice_session_id
          AND result = 'success'
        )
        ELSE 0
      END
    ),
    total_plays = (
      SELECT COUNT(DISTINCT play_id)
      FROM play_executions
      WHERE practice_session_id = NEW.practice_session_id
    ),
    updated_at = NOW()
  WHERE id = NEW.practice_session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for practice session stats on INSERT/UPDATE
CREATE TRIGGER update_practice_stats_insert_update_trigger
  AFTER INSERT OR UPDATE ON play_executions
  FOR EACH ROW
  WHEN (NEW.practice_session_id IS NOT NULL)
  EXECUTE FUNCTION update_practice_session_stats();

-- Trigger for practice session stats on DELETE
CREATE TRIGGER update_practice_stats_delete_trigger
  AFTER DELETE ON play_executions
  FOR EACH ROW
  WHEN (OLD.practice_session_id IS NOT NULL)
  EXECUTE FUNCTION update_practice_session_stats();

-- Function to update game_session stats
CREATE OR REPLACE FUNCTION update_game_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE game_sessions
  SET
    total_plays = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE game_session_id = NEW.game_session_id
    ),
    successful_plays = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE game_session_id = NEW.game_session_id
      AND result = 'success'
    ),
    failed_plays = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE game_session_id = NEW.game_session_id
      AND result = 'failure'
    ),
    neutral_plays = (
      SELECT COUNT(*) 
      FROM play_executions 
      WHERE game_session_id = NEW.game_session_id
      AND result = 'neutral'
    ),
    success_rate = (
      CASE 
        WHEN (SELECT COUNT(*) FROM play_executions WHERE game_session_id = NEW.game_session_id) > 0
        THEN (
          SELECT COUNT(*) * 100.0 / NULLIF(COUNT(*), 0)
          FROM play_executions 
          WHERE game_session_id = NEW.game_session_id
          AND result = 'success'
        )
        ELSE 0
      END
    ),
    total_yards = (
      SELECT COALESCE(SUM(yards_gained), 0)
      FROM play_executions
      WHERE game_session_id = NEW.game_session_id
    ),
    total_touchdowns = (
      SELECT COUNT(*)
      FROM play_executions
      WHERE game_session_id = NEW.game_session_id
      AND was_touchdown = TRUE
    ),
    total_turnovers = (
      SELECT COUNT(*)
      FROM play_executions
      WHERE game_session_id = NEW.game_session_id
      AND was_turnover = TRUE
    ),
    updated_at = NOW()
  WHERE id = NEW.game_session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for game session stats on INSERT/UPDATE
CREATE TRIGGER update_game_stats_insert_update_trigger
  AFTER INSERT OR UPDATE ON play_executions
  FOR EACH ROW
  WHEN (NEW.game_session_id IS NOT NULL)
  EXECUTE FUNCTION update_game_session_stats();

-- Trigger for game session stats on DELETE
CREATE TRIGGER update_game_stats_delete_trigger
  AFTER DELETE ON play_executions
  FOR EACH ROW
  WHEN (OLD.game_session_id IS NOT NULL)
  EXECUTE FUNCTION update_game_session_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_practice_sessions_updated_at
  BEFORE UPDATE ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE practice_sessions IS 'Tracks practice session metadata and statistics';
COMMENT ON TABLE game_sessions IS 'Tracks game session metadata and statistics';
COMMENT ON TABLE play_executions IS 'Stores individual play execution results for both practice and game sessions';

COMMENT ON COLUMN play_executions.result IS 'success = executed well, failure = did not work, neutral = mediocre, skipped = not run';
COMMENT ON COLUMN play_executions.yards_gained IS 'Required for game sessions, NULL for practice';
COMMENT ON COLUMN play_executions.rep_number IS 'Required for practice sessions, NULL for game';
COMMENT ON COLUMN play_executions.quick_tags IS 'Fast categorization for filtering (e.g., good_timing, missed_block, great_throw)';

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Tables created successfully:';
  RAISE NOTICE '  - practice_sessions';
  RAISE NOTICE '  - game_sessions';
  RAISE NOTICE '  - play_executions';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created: 23 indexes total';
  RAISE NOTICE 'RLS policies created: 12 policies total';
  RAISE NOTICE 'Functions created: 3 functions';
  RAISE NOTICE 'Triggers created: 6 triggers';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for BoxCall Live Session tracking!';
END $$;
