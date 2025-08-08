-- Debug script to check game_plans table structure
-- Run this to see exactly what columns exist

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'game_plans' 
ORDER BY ordinal_position;
