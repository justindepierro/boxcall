-- Simple test: just try to insert without RLS changes
INSERT INTO achievement_definitions (name, description, icon, category, trigger_type, trigger_target, trigger_count, points, rarity)
VALUES ('Simple Test', 'Testing simple insert', 'test', 'special', 'special', 'test', 1, 1, 'common');