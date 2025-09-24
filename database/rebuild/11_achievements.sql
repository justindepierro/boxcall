-- ===========================================
-- ACHIEVEMENTS & ANALYTICS
-- ===========================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE helmet_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_type TEXT NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE helmet_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON achievements
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own achievements" ON achievements
  FOR ALL USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can view their own helmet stickers" ON helmet_stickers
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own helmet stickers" ON helmet_stickers
  FOR ALL USING (
    user_id = auth.uid()
  );