-- ============================================================================
-- BOXCALL BULLETPROOF DATABASE - PART 1: COLUMNS & TABLES
-- ============================================================================
-- Run this FIRST to ensure all columns exist
-- ============================================================================

-- Ensure core tables have team_id column
ALTER TABLE practice_scripts ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE playbooks ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE game_plans ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE team_players ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Ensure plays has formation_id and personnel_id
ALTER TABLE plays ADD COLUMN IF NOT EXISTS formation_id UUID;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS personnel_id UUID;

SELECT 'PART 1 COMPLETE: Core columns added' as result;
