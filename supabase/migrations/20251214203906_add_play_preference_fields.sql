-- Migration: Add play preference fields for field position and custom situation
-- These allow coaches to define custom situational preferences for plays

-- Add pref_field_pos for field position preferences (e.g., "Red Zone", "Goal Line", "Plus Territory")
ALTER TABLE plays ADD COLUMN IF NOT EXISTS pref_field_pos TEXT;

-- Add pref_situation for custom situational tags (e.g., "2-Minute", "4th Down", "Backed Up")
ALTER TABLE plays ADD COLUMN IF NOT EXISTS pref_situation TEXT;

-- Add comment to document the columns
COMMENT ON COLUMN plays.pref_field_pos IS 'Coach-defined preferred field position (e.g., Red Zone, Goal Line)';
COMMENT ON COLUMN plays.pref_situation IS 'Coach-defined preferred custom situation (e.g., 2-Minute, Backed Up)';
