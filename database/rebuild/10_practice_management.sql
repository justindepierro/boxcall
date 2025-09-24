-- ===========================================
-- PRACTICE MANAGEMENT TABLES
-- ===========================================

CREATE TABLE practice_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE practice_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practice_schedules(id) ON DELETE CASCADE,
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE practice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- minutes
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE practice_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view practice scripts" ON practice_scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_scripts.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team coaches can manage practice scripts" ON practice_scripts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_scripts.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can view practice attendance" ON practice_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN practice_schedules ps ON ps.team_id = tm.team_id
      WHERE ps.id = practice_attendance.practice_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team coaches can manage practice attendance" ON practice_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN practice_schedules ps ON ps.team_id = tm.team_id
      WHERE ps.id = practice_attendance.practice_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );

CREATE POLICY "Team members can view practice templates" ON practice_templates
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND is_active = true
    ) OR is_public = true
  );

CREATE POLICY "Team coaches can manage practice templates" ON practice_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = practice_templates.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('head_coach', 'assistant_coach', 'coordinator')
      AND tm.is_active = true
    )
  );