-- Add back position modifier columns to plays table
-- Migration: 20251128120000_add_back_position_modifiers.sql
-- 
-- These columns track whether the running back lines up left or right of the QB
-- This affects the play's run/pass strength relative to the formation's base strength

-- Add back_left_of_qb column
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS back_left_of_qb BOOLEAN DEFAULT NULL;

-- Add back_right_of_qb column  
ALTER TABLE plays
ADD COLUMN IF NOT EXISTS back_right_of_qb BOOLEAN DEFAULT NULL;

-- Add index for queries filtering by back position
CREATE INDEX IF NOT EXISTS idx_plays_back_left_of_qb ON plays(back_left_of_qb);
CREATE INDEX IF NOT EXISTS idx_plays_back_right_of_qb ON plays(back_right_of_qb);

-- Add comment explaining the columns
COMMENT ON COLUMN plays.back_left_of_qb IS 'TRUE if running back aligns to left of QB, affecting run/pass strength modifiers';
COMMENT ON COLUMN plays.back_right_of_qb IS 'TRUE if running back aligns to right of QB, affecting run/pass strength modifiers';
