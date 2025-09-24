-- ===========================================
-- GAME RESULTS
-- ===========================================

CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  game_date DATE NOT NULL,
  our_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  result TEXT CHECK (result IN ('win', 'loss', 'tie')),
  venue TEXT,
  home_away TEXT CHECK (home_away IN ('home', 'away')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view game results" ON game_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_results.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team coaches can manage game results" ON game_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = game_results.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );

-- Update play_calls to reference game_results
ALTER TABLE play_calls ADD CONSTRAINT fk_play_calls_game_id
  FOREIGN KEY (game_id) REFERENCES game_results(id) ON DELETE CASCADE;