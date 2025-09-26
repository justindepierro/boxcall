-- Migration: Add duplicate_key column back to plays table
-- This field is used for canonical duplication detection

ALTER TABLE plays ADD COLUMN IF NOT EXISTS duplicate_key TEXT;

-- Add unique index for duplicate_key (nullable, so partial index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_plays_duplicate_key ON plays(duplicate_key) WHERE duplicate_key IS NOT NULL;
