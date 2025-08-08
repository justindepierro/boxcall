-- Check if game_plans has all the Brian Billick columns
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'game_plans' 
  AND column_name IN ('is_active', 'total_situations', 'total_plays_assigned', 'scouting_report', 'preparation_status', 'weather_considerations', 'key_matchups', 'coaching_points')
ORDER BY column_name;
