-- Migration: Create game plans system with Billick situational organization
-- Date: 2025-10-19
-- Purpose: Enable coaches to create game plans organized by down/distance/field zone

-- ===========================================
-- GAME PLANS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS game_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "vs. Central High - Week 8"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add optional columns separately to avoid any potential issues
ALTER TABLE game_plans 
  ADD COLUMN IF NOT EXISTS opponent TEXT;

ALTER TABLE game_plans 
  ADD COLUMN IF NOT EXISTS game_date DATE;

ALTER TABLE game_plans 
  ADD COLUMN IF NOT EXISTS game_location TEXT;

ALTER TABLE game_plans 
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE game_plans 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

ALTER TABLE game_plans 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Set created_by to the team's first coach for any existing records without it
UPDATE game_plans gp
SET created_by = (
  SELECT tm.user_id 
  FROM team_members tm 
  WHERE tm.team_id = gp.team_id 
    AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    AND tm.status = 'active'
  LIMIT 1
)
WHERE created_by IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_plans_team_id ON game_plans(team_id);
CREATE INDEX IF NOT EXISTS idx_game_plans_game_date ON game_plans(game_date);
CREATE INDEX IF NOT EXISTS idx_game_plans_created_by ON game_plans(created_by);

-- Add RLS policies
ALTER TABLE game_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view game plans for their team
CREATE POLICY game_plans_select ON game_plans
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Coaches can insert game plans
CREATE POLICY game_plans_insert ON game_plans
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- Policy: Coaches can update game plans
CREATE POLICY game_plans_update ON game_plans
  FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- Policy: Coaches can delete game plans
CREATE POLICY game_plans_delete ON game_plans
  FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
    )
  );

-- ===========================================
-- GAME PLAN SITUATIONS TABLE (Billick Method)
-- ===========================================

CREATE TABLE IF NOT EXISTS game_plan_situations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_plan_id UUID NOT NULL REFERENCES game_plans(id) ON DELETE CASCADE,
  situation_type TEXT NOT NULL CHECK (situation_type IN (
    'first_and_10',
    'second_and_short',     -- 2nd & 1-3
    'second_and_medium',    -- 2nd & 4-7
    'second_and_long',      -- 2nd & 8+
    'third_and_short',      -- 3rd & 1-3
    'third_and_medium',     -- 3rd & 4-7
    'third_and_long',       -- 3rd & 8+
    'red_zone',             -- Inside 20
    'goal_line',            -- Inside 5
    'two_minute_drill',
    'short_yardage',        -- 4th & 1-2
    'situational'           -- Trick plays, special situations
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique situation per game plan
  UNIQUE(game_plan_id, situation_type)
);

-- Add optional columns separately
ALTER TABLE game_plan_situations 
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE game_plan_situations 
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_plan_situations_game_plan_id 
  ON game_plan_situations(game_plan_id);
  
CREATE INDEX IF NOT EXISTS idx_game_plan_situations_order 
  ON game_plan_situations(game_plan_id, display_order);

-- Add RLS policies
ALTER TABLE game_plan_situations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view situations for their team's game plans
CREATE POLICY game_plan_situations_select ON game_plan_situations
  FOR SELECT
  USING (
    game_plan_id IN (
      SELECT id FROM game_plans
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Coaches can insert situations
CREATE POLICY game_plan_situations_insert ON game_plan_situations
  FOR INSERT
  WITH CHECK (
    game_plan_id IN (
      SELECT id FROM game_plans
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
          AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      )
    )
  );

-- Policy: Coaches can update situations
CREATE POLICY game_plan_situations_update ON game_plan_situations
  FOR UPDATE
  USING (
    game_plan_id IN (
      SELECT id FROM game_plans
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
          AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      )
    )
  );

-- Policy: Coaches can delete situations
CREATE POLICY game_plan_situations_delete ON game_plan_situations
  FOR DELETE
  USING (
    game_plan_id IN (
      SELECT id FROM game_plans
      WHERE team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
          AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
      )
    )
  );

-- ===========================================
-- GAME PLAN PLAYS TABLE (Junction)
-- ===========================================

CREATE TABLE IF NOT EXISTS game_plan_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  situation_id UUID NOT NULL REFERENCES game_plan_situations(id) ON DELETE CASCADE,
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 1, -- Display order within situation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Allow same play in different situations, but not duplicates in same situation
  UNIQUE(situation_id, play_id)
);

-- Add optional columns separately
ALTER TABLE game_plan_plays 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_situation_id 
  ON game_plan_plays(situation_id);
  
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_play_id 
  ON game_plan_plays(play_id);
  
CREATE INDEX IF NOT EXISTS idx_game_plan_plays_priority 
  ON game_plan_plays(situation_id, priority);

-- Add RLS policies
ALTER TABLE game_plan_plays ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view plays in game plans for their team
CREATE POLICY game_plan_plays_select ON game_plan_plays
  FOR SELECT
  USING (
    situation_id IN (
      SELECT id FROM game_plan_situations
      WHERE game_plan_id IN (
        SELECT id FROM game_plans
        WHERE team_id IN (
          SELECT team_id FROM team_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy: Coaches can insert plays into game plans
CREATE POLICY game_plan_plays_insert ON game_plan_plays
  FOR INSERT
  WITH CHECK (
    situation_id IN (
      SELECT id FROM game_plan_situations
      WHERE game_plan_id IN (
        SELECT id FROM game_plans
        WHERE team_id IN (
          SELECT team_id FROM team_members
          WHERE user_id = auth.uid()
            AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        )
      )
    )
  );

-- Policy: Coaches can update plays in game plans
CREATE POLICY game_plan_plays_update ON game_plan_plays
  FOR UPDATE
  USING (
    situation_id IN (
      SELECT id FROM game_plan_situations
      WHERE game_plan_id IN (
        SELECT id FROM game_plans
        WHERE team_id IN (
          SELECT team_id FROM team_members
          WHERE user_id = auth.uid()
            AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        )
      )
    )
  );

-- Policy: Coaches can delete plays from game plans
CREATE POLICY game_plan_plays_delete ON game_plan_plays
  FOR DELETE
  USING (
    situation_id IN (
      SELECT id FROM game_plan_situations
      WHERE game_plan_id IN (
        SELECT id FROM game_plans
        WHERE team_id IN (
          SELECT team_id FROM team_members
          WHERE user_id = auth.uid()
            AND team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        )
      )
    )
  );

-- ===========================================
-- COMMENTS & DOCUMENTATION
-- ===========================================

COMMENT ON TABLE game_plans IS 'Game plans organized by Billick situational method (down/distance/field zone)';
COMMENT ON TABLE game_plan_situations IS 'Billick situations (1st & 10, 3rd & Short, Red Zone, etc.) within a game plan';
COMMENT ON TABLE game_plan_plays IS 'Junction table linking plays to game plan situations with priority ordering';

COMMENT ON COLUMN game_plans.opponent IS 'Name of opposing team';
COMMENT ON COLUMN game_plans.game_date IS 'Date of the game';
COMMENT ON COLUMN game_plans.game_location IS 'Home/Away/Neutral site';
COMMENT ON COLUMN game_plan_situations.situation_type IS 'Billick situation category (12 standard types)';
COMMENT ON COLUMN game_plan_situations.display_order IS 'Order to display situations in UI';
COMMENT ON COLUMN game_plan_plays.priority IS 'Priority/order of play within situation (1 = highest priority)';
