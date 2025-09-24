-- Add a test column to verify migration runs
ALTER TABLE achievement_definitions ADD COLUMN migration_test TEXT DEFAULT 'test';

-- Disable RLS for data insertion
ALTER TABLE achievement_definitions DISABLE ROW LEVEL SECURITY;

-- Clear any existing achievements
DELETE FROM achievement_definitions;

-- Insert default achievements
INSERT INTO achievement_definitions (name, description, icon, category, trigger_type, trigger_target, trigger_count, points, rarity, migration_test) VALUES
('First Play', 'Create your first play in BoxCall', 'football', 'gameplay', 'action_count', 'play_created', 1, 10, 'common', 'inserted'),
('Playbook Builder', 'Create 10 plays for your team', 'book', 'gameplay', 'action_count', 'play_created', 10, 25, 'uncommon', 'inserted');

-- Re-enable RLS
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;

-- Remove test column
ALTER TABLE achievement_definitions DROP COLUMN migration_test;