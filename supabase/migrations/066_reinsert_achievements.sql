-- Temporarily disable RLS for insert
ALTER TABLE achievement_definitions DISABLE ROW LEVEL SECURITY;

-- Re-insert default achievements after table recreation
INSERT INTO achievement_definitions (name, description, icon, category, trigger_type, trigger_target, trigger_count, points, rarity) VALUES
-- Gameplay achievements
('First Play', 'Create your first play in BoxCall', 'football', 'gameplay', 'action_count', 'play_created', 1, 10, 'common'),
('Playbook Builder', 'Create 10 plays for your team', 'book', 'gameplay', 'action_count', 'play_created', 10, 25, 'uncommon'),
('Master Strategist', 'Create 50 plays for your team', 'crown', 'gameplay', 'action_count', 'play_created', 50, 100, 'rare'),

-- Social achievements
('Team Communicator', 'Send your first team post', 'message-circle', 'social', 'action_count', 'post_sent', 1, 10, 'common'),
('Social Butterfly', 'Send 25 team posts', 'users', 'social', 'action_count', 'post_sent', 25, 50, 'uncommon'),
('Team Captain', 'Send 100 team posts', 'star', 'social', 'action_count', 'post_sent', 100, 150, 'epic'),

-- Teamwork achievements
('Roster Ready', 'Add your first player to the roster', 'user-plus', 'teamwork', 'action_count', 'player_added', 1, 15, 'common'),
('Team Builder', 'Add 10 players to your roster', 'users', 'teamwork', 'action_count', 'player_added', 10, 40, 'uncommon'),
('Squad Leader', 'Add 25 players to your roster', 'shield', 'teamwork', 'action_count', 'player_added', 25, 75, 'rare'),

-- Leadership achievements
('First Victory', 'Win your first game', 'trophy', 'leadership', 'action_count', 'game_won', 1, 50, 'uncommon'),
('Undefeated', 'Win 5 games in a row', 'zap', 'leadership', 'streak', 'game_won_streak', 5, 200, 'epic'),
('Champion', 'Win 10 games', 'crown', 'leadership', 'action_count', 'game_won', 10, 300, 'legendary'),

-- Milestone achievements
('Century Club', 'Reach 100 total achievement points', 'target', 'milestone', 'special', 'points_milestone', 100, 100, 'rare'),
('Achievement Hunter', 'Earn 25 different achievements', 'award', 'milestone', 'special', 'achievements_earned', 25, 250, 'epic'),
('BoxCall Legend', 'Earn 50 different achievements', 'gem', 'milestone', 'special', 'achievements_earned', 50, 500, 'legendary');

-- Re-enable RLS
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;