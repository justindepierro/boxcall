-- Add nickname field to team_players table
-- Migration created: 2025-10-16

ALTER TABLE team_players 
ADD COLUMN nickname TEXT;

COMMENT ON COLUMN team_players.nickname IS 'Optional nickname or preferred name for the player';
