-- 🚀 BoxCall Database Migration for 300+ Play Testing
-- Run this in Supabase SQL Editor to upgrade your existing database

-- ==============================================
-- PHASE 1: ENHANCE EXISTING TABLES
-- ==============================================

-- 1. Enhance PLAYS table for 300+ play performance
ALTER TABLE plays ADD COLUMN IF NOT EXISTS one_word_play TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS complexity_score INTEGER;

-- Update the p_type constraint to include 'Play Action'
ALTER TABLE plays DROP CONSTRAINT IF EXISTS plays_p_type_check;
ALTER TABLE plays ADD CONSTRAINT plays_p_type_check 
CHECK (p_type = ANY(ARRAY['Pass'::text, 'Run'::text, 'RPO'::text, 'Play Action'::text]));

-- Add full-text search capability (CRITICAL for 300+ plays)
ALTER TABLE plays ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  to_tsvector('english', 
    COALESCE(play_name, '') || ' ' || 
    COALESCE(formation, '') || ' ' || 
    COALESCE(p_type, '') || ' ' ||
    COALESCE(notes, '')
  )
) STORED;

-- 2. Enhance PRACTICE_SCRIPTS table for timeline building
ALTER TABLE practice_scripts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE practice_scripts ADD COLUMN IF NOT EXISTS date_planned DATE;
ALTER TABLE practice_scripts ADD COLUMN IF NOT EXISTS total_duration INTEGER;
ALTER TABLE practice_scripts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE practice_scripts ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;

-- 3. Update SCRIPT_PLAYS for consistency (rename columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'script_plays' AND column_name = 'order_index') THEN
    ALTER TABLE script_plays RENAME COLUMN order_index TO order_number;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'script_plays' AND column_name = 'reps') THEN
    ALTER TABLE script_plays RENAME COLUMN reps TO repetitions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'script_plays' AND column_name = 'estimated_time_minutes') THEN
    ALTER TABLE script_plays RENAME COLUMN estimated_time_minutes TO estimated_time;
  END IF;
END $$;

-- ==============================================
-- PHASE 2: ADD GAME PLANNING TABLES (Brian Billick Methodology)
-- ==============================================

-- 1. Game Plans table
CREATE TABLE IF NOT EXISTS game_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  week_number INTEGER,
  opponent TEXT,
  game_date DATE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  total_plays INTEGER DEFAULT 0
);

-- 2. Game Plan Situations (situational categories)
CREATE TABLE IF NOT EXISTS game_plan_situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_plan_id UUID REFERENCES game_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "1st & 10", "Red Zone", etc.
  description TEXT,
  category TEXT NOT NULL, -- "down_distance", "red_zone", "special"
  priority INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Game Plan Plays (junction with priorities)
CREATE TABLE IF NOT EXISTS game_plan_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID REFERENCES plays(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5), -- 1=primary, 5=check-down
  notes TEXT,
  times_used INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(situation_id, play_id)
);

-- ==============================================
-- PHASE 3: PERFORMANCE INDEXES (Critical for 300+ plays)
-- ==============================================

-- Full-text search index (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_plays_search ON plays USING GIN(search_vector);

-- Performance indexes for plays
CREATE INDEX IF NOT EXISTS idx_plays_archived ON plays(playbook_id, p_type) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_plays_updated_performance ON plays(updated_at DESC) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_plays_complexity ON plays(complexity_score) WHERE complexity_score IS NOT NULL;

-- Practice script indexes
CREATE INDEX IF NOT EXISTS idx_practice_scripts_team_date ON practice_scripts(team_id, date_planned DESC);
CREATE INDEX IF NOT EXISTS idx_script_plays_order ON script_plays(script_id, order_number);

-- Game plan indexes
CREATE INDEX IF NOT EXISTS idx_game_plans_team_week ON game_plans(team_id, week_number DESC);
CREATE INDEX IF NOT EXISTS idx_game_plan_situations_plan ON game_plan_situations(game_plan_id, category);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_priority ON game_plan_plays(situation_id, priority);
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_play ON game_plan_plays(play_id);

-- ==============================================
-- PHASE 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;

-- Game Plans policies
CREATE POLICY "game_plans_team_access" ON game_plans
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Game Plan Situations policies
CREATE POLICY "game_plan_situations_team_access" ON game_plan_situations
  FOR ALL USING (
    game_plan_id IN (
      SELECT id FROM game_plans WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Game Plan Plays policies
CREATE POLICY "game_plan_plays_team_access" ON game_plan_plays
  FOR ALL USING (
    situation_id IN (
      SELECT gs.id FROM game_plan_situations gs
      JOIN game_plans gp ON gs.game_plan_id = gp.id
      WHERE gp.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- ==============================================
-- PHASE 5: SEED DEFAULT GAME PLAN SITUATIONS
-- ==============================================

-- Function to create default situations for any new game plan
CREATE OR REPLACE FUNCTION create_default_game_plan_situations(plan_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Down & Distance situations
  INSERT INTO game_plan_situations (game_plan_id, name, description, category) VALUES
  (plan_id, '1st & 10', 'First down, 10 yards to go', 'down_distance'),
  (plan_id, '2nd & Short', 'Second down, 1-3 yards', 'down_distance'),
  (plan_id, '2nd & Medium', 'Second down, 4-7 yards', 'down_distance'),
  (plan_id, '2nd & Long', 'Second down, 8+ yards', 'down_distance'),
  (plan_id, '3rd & Short', 'Third down, 1-3 yards', 'down_distance'),
  (plan_id, '3rd & Medium', 'Third down, 4-7 yards', 'down_distance'),
  (plan_id, '3rd & Long', 'Third down, 8+ yards', 'down_distance'),
  (plan_id, '4th Down', 'Fourth down situations', 'down_distance'),
  
  -- Red Zone situations
  (plan_id, 'Red Zone', 'Inside 20-yard line', 'red_zone'),
  (plan_id, 'Goal Line', 'Inside 5-yard line', 'red_zone'),
  (plan_id, 'Plus Territory', '20-35 yard line', 'red_zone'),
  
  -- Special situations
  (plan_id, 'Two Minute', 'End of half/game', 'special'),
  (plan_id, 'Short Yardage', 'Need 1-2 yards', 'special'),
  (plan_id, 'Backed Up', 'Inside own 10-yard line', 'special'),
  (plan_id, 'Trick Plays', 'Special gadget plays', 'special');
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- PHASE 6: UPDATE TRIGGERS
-- ==============================================

-- Update game plan updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to game_plans if trigger doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_game_plans_updated_at') THEN
    CREATE TRIGGER trigger_game_plans_updated_at
      BEFORE UPDATE ON game_plans
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ==============================================
-- MIGRATION COMPLETE!
-- ==============================================

-- Verify the migration
DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Count core tables
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('teams', 'playbooks', 'plays', 'practice_scripts', 'script_plays', 'game_plans', 'game_plan_situations', 'game_plan_plays');
  
  -- Count performance indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_plays_search%';
  
  RAISE NOTICE '✅ Migration Complete!';
  RAISE NOTICE '📊 Core Tables: % (should be 8)', table_count;
  RAISE NOTICE '🔍 Search Indexes: % (should be 1+)', index_count;
  RAISE NOTICE '🚀 Ready for 300+ play testing!';
END $$;
