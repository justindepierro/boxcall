-- ============================================================================
-- BOXCALL BULLETPROOF DATABASE - PART 4: CORE TABLE RLS & ANALYTICS VIEWS
-- ============================================================================
-- Run this FOURTH to update core table RLS and create analytics views
-- ============================================================================

-- ============================================================================
-- SECTION 1: UPDATE CORE TABLE RLS TO USE BULLETPROOF FUNCTION
-- ============================================================================

-- PLAYS TABLE RLS
DROP POLICY IF EXISTS "plays_select_bulletproof" ON plays;
DROP POLICY IF EXISTS "plays_insert_bulletproof" ON plays;
DROP POLICY IF EXISTS "plays_update_bulletproof" ON plays;
DROP POLICY IF EXISTS "plays_delete_bulletproof" ON plays;
-- Drop old policies
DROP POLICY IF EXISTS "Team members can view plays" ON plays;
DROP POLICY IF EXISTS "Team members can create plays" ON plays;
DROP POLICY IF EXISTS "Team members can update plays" ON plays;
DROP POLICY IF EXISTS "Team members can delete plays" ON plays;
DROP POLICY IF EXISTS "plays_team_select" ON plays;
DROP POLICY IF EXISTS "plays_team_insert" ON plays;
DROP POLICY IF EXISTS "plays_team_update" ON plays;
DROP POLICY IF EXISTS "plays_team_delete" ON plays;

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

-- PLAYBOOKS TABLE RLS
DROP POLICY IF EXISTS "playbooks_select_bulletproof" ON playbooks;
DROP POLICY IF EXISTS "playbooks_insert_bulletproof" ON playbooks;
DROP POLICY IF EXISTS "playbooks_update_bulletproof" ON playbooks;
DROP POLICY IF EXISTS "playbooks_delete_bulletproof" ON playbooks;
-- Drop old policies
DROP POLICY IF EXISTS "Team members can view playbooks" ON playbooks;
DROP POLICY IF EXISTS "Team members can create playbooks" ON playbooks;
DROP POLICY IF EXISTS "Team members can update playbooks" ON playbooks;
DROP POLICY IF EXISTS "Team members can delete playbooks" ON playbooks;
DROP POLICY IF EXISTS "playbooks_team_select" ON playbooks;
DROP POLICY IF EXISTS "playbooks_team_insert" ON playbooks;
DROP POLICY IF EXISTS "playbooks_team_update" ON playbooks;
DROP POLICY IF EXISTS "playbooks_team_delete" ON playbooks;

CREATE POLICY "playbooks_select_bulletproof" ON playbooks FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "playbooks_insert_bulletproof" ON playbooks FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "playbooks_update_bulletproof" ON playbooks FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "playbooks_delete_bulletproof" ON playbooks FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- GAME_PLANS TABLE RLS
DROP POLICY IF EXISTS "game_plans_select_bulletproof" ON game_plans;
DROP POLICY IF EXISTS "game_plans_insert_bulletproof" ON game_plans;
DROP POLICY IF EXISTS "game_plans_update_bulletproof" ON game_plans;
DROP POLICY IF EXISTS "game_plans_delete_bulletproof" ON game_plans;
-- Drop old policies
DROP POLICY IF EXISTS "Team members can view game plans" ON game_plans;
DROP POLICY IF EXISTS "Team members can create game plans" ON game_plans;
DROP POLICY IF EXISTS "Team members can update game plans" ON game_plans;
DROP POLICY IF EXISTS "Team members can delete game plans" ON game_plans;
DROP POLICY IF EXISTS "game_plans_team_select" ON game_plans;
DROP POLICY IF EXISTS "game_plans_team_insert" ON game_plans;
DROP POLICY IF EXISTS "game_plans_team_update" ON game_plans;
DROP POLICY IF EXISTS "game_plans_team_delete" ON game_plans;

CREATE POLICY "game_plans_select_bulletproof" ON game_plans FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_plans_insert_bulletproof" ON game_plans FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_plans_update_bulletproof" ON game_plans FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "game_plans_delete_bulletproof" ON game_plans FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- PRACTICE_SCRIPTS TABLE RLS
DROP POLICY IF EXISTS "practice_scripts_select_bulletproof" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_insert_bulletproof" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_update_bulletproof" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_delete_bulletproof" ON practice_scripts;
-- Drop old policies
DROP POLICY IF EXISTS "Team members can view practice scripts" ON practice_scripts;
DROP POLICY IF EXISTS "Team members can create practice scripts" ON practice_scripts;
DROP POLICY IF EXISTS "Team members can update practice scripts" ON practice_scripts;
DROP POLICY IF EXISTS "Team members can delete practice scripts" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_team_select" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_team_insert" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_team_update" ON practice_scripts;
DROP POLICY IF EXISTS "practice_scripts_team_delete" ON practice_scripts;

CREATE POLICY "practice_scripts_select_bulletproof" ON practice_scripts FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_scripts_insert_bulletproof" ON practice_scripts FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_scripts_update_bulletproof" ON practice_scripts FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "practice_scripts_delete_bulletproof" ON practice_scripts FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- TEAM_PLAYERS TABLE RLS
DROP POLICY IF EXISTS "team_players_select_bulletproof" ON team_players;
DROP POLICY IF EXISTS "team_players_insert_bulletproof" ON team_players;
DROP POLICY IF EXISTS "team_players_update_bulletproof" ON team_players;
DROP POLICY IF EXISTS "team_players_delete_bulletproof" ON team_players;
-- Drop old policies
DROP POLICY IF EXISTS "Team members can view team players" ON team_players;
DROP POLICY IF EXISTS "Team members can create team players" ON team_players;
DROP POLICY IF EXISTS "Team members can update team players" ON team_players;
DROP POLICY IF EXISTS "Team members can delete team players" ON team_players;
DROP POLICY IF EXISTS "team_players_team_select" ON team_players;
DROP POLICY IF EXISTS "team_players_team_insert" ON team_players;
DROP POLICY IF EXISTS "team_players_team_update" ON team_players;
DROP POLICY IF EXISTS "team_players_team_delete" ON team_players;

CREATE POLICY "team_players_select_bulletproof" ON team_players FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "team_players_insert_bulletproof" ON team_players FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "team_players_update_bulletproof" ON team_players FOR UPDATE USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "team_players_delete_bulletproof" ON team_players FOR DELETE USING (team_id IN (SELECT public.get_my_team_ids()));

-- TEAMS TABLE RLS (special - users see teams they belong to)
DROP POLICY IF EXISTS "teams_select_bulletproof" ON teams;
DROP POLICY IF EXISTS "teams_update_bulletproof" ON teams;
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update teams" ON teams;

CREATE POLICY "teams_select_bulletproof" ON teams FOR SELECT USING (id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "teams_update_bulletproof" ON teams FOR UPDATE USING (id IN (SELECT public.get_my_team_ids()));

-- ============================================================================
-- SECTION 2: ADD MISSING COLUMNS TO PLAYS TABLE
-- ============================================================================

-- Add formation_id to plays if missing (for linking to formations table)
ALTER TABLE plays ADD COLUMN IF NOT EXISTS formation_id UUID REFERENCES formations(id) ON DELETE SET NULL;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS personnel_id UUID REFERENCES personnel_configurations(id) ON DELETE SET NULL;

-- Create indexes for the new FK columns
CREATE INDEX IF NOT EXISTS idx_plays_formation_id ON plays(formation_id);
CREATE INDEX IF NOT EXISTS idx_plays_personnel_id ON plays(personnel_id);

-- ============================================================================
-- SECTION 3: ANALYTICS VIEWS
-- These are READ-ONLY views for analytics and audit purposes
-- ============================================================================

-- 3.1 GAME PLANS ENHANCED VIEW (joins game_plans with related data)
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

-- 3.2 GAME PLAN ANALYTICS VIEW
DROP VIEW IF EXISTS game_plan_analytics;
CREATE VIEW game_plan_analytics AS
SELECT 
  gp.id as game_plan_id,
  gp.team_id,
  gp.opponent,
  gp.game_date,
  COUNT(DISTINCT gps.id) as situation_count,
  COUNT(gpp.id) as total_plays,
  gp.created_at,
  gp.updated_at
FROM game_plans gp
LEFT JOIN game_plan_situations gps ON gps.game_plan_id = gp.id
LEFT JOIN game_plan_plays gpp ON gpp.situation_id = gps.id
GROUP BY gp.id, gp.team_id, gp.opponent, gp.game_date, gp.created_at, gp.updated_at;

-- 3.3 PLAYS MISSING FORMATION LINK (audit view)
DROP VIEW IF EXISTS plays_missing_formation_link;
CREATE VIEW plays_missing_formation_link AS
SELECT 
  p.id,
  p.play_name,
  p.formation as formation_text,
  p.playbook_id,
  f.id as matching_formation_id,
  f.name as matching_formation_name
FROM plays p
LEFT JOIN formations f ON f.playbook_id = p.playbook_id AND LOWER(f.name) = LOWER(p.formation)
WHERE p.formation_id IS NULL
AND p.formation IS NOT NULL
AND p.formation != '';

-- 3.4 PLAYS MISSING PERSONNEL LINK (audit view)
DROP VIEW IF EXISTS plays_missing_personnel_link;
CREATE VIEW plays_missing_personnel_link AS
SELECT 
  p.id,
  p.play_name,
  p.personnel as personnel_text,
  p.playbook_id,
  pc.id as matching_personnel_id,
  pc.name as matching_personnel_name
FROM plays p
LEFT JOIN personnel_configurations pc ON pc.playbook_id = p.playbook_id AND LOWER(pc.name) = LOWER(p.personnel)
WHERE p.personnel_id IS NULL
AND p.personnel IS NOT NULL
AND p.personnel != '';

-- 3.5 FORMATIONS MISSING PERSONNEL (audit view)
DROP VIEW IF EXISTS formations_missing_personnel;
CREATE VIEW formations_missing_personnel AS
SELECT 
  f.id,
  f.name,
  f.playbook_id,
  f.formation_type as category,
  (SELECT COUNT(*) FROM plays p WHERE p.formation_id = f.id) as usage_count
FROM formations f
WHERE array_length(f.personnel_packages, 1) IS NULL 
   OR array_length(f.personnel_packages, 1) = 0;

-- 3.6 ORPHANED PERSONNEL CONFIGS (audit view)
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

-- 3.7 LIVE SESSIONS VIEW (unified view of practice + game sessions)
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
-- FINAL SUCCESS MESSAGE
-- ============================================================================

SELECT 'PART 4 COMPLETE: Core RLS updated to bulletproof function, analytics views created!' as result;
