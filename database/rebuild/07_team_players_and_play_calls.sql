-- ===========================================
-- MISSING TABLES - TEAM PLAYERS & PLAY CALLS
-- ===========================================

CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  grade_level TEXT,
  height_inches INTEGER,
  weight_lbs INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE play_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID, -- Will reference game_results when created
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  quarter INTEGER,
  time_remaining TEXT,
  yard_line INTEGER,
  down INTEGER,
  distance INTEGER,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view team players" ON team_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_players.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team coaches can manage team players" ON team_players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_players.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can view play calls" ON play_calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN plays p ON p.id = play_calls.play_id
      JOIN playbooks pb ON pb.id = p.playbook_id
      WHERE pb.team_id = tm.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team coaches can manage play calls" ON play_calls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN plays p ON p.id = play_calls.play_id
      JOIN playbooks pb ON pb.id = p.playbook_id
      WHERE pb.team_id = tm.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );