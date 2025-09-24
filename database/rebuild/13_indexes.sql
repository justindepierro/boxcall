-- ===========================================
-- PERFORMANCE INDEXES
-- ===========================================

-- Core indexes
CREATE INDEX idx_teams_season_year ON teams(season_year);
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id);
CREATE INDEX idx_team_members_user_active ON team_members(user_id, is_active);
CREATE INDEX idx_team_players_team_active ON team_players(team_id, is_active);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Playbook indexes
CREATE INDEX idx_playbooks_team_active ON playbooks(team_id, is_active);
CREATE INDEX idx_plays_playbook ON plays(playbook_id);
CREATE INDEX idx_plays_type ON plays(p_type);

-- Social features indexes
CREATE INDEX idx_team_posts_team_created ON team_posts(team_id, created_at DESC);
CREATE INDEX idx_team_posts_author ON team_posts(author_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_shares_post ON post_shares(post_id);

-- Game management indexes
CREATE INDEX idx_game_plans_team_date ON game_plans(team_id, game_date);
CREATE INDEX idx_game_results_team_date ON game_results(team_id, game_date);

-- Practice indexes
CREATE INDEX idx_practice_schedules_team_date ON practice_schedules(team_id, scheduled_date);
CREATE INDEX idx_practice_attendance_practice ON practice_attendance(practice_id);

-- Calendar indexes
CREATE INDEX idx_calendar_events_team_date ON calendar_events(team_id, event_date);
CREATE INDEX idx_team_events_team_date ON team_events(team_id, event_date);

-- Equipment indexes
CREATE INDEX idx_equipment_team_category ON equipment(team_id, category);