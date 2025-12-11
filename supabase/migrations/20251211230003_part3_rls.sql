-- ============================================================================
-- BOXCALL BULLETPROOF DATABASE - PART 3: RLS & INDEXES
-- ============================================================================
-- Run this THIRD to set up RLS policies
-- ============================================================================

-- Enable RLS on all tables
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "formations_select" ON formations;
DROP POLICY IF EXISTS "formations_insert" ON formations;
DROP POLICY IF EXISTS "formations_update" ON formations;
DROP POLICY IF EXISTS "formations_delete" ON formations;

-- FORMATIONS POLICIES
CREATE POLICY "formations_select" ON formations FOR SELECT USING (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = formations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "formations_insert" ON formations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = formations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "formations_update" ON formations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = formations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "formations_delete" ON formations FOR DELETE USING (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = formations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);

-- PERSONNEL CONFIGURATIONS POLICIES
DROP POLICY IF EXISTS "personnel_configs_select" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configs_insert" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configs_update" ON personnel_configurations;
DROP POLICY IF EXISTS "personnel_configs_delete" ON personnel_configurations;

CREATE POLICY "personnel_configs_select" ON personnel_configurations FOR SELECT USING (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = personnel_configurations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "personnel_configs_insert" ON personnel_configurations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = personnel_configurations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "personnel_configs_update" ON personnel_configurations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = personnel_configurations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "personnel_configs_delete" ON personnel_configurations FOR DELETE USING (
  EXISTS (SELECT 1 FROM playbooks pb WHERE pb.id = personnel_configurations.playbook_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);

-- PERSONNEL PLAYERS POLICIES
DROP POLICY IF EXISTS "personnel_players_select" ON personnel_players;
DROP POLICY IF EXISTS "personnel_players_insert" ON personnel_players;
DROP POLICY IF EXISTS "personnel_players_update" ON personnel_players;
DROP POLICY IF EXISTS "personnel_players_delete" ON personnel_players;

CREATE POLICY "personnel_players_select" ON personnel_players FOR SELECT USING (
  EXISTS (SELECT 1 FROM personnel_configurations pc JOIN playbooks pb ON pb.id = pc.playbook_id WHERE pc.id = personnel_players.config_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "personnel_players_insert" ON personnel_players FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM personnel_configurations pc JOIN playbooks pb ON pb.id = pc.playbook_id WHERE pc.id = personnel_players.config_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "personnel_players_update" ON personnel_players FOR UPDATE USING (
  EXISTS (SELECT 1 FROM personnel_configurations pc JOIN playbooks pb ON pb.id = pc.playbook_id WHERE pc.id = personnel_players.config_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "personnel_players_delete" ON personnel_players FOR DELETE USING (
  EXISTS (SELECT 1 FROM personnel_configurations pc JOIN playbooks pb ON pb.id = pc.playbook_id WHERE pc.id = personnel_players.config_id AND pb.team_id IN (SELECT public.get_my_team_ids()))
);

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_delete" ON notifications;
-- Drop old named policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (user_id = auth.uid());

-- MENTIONS POLICIES
DROP POLICY IF EXISTS "mentions_select" ON mentions;
DROP POLICY IF EXISTS "mentions_insert" ON mentions;
-- Drop old named policies
DROP POLICY IF EXISTS "Team members can view mentions" ON mentions;
DROP POLICY IF EXISTS "System can create mentions" ON mentions;
DROP POLICY IF EXISTS "Authors can delete mentions" ON mentions;

CREATE POLICY "mentions_select" ON mentions FOR SELECT USING (mentioned_user_id = auth.uid() OR created_by_user_id = auth.uid());
CREATE POLICY "mentions_insert" ON mentions FOR INSERT WITH CHECK (created_by_user_id = auth.uid());

-- TEAM ANNOUNCEMENTS POLICIES
DROP POLICY IF EXISTS "announcements_select" ON team_announcements;
DROP POLICY IF EXISTS "announcements_insert" ON team_announcements;
DROP POLICY IF EXISTS "announcements_update" ON team_announcements;
DROP POLICY IF EXISTS "announcements_delete" ON team_announcements;
-- Drop old named policies
DROP POLICY IF EXISTS "Team members can view announcements" ON team_announcements;
DROP POLICY IF EXISTS "Coaches can create announcements" ON team_announcements;
DROP POLICY IF EXISTS "Coaches can update own announcements" ON team_announcements;
DROP POLICY IF EXISTS "Coaches can delete own announcements" ON team_announcements;

CREATE POLICY "announcements_select" ON team_announcements FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));
CREATE POLICY "announcements_insert" ON team_announcements FOR INSERT WITH CHECK (team_id IN (SELECT public.get_my_team_ids()) AND created_by = auth.uid());
CREATE POLICY "announcements_update" ON team_announcements FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "announcements_delete" ON team_announcements FOR DELETE USING (created_by = auth.uid());

-- ANNOUNCEMENT REACTIONS POLICIES
DROP POLICY IF EXISTS "ann_reactions_select" ON announcement_reactions;
DROP POLICY IF EXISTS "ann_reactions_insert" ON announcement_reactions;
DROP POLICY IF EXISTS "ann_reactions_delete" ON announcement_reactions;
-- Drop old named policies
DROP POLICY IF EXISTS "Team members can view reactions" ON announcement_reactions;
DROP POLICY IF EXISTS "Team members can add reactions" ON announcement_reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON announcement_reactions;

CREATE POLICY "ann_reactions_select" ON announcement_reactions FOR SELECT USING (true);
CREATE POLICY "ann_reactions_insert" ON announcement_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ann_reactions_delete" ON announcement_reactions FOR DELETE USING (user_id = auth.uid());

-- ANNOUNCEMENT COMMENTS POLICIES
DROP POLICY IF EXISTS "ann_comments_select" ON announcement_comments;
DROP POLICY IF EXISTS "ann_comments_insert" ON announcement_comments;
DROP POLICY IF EXISTS "ann_comments_update" ON announcement_comments;
DROP POLICY IF EXISTS "ann_comments_delete" ON announcement_comments;
-- Drop old named policies
DROP POLICY IF EXISTS "Team members can view comments" ON announcement_comments;
DROP POLICY IF EXISTS "Team members can add comments" ON announcement_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON announcement_comments;
DROP POLICY IF EXISTS "Users can delete own comments or coaches can delete any" ON announcement_comments;

CREATE POLICY "ann_comments_select" ON announcement_comments FOR SELECT USING (true);
CREATE POLICY "ann_comments_insert" ON announcement_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "ann_comments_update" ON announcement_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "ann_comments_delete" ON announcement_comments FOR DELETE USING (user_id = auth.uid());

-- ANNOUNCEMENT VIEWS POLICIES
DROP POLICY IF EXISTS "ann_views_select" ON announcement_views;
DROP POLICY IF EXISTS "ann_views_insert" ON announcement_views;
-- Drop old named policies
DROP POLICY IF EXISTS "Users can view their own announcement views" ON announcement_views;
DROP POLICY IF EXISTS "Users can record their own announcement views" ON announcement_views;
DROP POLICY IF EXISTS "Coaches can view all announcement views for their teams" ON announcement_views;

CREATE POLICY "ann_views_select" ON announcement_views FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ann_views_insert" ON announcement_views FOR INSERT WITH CHECK (user_id = auth.uid());

-- COMMENT REACTIONS POLICIES
DROP POLICY IF EXISTS "comment_reactions_select" ON comment_reactions;
DROP POLICY IF EXISTS "comment_reactions_insert" ON comment_reactions;
DROP POLICY IF EXISTS "comment_reactions_delete" ON comment_reactions;
-- Drop old named policies
DROP POLICY IF EXISTS "Team members can view comment reactions" ON comment_reactions;
DROP POLICY IF EXISTS "Team members can add comment reactions" ON comment_reactions;
DROP POLICY IF EXISTS "Users can delete own comment reactions" ON comment_reactions;

CREATE POLICY "comment_reactions_select" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "comment_reactions_insert" ON comment_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "comment_reactions_delete" ON comment_reactions FOR DELETE USING (user_id = auth.uid());

-- INVITATION ATTEMPTS POLICIES
DROP POLICY IF EXISTS "invitation_attempts_select" ON invitation_attempts;
DROP POLICY IF EXISTS "invitation_attempts_insert" ON invitation_attempts;
-- Drop old named policies
DROP POLICY IF EXISTS "Team coaches can view invitation attempts" ON invitation_attempts;
DROP POLICY IF EXISTS "System can insert invitation attempts" ON invitation_attempts;

CREATE POLICY "invitation_attempts_select" ON invitation_attempts FOR SELECT USING (
  team_id IN (SELECT public.get_my_team_ids())
);
CREATE POLICY "invitation_attempts_insert" ON invitation_attempts FOR INSERT WITH CHECK (
  team_id IN (SELECT public.get_my_team_ids())
);

-- PRACTICE SCRIPT PLAYS POLICIES
DROP POLICY IF EXISTS "practice_script_plays_select" ON practice_script_plays;
DROP POLICY IF EXISTS "practice_script_plays_insert" ON practice_script_plays;
DROP POLICY IF EXISTS "practice_script_plays_update" ON practice_script_plays;
DROP POLICY IF EXISTS "practice_script_plays_delete" ON practice_script_plays;
-- Drop old named policies
DROP POLICY IF EXISTS "Team members can view practice script plays" ON practice_script_plays;
DROP POLICY IF EXISTS "Team members can manage practice script plays" ON practice_script_plays;

CREATE POLICY "practice_script_plays_select" ON practice_script_plays FOR SELECT USING (
  EXISTS (SELECT 1 FROM practice_scripts ps WHERE ps.id = practice_script_plays.practice_script_id AND ps.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "practice_script_plays_insert" ON practice_script_plays FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM practice_scripts ps WHERE ps.id = practice_script_plays.practice_script_id AND ps.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "practice_script_plays_update" ON practice_script_plays FOR UPDATE USING (
  EXISTS (SELECT 1 FROM practice_scripts ps WHERE ps.id = practice_script_plays.practice_script_id AND ps.team_id IN (SELECT public.get_my_team_ids()))
);
CREATE POLICY "practice_script_plays_delete" ON practice_script_plays FOR DELETE USING (
  EXISTS (SELECT 1 FROM practice_scripts ps WHERE ps.id = practice_script_plays.practice_script_id AND ps.team_id IN (SELECT public.get_my_team_ids()))
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_formations_playbook ON formations(playbook_id);
CREATE INDEX IF NOT EXISTS idx_personnel_configs_playbook ON personnel_configurations(playbook_id);
CREATE INDEX IF NOT EXISTS idx_personnel_players_config ON personnel_players(config_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_created_by_user ON mentions(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_team ON team_announcements(team_id);
CREATE INDEX IF NOT EXISTS idx_ann_reactions_announcement ON announcement_reactions(announcement_id);
CREATE INDEX IF NOT EXISTS idx_ann_comments_announcement ON announcement_comments(announcement_id);
CREATE INDEX IF NOT EXISTS idx_practice_script_plays_script ON practice_script_plays(practice_script_id);
CREATE INDEX IF NOT EXISTS idx_invitation_attempts_team ON invitation_attempts(team_id);

SELECT 'PART 3 COMPLETE: RLS policies and indexes created' as result;
