-- Migration: Add Missing Profile Fields
-- Created: 2025-10-16
-- Description: Adds coaching-specific fields and social media links to profiles table
--              Fixes "column does not exist" errors when saving profile

-- Add coaching-specific fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS coaching_experience TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS coaching_philosophy TEXT,
ADD COLUMN IF NOT EXISTS specializations TEXT,
ADD COLUMN IF NOT EXISTS current_school TEXT,
ADD COLUMN IF NOT EXISTS previous_schools TEXT,
ADD COLUMN IF NOT EXISTS mentors TEXT,
ADD COLUMN IF NOT EXISTS coaching_system TEXT,
ADD COLUMN IF NOT EXISTS years_coaching INTEGER;
-- Add social media fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS social_tiktok TEXT,
ADD COLUMN IF NOT EXISTS social_youtube TEXT,
ADD COLUMN IF NOT EXISTS personal_website TEXT;
-- Add comments for documentation
COMMENT ON COLUMN profiles.coaching_experience IS 'Years and details of coaching experience';
COMMENT ON COLUMN profiles.education IS 'Educational background and degrees';
COMMENT ON COLUMN profiles.certifications IS 'Coaching certifications and licenses';
COMMENT ON COLUMN profiles.coaching_philosophy IS 'Coaching philosophy and approach';
COMMENT ON COLUMN profiles.specializations IS 'Coaching specializations (offense, defense, etc.)';
COMMENT ON COLUMN profiles.current_school IS 'Current school or organization';
COMMENT ON COLUMN profiles.previous_schools IS 'Previous schools or organizations';
COMMENT ON COLUMN profiles.mentors IS 'Mentors and influences';
COMMENT ON COLUMN profiles.coaching_system IS 'Preferred coaching system';
COMMENT ON COLUMN profiles.years_coaching IS 'Total years of coaching experience';
COMMENT ON COLUMN profiles.social_twitter IS 'Twitter/X profile URL';
COMMENT ON COLUMN profiles.social_instagram IS 'Instagram profile URL';
COMMENT ON COLUMN profiles.social_linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN profiles.social_tiktok IS 'TikTok profile URL';
COMMENT ON COLUMN profiles.social_youtube IS 'YouTube channel URL';
COMMENT ON COLUMN profiles.personal_website IS 'Personal or professional website URL';
-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_current_school ON profiles(current_school);
CREATE INDEX IF NOT EXISTS idx_profiles_years_coaching ON profiles(years_coaching);
-- Update updated_at timestamp trigger (ensure it exists)
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;
CREATE TRIGGER update_profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();
-- Verify columns were added
DO $$
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  col TEXT;
BEGIN
  -- Check for coaching fields
  FOR col IN 
    SELECT unnest(ARRAY[
      'coaching_experience', 'education', 'certifications', 
      'coaching_philosophy', 'specializations', 'current_school',
      'previous_schools', 'mentors', 'coaching_system', 'years_coaching',
      'social_twitter', 'social_instagram', 'social_linkedin',
      'social_tiktok', 'social_youtube', 'personal_website'
    ])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration failed: Missing columns: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'Migration successful: All profile columns added';
  END IF;
END;
$$;
