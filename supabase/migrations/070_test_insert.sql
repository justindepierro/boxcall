-- Test if migrations can insert data at all
-- First, try a simple insert that should work

-- Check if we can at least modify the table
ALTER TABLE achievement_definitions ADD COLUMN IF NOT EXISTS test_column TEXT;

-- Try to insert a single test achievement
INSERT INTO achievement_definitions (name, description, icon, category, trigger_type, trigger_target, trigger_count, points, rarity)
VALUES ('Test Achievement', 'This is a test', 'test', 'special', 'special', 'test', 1, 1, 'common');

-- Remove test column
ALTER TABLE achievement_definitions DROP COLUMN IF EXISTS test_column;