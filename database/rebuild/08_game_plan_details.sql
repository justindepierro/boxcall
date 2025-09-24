-- ===========================================
-- GAME PLAN SITUATIONS & PLAYS
-- ===========================================

CREATE TABLE game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_type TEXT NOT NULL, -- '1st_down', '2nd_down', '3rd_down', 'goal_line', etc.
  yard_line INTEGER,
  down INTEGER,
  distance INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view game situations" ON game_plan_situations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plans gp ON gp.team_id = tm.team_id
      WHERE gp.id = game_plan_situations.game_plan_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team coaches can manage game situations" ON game_plan_situations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plans gp ON gp.team_id = tm.team_id
      WHERE gp.id = game_plan_situations.game_plan_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can view game plan plays" ON game_plan_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plan_situations gps ON gps.game_plan_id = tm.team_id
      WHERE gps.id = game_plan_plays.situation_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team coaches can manage game plan plays" ON game_plan_plays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN game_plan_situations gps ON gps.game_plan_id = tm.team_id
      WHERE gps.id = game_plan_plays.situation_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );