-- ============================================================================
-- BOXCALL BULLETPROOF DATABASE - FINAL COMPREHENSIVE MIGRATION
-- ============================================================================
-- Date: December 11, 2025
-- Purpose: Ensure ALL tables exist with correct schema, RLS, and indexes
-- This migration is IDEMPOTENT - safe to run multiple times
-- Uses the bulletproof public.get_my_team_ids() function for RLS
-- ============================================================================

-- ============================================================================
-- SECTION 0: ENSURE CORE TABLES HAVE REQUIRED COLUMNS
-- ============================================================================

-- Ensure practice_scripts has team_id
ALTER TABLE practice_scripts ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Ensure playbooks has team_id  
ALTER TABLE playbooks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Ensure game_plans has team_id
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Ensure team_players has team_id
ALTER TABLE team_players ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- ============================================================================
-- SECTION 1: CORE TABLES (ensure exist with correct columns)
-- ============================================================================

-- 1.1 FORMATIONS TABLE
CREATE TABLE IF NOT EXISTS formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  diagram_data JSONB,
  personnel_packages UUID[] DEFAULT ARRAY[]::UUID[],
  formation_type TEXT DEFAULT 'offense' CHECK (formation_type IN ('offense', 'defense', 'special_teams')),
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playbook_id, name)
);

-- Add missing columns to formations
ALTER TABLE formations ADD COLUMN IF NOT EXISTS formation_type TEXT DEFAULT 'offense';
ALTER TABLE formations ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS diagram_data JSONB;
ALTER TABLE formations ADD COLUMN IF NOT EXISTS personnel_packages UUID[] DEFAULT ARRAY[]::UUID[];

-- 1.2 PERSONNEL CONFIGURATIONS TABLE  
CREATE TABLE IF NOT EXISTS personnel_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  badge_customization JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playbook_id, name)
);

-- 1.3 PERSONNEL PLAYERS TABLE
CREATE TABLE IF NOT EXISTS personnel_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES personnel_configurations(id) ON DELETE CASCADE,
  player_position TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_wildcat_qb BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(config_id, sort_order)
);

-- 1.4 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 MENTIONS TABLE
CREATE TABLE IF NOT EXISTS mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 TEAM ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS team_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 ANNOUNCEMENT REACTIONS TABLE
CREATE TABLE IF NOT EXISTS announcement_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES team_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id, reaction_type)
);

-- 1.8 ANNOUNCEMENT COMMENTS TABLE
CREATE TABLE IF NOT EXISTS announcement_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES team_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES announcement_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.9 ANNOUNCEMENT VIEWS TABLE
CREATE TABLE IF NOT EXISTS announcement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES team_announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- 1.10 COMMENT REACTIONS TABLE
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES announcement_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- 1.11 INVITATION ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS invitation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_player_id UUID NOT NULL REFERENCES team_players(id) ON DELETE CASCADE,
  invitation_type TEXT NOT NULL DEFAULT 'email',
  delivery_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 1.12 PRACTICE SCRIPT PLAYS TABLE (junction table)
CREATE TABLE IF NOT EXISTS practice_script_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES practice_scripts(id) ON DELETE CASCADE,
  play_id UUID NOT NULL REFERENCES plays(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER DEFAULT 1,
  notes TEXT,
  tempo TEXT DEFAULT 'full' CHECK (tempo IN ('full', 'half', 'walk')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(script_id, play_id)
);

-- ============================================================================
-- SECTION 2: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_script_plays ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 3: CREATE BULLETPROOF RLS POLICIES
-- Using public.get_my_team_ids() to avoid infinite recursion
-- ============================================================================

-- 3.1 FORMATIONS POLICIES
DROP POLICY IF EXISTS "formations_select" ON formations;
DROP POLICY IF EXISTS "formations_insert" ON formations;
DROP POLICY IF EXISTS "formations_update" ON formations;
DROP POLICY IF EXISTS "formations_delete" ON formations;

CREATE POLICY "formations_select" ON formations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = formations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "formations_insert" ON formations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = formations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "formations_update" ON formations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = formations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "formations_delete" ON formations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = formations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

-- 3.2 PERSONNEL CONFIGURATIONS POLICIES
DROP POLICY IF EXISTS "personnel_configs_select" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configs_insert" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configs_update" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configs_delete" ON personnel_configurations;

CREATE POLICY "personnel_configs_select" ON personnel_configurations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = personnel_configurations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "personnel_configs_insert" ON personnel_configurations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = personnel_configurations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "personnel_configs_update" ON personnel_configurations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = personnel_configurations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "personnel_configs_delete" ON personnel_configurations FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = personnel_configurations.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

-- 3.3 PERSONNEL PLAYERS POLICIES
DROP POLICY IF EXISTS "personnel_players_select" ON personnel_players;
DROP POLICY IF EXISTS "personnel_players_insert" ON personnel_players;
DROP POLICY IF EXISTS "personnel_players_update" ON personnel_players;
DROP POLICY IF EXISTS "personnel_players_delete" ON personnel_players;

CREATE POLICY "personnel_players_select" ON personnel_players FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    WHERE pc.id = personnel_players.config_id
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "personnel_players_insert" ON personnel_players FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    WHERE pc.id = personnel_players.config_id
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "personnel_players_update" ON personnel_players FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    WHERE pc.id = personnel_players.config_id
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "personnel_players_delete" ON personnel_players FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM personnel_configurations pc
    JOIN playbooks pb ON pb.id = pc.playbook_id
    WHERE pc.id = personnel_players.config_id
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

-- 3.4 NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_delete" ON notifications;

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (user_id = auth.uid() OR team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (user_id = auth.uid());

-- 3.5 MENTIONS POLICIES
DROP POLICY IF EXISTS "mentions_select" ON mentions;
DROP POLICY IF EXISTS "mentions_insert" ON mentions;

CREATE POLICY "mentions_select" ON mentions FOR SELECT USING (user_id = auth.uid() OR mentioned_by = auth.uid());
CREATE POLICY "mentions_insert" ON mentions FOR INSERT WITH CHECK (mentioned_by = auth.uid());

-- 3.6 TEAM ANNOUNCEMENTS POLICIES
DROP POLICY IF EXISTS "announcements_select" ON team_announcements;
DROP POLICY IF EXISTS "announcements_insert" ON team_announcements;
DROP POLICY IF EXISTS "announcements_update" ON team_announcements;
DROP POLICY IF EXISTS "announcements_delete" ON team_announcements;

CREATE POLICY "announcements_select" ON team_announcements FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "announcements_insert" ON team_announcements FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()) AND author_id = auth.uid());
CREATE POLICY "announcements_update" ON team_announcements FOR UPDATE USING (author_id = auth.uid() OR team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "announcements_delete" ON team_announcements FOR DELETE USING (author_id = auth.uid());

-- 3.7 ANNOUNCEMENT REACTIONS POLICIES
DROP POLICY IF EXISTS "ann_reactions_select" ON announcement_reactions;
DROP POLICY IF EXISTS "ann_reactions_insert" ON announcement_reactions;
DROP POLICY IF EXISTS "ann_reactions_delete" ON announcement_reactions;

CREATE POLICY "ann_reactions_select" ON announcement_reactions FOR SELECT USING (true);
CREATE POLICY "ann_reactions_insert" ON announcement_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ann_reactions_delete" ON announcement_reactions FOR DELETE USING (user_id = auth.uid());

-- 3.8 ANNOUNCEMENT COMMENTS POLICIES
DROP POLICY IF EXISTS "ann_comments_select" ON announcement_comments;
DROP POLICY IF EXISTS "ann_comments_insert" ON announcement_comments;
DROP POLICY IF EXISTS "ann_comments_update" ON announcement_comments;
DROP POLICY IF EXISTS "ann_comments_delete" ON announcement_comments;

CREATE POLICY "ann_comments_select" ON announcement_comments FOR SELECT USING (true);
CREATE POLICY "ann_comments_insert" ON announcement_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ann_comments_update" ON announcement_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "ann_comments_delete" ON announcement_comments FOR DELETE USING (user_id = auth.uid());

-- 3.9 ANNOUNCEMENT VIEWS POLICIES
DROP POLICY IF EXISTS "ann_views_select" ON announcement_views;
DROP POLICY IF EXISTS "ann_views_insert" ON announcement_views;

CREATE POLICY "ann_views_select" ON announcement_views FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ann_views_insert" ON announcement_views FOR INSERT WITH CHECK (user_id = auth.uid());

-- 3.10 COMMENT REACTIONS POLICIES
DROP POLICY IF EXISTS "comment_reactions_select" ON comment_reactions;
DROP POLICY IF EXISTS "comment_reactions_insert" ON comment_reactions;
DROP POLICY IF EXISTS "comment_reactions_delete" ON comment_reactions;

CREATE POLICY "comment_reactions_select" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "comment_reactions_insert" ON comment_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "comment_reactions_delete" ON comment_reactions FOR DELETE USING (user_id = auth.uid());

-- 3.11 INVITATION ATTEMPTS POLICIES
DROP POLICY IF EXISTS "invitation_attempts_select" ON invitation_attempts;
DROP POLICY IF EXISTS "invitation_attempts_insert" ON invitation_attempts;

CREATE POLICY "invitation_attempts_select" ON invitation_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_players tp
    WHERE tp.id = invitation_attempts.team_player_id
    AND tp.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "invitation_attempts_insert" ON invitation_attempts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM team_players tp
    WHERE tp.id = invitation_attempts.team_player_id
    AND tp.team_id IN (SELECT public.get_my_team_ids())
  )
);

-- 3.12 PRACTICE SCRIPT PLAYS POLICIES
DROP POLICY IF EXISTS "practice_script_plays_select" ON practice_script_plays;
DROP POLICY IF EXISTS "practice_script_plays_insert" ON practice_script_plays;
DROP POLICY IF EXISTS "practice_script_plays_update" ON practice_script_plays;
DROP POLICY IF EXISTS "practice_script_plays_delete" ON practice_script_plays;

CREATE POLICY "practice_script_plays_select" ON practice_script_plays FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM practice_scripts ps
    WHERE ps.id = practice_script_plays.script_id
    AND ps.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "practice_script_plays_insert" ON practice_script_plays FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM practice_scripts ps
    WHERE ps.id = practice_script_plays.script_id
    AND ps.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "practice_script_plays_update" ON practice_script_plays FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM practice_scripts ps
    WHERE ps.id = practice_script_plays.script_id
    AND ps.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "practice_script_plays_delete" ON practice_script_plays FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM practice_scripts ps
    WHERE ps.id = practice_script_plays.script_id
    AND ps.team_id IN (SELECT public.get_my_team_ids())
  )
);

-- ============================================================================
-- SECTION 4: PERFORMANCE INDEXES
-- ============================================================================

-- Formations indexes
CREATE INDEX IF NOT EXISTS idx_formations_playbook ON formations(playbook_id);
CREATE INDEX IF NOT EXISTS idx_formations_type ON formations(formation_type);

-- Personnel indexes
CREATE INDEX IF NOT EXISTS idx_personnel_configs_playbook ON personnel_configurations(playbook_id);
CREATE INDEX IF NOT EXISTS idx_personnel_players_config ON personnel_players(config_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_team ON notifications(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

-- Mentions indexes
CREATE INDEX IF NOT EXISTS idx_mentions_user ON mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_entity ON mentions(entity_type, entity_id);

-- Team announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_team ON team_announcements(team_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author ON team_announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON team_announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON team_announcements(team_id, is_pinned) WHERE is_pinned = true;

-- Announcement reactions indexes
CREATE INDEX IF NOT EXISTS idx_ann_reactions_announcement ON announcement_reactions(announcement_id);
CREATE INDEX IF NOT EXISTS idx_ann_reactions_user ON announcement_reactions(user_id);

-- Announcement comments indexes
CREATE INDEX IF NOT EXISTS idx_ann_comments_announcement ON announcement_comments(announcement_id);
CREATE INDEX IF NOT EXISTS idx_ann_comments_user ON announcement_comments(user_id);

-- Comment reactions indexes
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);

-- Practice script plays indexes
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_script ON practice_script_plays(script_id);
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_play ON practice_script_plays(play_id);
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_order ON practice_script_plays(script_id, sort_order);

-- Invitation attempts indexes
CREATE INDEX IF NOT EXISTS idx_invitation_attempts_player ON invitation_attempts(team_player_id);

-- ============================================================================
-- SECTION 5: UPDATE EXISTING CORE TABLE RLS TO USE BULLETPROOF FUNCTION
-- ============================================================================

-- Update plays table RLS
DROP POLICY IF EXISTS "plays_select_bulletproof" ON plays;
DROP POLICY IF EXISTS "plays_insert_bulletproof" ON plays;
DROP POLICY IF EXISTS "plays_update_bulletproof" ON plays;
DROP POLICY IF EXISTS "plays_delete_bulletproof" ON plays;

CREATE POLICY "plays_select_bulletproof" ON plays FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = plays.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "plays_insert_bulletproof" ON plays FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = plays.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "plays_update_bulletproof" ON plays FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = plays.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

CREATE POLICY "plays_delete_bulletproof" ON plays FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM playbooks pb 
    WHERE pb.id = plays.playbook_id 
    AND pb.team_id IN (SELECT public.get_my_team_ids())
  )
);

-- Update playbooks table RLS
DROP POLICY IF EXISTS "playbooks_select_bulletproof" ON playbooks;
DROP POLICY IF EXISTS "playbooks_insert_bulletproof" ON playbooks;
DROP POLICY IF EXISTS "playbooks_update_bulletproof" ON playbooks;
DROP POLICY IF EXISTS "playbooks_delete_bulletproof" ON playbooks;

CREATE POLICY "playbooks_select_bulletproof" ON playbooks FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "playbooks_insert_bulletproof" ON playbooks FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "playbooks_update_bulletproof" ON playbooks FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "playbooks_delete_bulletproof" ON playbooks FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- Update game_plans table RLS
DROP POLICY IF EXISTS "game_plans_select_bulletproof" ON game_plans;
DROP POLICY IF EXISTS "game_plans_insert_bulletproof" ON game_plans;
DROP POLICY IF EXISTS "game_plans_update_bulletproof" ON game_plans;
DROP POLICY IF EXISTS "game_plans_delete_bulletproof" ON game_plans;

CREATE POLICY "game_plans_select_bulletproof" ON game_plans FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_plans_insert_bulletproof" ON game_plans FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_plans_update_bulletproof" ON game_plans FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_plans_delete_bulletproof" ON game_plans FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- Update practice_scripts table RLS
DROP POLICY IF EXISTS "practice_scripts_select_bulletproof" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_insert_bulletproof" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_update_bulletproof" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_delete_bulletproof" ON practice_scripts;

CREATE POLICY "practice_scripts_select_bulletproof" ON practice_scripts FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_scripts_insert_bulletproof" ON practice_scripts FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_scripts_update_bulletproof" ON practice_scripts FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_scripts_delete_bulletproof" ON practice_scripts FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- Update team_players table RLS
DROP POLICY IF EXISTS "team_players_select_bulletproof" ON team_players;
DROP POLICY IF EXISTS "team_players_insert_bulletproof" ON team_players;
DROP POLICY IF EXISTS "team_players_update_bulletproof" ON team_players;
DROP POLICY IF EXISTS "team_players_delete_bulletproof" ON team_players;

CREATE POLICY "team_players_select_bulletproof" ON team_players FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "team_players_insert_bulletproof" ON team_players FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "team_players_update_bulletproof" ON team_players FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "team_players_delete_bulletproof" ON team_players FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- ============================================================================
-- DONE!
-- ============================================================================

-- ============================================================================
-- SECTION 6: ANALYTICS VIEWS
-- These are READ-ONLY views for analytics and audit purposes
-- NOTE: Run these ONLY if the base tables exist with correct columns
-- ============================================================================

-- First ensure game_sessions has the 'opponent' column (it might be 'opponent_name')
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_sessions' AND column_name = 'opponent') THEN
    ALTER TABLE game_sessions ADD COLUMN opponent TEXT;
  END IF;
END $$;

-- 6.1 GAME PLANS ENHANCED VIEW (joins game_plans with related data)
DROP VIEW IF EXISTS game_plans_enhanced;
CREATE VIEW game_plans_enhanced AS
SELECT 
  gp.*,
  t.name as team_name,
  (SELECT COUNT(*) FROM game_plan_situations gps WHERE gps.game_plan_id = gp.id) as situation_count,
  (SELECT COUNT(*) FROM game_plan_plays gpp 
   JOIN game_plan_situations gps ON gps.id = gpp.situation_id 
   WHERE gps.game_plan_id = gp.id) as total_plays
FROM game_plans gp
JOIN teams t ON t.id = gp.team_id;

-- 6.2 GAME PLAN ANALYTICS VIEW
DROP VIEW IF EXISTS game_plan_analytics;
CREATE VIEW game_plan_analytics AS
SELECT 
  gp.id as game_plan_id,
  gp.team_id,
  gp.name as game_plan_name,
  gp.opponent,
  gp.game_date,
  COUNT(DISTINCT gps.id) as situation_count,
  COUNT(gpp.id) as total_plays,
  gp.created_at,
  gp.updated_at
FROM game_plans gp
LEFT JOIN game_plan_situations gps ON gps.game_plan_id = gp.id
LEFT JOIN game_plan_plays gpp ON gpp.situation_id = gps.id
GROUP BY gp.id, gp.team_id, gp.name, gp.opponent, gp.game_date, gp.created_at, gp.updated_at;

-- 6.3 PLAYS MISSING FORMATION LINK (audit view)
DROP VIEW IF EXISTS plays_missing_formation_link;
CREATE VIEW plays_missing_formation_link AS
SELECT 
  p.id,
  p.name as play_name,
  p.formation as formation_text,
  p.playbook_id,
  f.id as matching_formation_id,
  f.name as matching_formation_name
FROM plays p
LEFT JOIN formations f ON f.playbook_id = p.playbook_id AND LOWER(f.name) = LOWER(p.formation)
WHERE p.formation_id IS NULL
AND p.formation IS NOT NULL
AND p.formation != '';

-- 6.4 PLAYS MISSING PERSONNEL LINK (audit view)
DROP VIEW IF EXISTS plays_missing_personnel_link;
CREATE VIEW plays_missing_personnel_link AS
SELECT 
  p.id,
  p.name as play_name,
  p.personnel as personnel_text,
  p.playbook_id,
  pc.id as matching_personnel_id,
  pc.name as matching_personnel_name
FROM plays p
LEFT JOIN personnel_configurations pc ON pc.playbook_id = p.playbook_id AND LOWER(pc.name) = LOWER(p.personnel)
WHERE p.personnel_id IS NULL
AND p.personnel IS NOT NULL
AND p.personnel != '';

-- 6.5 FORMATIONS MISSING PERSONNEL (audit view)
DROP VIEW IF EXISTS formations_missing_personnel;
CREATE VIEW formations_missing_personnel AS
SELECT 
  f.id,
  f.name,
  f.playbook_id,
  f.formation_type as category,
  NULL::text as direction,
  (SELECT COUNT(*) FROM plays p WHERE p.formation_id = f.id) as usage_count
FROM formations f
WHERE array_length(f.personnel_packages, 1) IS NULL 
   OR array_length(f.personnel_packages, 1) = 0;

-- 6.6 ORPHANED PERSONNEL CONFIGS (audit view)
DROP VIEW IF EXISTS orphaned_personnel_configs;
CREATE VIEW orphaned_personnel_configs AS
SELECT 
  pc.id,
  pc.name,
  pc.playbook_id,
  (SELECT COUNT(*) FROM plays p WHERE p.personnel_id = pc.id) as play_count,
  (SELECT COUNT(*) FROM formations f WHERE pc.id = ANY(f.personnel_packages)) as formation_count
FROM personnel_configurations pc
WHERE NOT EXISTS (
  SELECT 1 FROM plays p WHERE p.personnel_id = pc.id
)
AND NOT EXISTS (
  SELECT 1 FROM formations f WHERE pc.id = ANY(f.personnel_packages)
);

-- 6.7 LIVE SESSIONS VIEW (unified view of practice + game sessions)
DROP VIEW IF EXISTS live_sessions;
CREATE VIEW live_sessions AS
SELECT 
  id,
  team_id,
  'practice'::text as session_type,
  name,
  session_mode,
  session_date::timestamp as created_at,
  started_at,
  ended_at,
  NULL::text as opponent,
  notes,
  is_archived
FROM practice_sessions
UNION ALL
SELECT 
  id,
  team_id,
  'game'::text as session_type,
  COALESCE(opponent, 'Game') as name,
  session_mode,
  game_date::timestamp as created_at,
  started_at,
  ended_at,
  opponent,
  notes,
  is_archived
FROM game_sessions;

-- ============================================================================
-- SECTION 7: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add formation_id to plays if missing (for linking)
ALTER TABLE plays ADD COLUMN IF NOT EXISTS formation_id UUID REFERENCES formations(id) ON DELETE SET NULL;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS personnel_id UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL;

-- Create indexes for the new FK columns
CREATE INDEX IF NOT EXISTS idx_plays_formation_id ON plays(formation_id);
CREATE INDEX IF NOT EXISTS idx_plays_personnel_id ON plays(personnel_id);

-- ============================================================================
-- FINAL SUCCESS MESSAGE
-- ============================================================================

SELECT 'SUCCESS: Bulletproof database migration complete!' as result;
