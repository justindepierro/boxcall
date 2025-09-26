-- Migration: Add missing play fields used by the application
-- Adds complexity_score and diagram_url fields to plays table

ALTER TABLE plays ADD COLUMN IF NOT EXISTS complexity_score INTEGER DEFAULT 5 CHECK (complexity_score >= 1 AND complexity_score <= 10);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS diagram_url TEXT;

-- Add index for complexity_score queries
CREATE INDEX IF NOT EXISTS idx_plays_complexity_score ON plays(complexity_score);
