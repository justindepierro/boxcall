-- =============================================================================
-- MIGRATION 007 STEP 3: ACHIEVEMENT SYSTEM
-- Player achievements, milestones, and recognition system
-- August 7, 2025 - Phase 2 Database Implementation
-- =============================================================================

-- =============================================================================
-- PLAYER ACHIEVEMENTS - Recognition and Milestone System
-- =============================================================================

-- Enhance existing achievements table
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN (
  'performance', 'improvement', 'leadership', 'academics', 'sportsmanship', 'attendance', 'milestone'
)) DEFAULT 'performance';

ALTER TABLE achievements ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN (
  'bronze', 'silver', 'gold', 'platinum'
)) DEFAULT 'bronze';

ALTER TABLE achievements ADD COLUMN IF NOT EXISTS season_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS is_team_achievement BOOLEAN DEFAULT false;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS awarded_by TEXT; -- Coach user_id who awarded it
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS evidence_data JSONB DEFAULT '{}'; -- Supporting stats/data
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS public_recognition BOOLEAN DEFAULT true; -- Show on public profiles

-- =============================================================================
-- ACHIEVEMENT CRITERIA - Define Achievement Requirements
-- =============================================================================

CREATE TABLE achievement_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Achievement Definition
  achievement_name TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'performance', 'improvement', 'leadership', 'academics', 'sportsmanship', 'attendance', 'milestone'
  )),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN (
    'bronze', 'silver', 'gold', 'platinum'
  )),
  
  -- Requirements (stored as JSONB for flexibility)
  criteria_requirements JSONB NOT NULL, -- Specific requirements to earn achievement
  minimum_timeframe TEXT, -- 'single_game', 'weekly', 'monthly', 'season'
  position_specific TEXT[], -- Empty array means all positions eligible
  
  -- Achievement Properties
  points_value INTEGER DEFAULT 0 CHECK (points_value >= 0),
  is_repeatable BOOLEAN DEFAULT false, -- Can be earned multiple times
  is_active BOOLEAN DEFAULT true, -- Currently available to earn
  requires_coach_approval BOOLEAN DEFAULT false,
  
  -- Display Properties
  icon_name TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  display_order INTEGER DEFAULT 0,
  
  -- Achievement Metadata
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, achievement_name)
);

-- =============================================================================
-- PLAYER MILESTONES - Career Achievement Tracking
-- =============================================================================

CREATE TABLE player_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Milestone Information
  milestone_type TEXT NOT NULL CHECK (milestone_type IN (
    'career_stat', 'single_game', 'season_stat', 'academic', 'leadership', 'service'
  )),
  milestone_name TEXT NOT NULL,
  milestone_description TEXT NOT NULL,
  
  -- Achievement Data
  achieved_date DATE NOT NULL DEFAULT CURRENT_DATE,
  achieved_value TEXT NOT NULL, -- "1000 yards", "4.0 GPA", "Team Captain", etc.
  previous_record TEXT, -- Previous team/personal record if applicable
  
  -- Context
  game_context TEXT, -- If achieved during a game
  season_context TEXT, -- Season when achieved
  opposing_team TEXT, -- If relevant
  
  -- Recognition
  publicly_announced BOOLEAN DEFAULT true,
  media_coverage TEXT[], -- Links to articles, videos, etc.
  celebration_notes TEXT,
  
  -- Statistical Evidence
  supporting_stats JSONB DEFAULT '{}',
  verification_source TEXT, -- 'official_stats', 'coach_verification', 'video_evidence'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PLAYER AWARDS - External Recognition and Honors
-- =============================================================================

CREATE TABLE player_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- References auth.users
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Award Information
  award_name TEXT NOT NULL,
  award_description TEXT,
  awarding_organization TEXT NOT NULL, -- "Conference", "State Association", "Local Media", etc.
  award_level TEXT NOT NULL CHECK (award_level IN (
    'team', 'conference', 'district', 'regional', 'state', 'national'
  )),
  
  -- Award Details
  award_category TEXT, -- "Player of the Week", "All-Conference", "Academic All-State", etc.
  award_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  award_season TEXT, -- "Fall 2024", "2024-2025", etc.
  
  -- Award Criteria Met
  selection_criteria TEXT, -- What qualified the player for this award
  competition_level TEXT, -- Level of competition (varsity, JV, etc.)
  statistical_basis JSONB DEFAULT '{}', -- Stats that supported the award
  
  -- Recognition Details
  ceremony_date DATE,
  ceremony_location TEXT,
  media_announcement TEXT[],
  award_certificate_url TEXT, -- Link to digital certificate/photo
  
  -- Award Metadata
  is_team_award BOOLEAN DEFAULT false, -- Individual vs team award
  award_ranking INTEGER, -- If ranked (1st team, 2nd team, honorable mention)
  total_recipients INTEGER, -- How many players received this award
  
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY - ACHIEVEMENTS AND RECOGNITION
-- =============================================================================

-- Enable RLS on new/enhanced tables
ALTER TABLE achievement_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_awards ENABLE ROW LEVEL SECURITY;

-- Achievement Criteria - Team-based access
CREATE POLICY "achievement_criteria_team_access" ON achievement_criteria
  FOR ALL TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

-- Player Milestones - Team members read, coaches write
CREATE POLICY "player_milestones_team_read" ON player_milestones
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "player_milestones_coaches_write" ON player_milestones
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('coach', 'admin')
    )
  );

-- Player Awards - Similar policies
CREATE POLICY "player_awards_team_read" ON player_awards
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "player_awards_coaches_write" ON player_awards
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT tm.team_id FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('coach', 'admin')
    )
  );

-- =============================================================================
-- BASIC INDEXES - ACHIEVEMENTS AND RECOGNITION
-- =============================================================================

-- Achievement criteria indexes
CREATE INDEX IF NOT EXISTS idx_achievement_criteria_team_category 
  ON achievement_criteria(team_id, category, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_achievement_criteria_active 
  ON achievement_criteria(is_active, team_id) WHERE is_active = true;

-- Player milestones indexes
CREATE INDEX IF NOT EXISTS idx_player_milestones_user_date 
  ON player_milestones(user_id, achieved_date DESC);
CREATE INDEX IF NOT EXISTS idx_player_milestones_team_type 
  ON player_milestones(team_id, milestone_type, achieved_date DESC);

-- Player awards indexes
CREATE INDEX IF NOT EXISTS idx_player_awards_user_year 
  ON player_awards(user_id, award_year DESC);
CREATE INDEX IF NOT EXISTS idx_player_awards_team_level 
  ON player_awards(team_id, award_level, award_year DESC);

-- Enhanced achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category_difficulty 
  ON achievements(category, difficulty_level, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_team_public 
  ON achievements(team_id, public_recognition, earned_at DESC) WHERE public_recognition = true;

-- =============================================================================
-- STEP 3 COMPLETION STATUS
-- =============================================================================

-- Migration 007 Step 3: Achievement System
-- ✅ Enhanced achievements table with categories and difficulty levels
-- ✅ achievement_criteria table for defining requirements
-- ✅ player_milestones table for career tracking
-- ✅ player_awards table for external recognition
-- ✅ Row Level Security policies implemented
-- ✅ Basic indexes created

-- Migration 007 Complete: Player Performance & Analytics System Ready
-- 
-- SUMMARY OF TABLES CREATED/ENHANCED:
-- ✅ player_performance - Individual statistics and evaluation
-- ✅ player_progress_tracking - Long-term development monitoring
-- ✅ player_skill_assessments - Detailed skill evaluation
-- ✅ achievements (enhanced) - Recognition system with categories
-- ✅ achievement_criteria - Define achievement requirements
-- ✅ player_milestones - Career achievement tracking
-- ✅ player_awards - External recognition and honors
