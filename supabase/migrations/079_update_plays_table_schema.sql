-- Migration: Update plays table to match expected schema
-- Aligns database with TypeScript Play interface

-- Add missing columns to plays table
ALTER TABLE plays ADD COLUMN IF NOT EXISTS formation TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS play_name TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS one_word_play TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS p_type TEXT CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action'));
ALTER TABLE plays ADD COLUMN IF NOT EXISTS personnel TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS f_type TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS f_dir TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS protection TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS p_dir TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS r_str TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS p_str TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS pref_down TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS pref_dis TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS pref_hash TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS pref_cov TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS pref_front TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS ftag1 TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS ftag2 TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS p_tag1 TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS p_tag2 TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS back_align TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS shift TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS motion TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS key_player1 TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS key_player2 TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS check_into TEXT;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS confidence_base INTEGER DEFAULT 70;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS times_called INTEGER DEFAULT 0;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS times_successful INTEGER DEFAULT 0;
ALTER TABLE plays ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE plays ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Update existing data to have required fields
UPDATE plays SET 
  play_name = COALESCE(name, 'Unnamed Play'),
  p_type = COALESCE(play_type, 'Run'),
  formation = COALESCE(formation, 'Unknown'),
  confidence_base = COALESCE(confidence_base, 70),
  times_called = COALESCE(times_called, 0),
  times_successful = COALESCE(times_successful, 0),
  created_by = COALESCE(created_by, '00000000-0000-0000-0000-000000000001')
WHERE play_name IS NULL OR p_type IS NULL OR formation IS NULL;

-- Make required columns NOT NULL after backfill
ALTER TABLE plays ALTER COLUMN play_name SET NOT NULL;
ALTER TABLE plays ALTER COLUMN p_type SET NOT NULL;
ALTER TABLE plays ALTER COLUMN formation SET NOT NULL;

-- Drop old columns that are no longer needed
ALTER TABLE plays DROP COLUMN IF EXISTS name;
ALTER TABLE plays DROP COLUMN IF EXISTS play_type;
ALTER TABLE plays DROP COLUMN IF EXISTS difficulty_rating;
ALTER TABLE plays DROP COLUMN IF EXISTS duplicate_key;
ALTER TABLE plays DROP COLUMN IF EXISTS tags;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_plays_p_type ON plays(p_type);
CREATE INDEX IF NOT EXISTS idx_plays_formation ON plays(formation);
CREATE INDEX IF NOT EXISTS idx_plays_created_by ON plays(created_by);
CREATE INDEX IF NOT EXISTS idx_plays_is_archived ON plays(is_archived) WHERE is_archived = false;
