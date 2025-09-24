-- Test insert one achievement
INSERT INTO achievement_definitions (name, description, icon, category, trigger_type, trigger_target, trigger_count, points, rarity)
VALUES ('Test Achievement', 'This is a test achievement', 'trophy', 'gameplay', 'action_count', 'play_created', 1, 10, 'common');