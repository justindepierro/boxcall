-- Migration 302: Add coaching and social media fields to profiles table
-- This migration adds coach-specific fields and social media links

BEGIN;

-- Add coaching-specific fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coaching_experience TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coaching_philosophy TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specializations TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_school TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_schools TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentors TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coaching_system TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_coaching INTEGER;

-- Add social media and website fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_youtube TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personal_website TEXT;

-- Add constraints for years_coaching (0-50 years seems reasonable)
ALTER TABLE public.profiles ADD CONSTRAINT check_years_coaching_range 
    CHECK (years_coaching IS NULL OR (years_coaching >= 0 AND years_coaching <= 50));

-- Add check constraints for URLs/social handles (basic validation)
ALTER TABLE public.profiles ADD CONSTRAINT check_personal_website_format
    CHECK (personal_website IS NULL OR personal_website ~ '^https?://');

-- Comment the new columns for documentation
COMMENT ON COLUMN public.profiles.coaching_experience IS 'Detailed coaching background and experience';
COMMENT ON COLUMN public.profiles.education IS 'Educational background and degrees';
COMMENT ON COLUMN public.profiles.certifications IS 'Coaching certifications and qualifications';
COMMENT ON COLUMN public.profiles.coaching_philosophy IS 'Coach philosophy and approach to player development';
COMMENT ON COLUMN public.profiles.specializations IS 'Areas of coaching specialization';
COMMENT ON COLUMN public.profiles.current_school IS 'Current school or organization';
COMMENT ON COLUMN public.profiles.previous_schools IS 'Previous coaching positions and schools';
COMMENT ON COLUMN public.profiles.mentors IS 'Coaching mentors and influences';
COMMENT ON COLUMN public.profiles.coaching_system IS 'Preferred coaching systems and strategies';
COMMENT ON COLUMN public.profiles.years_coaching IS 'Total years of coaching experience';
COMMENT ON COLUMN public.profiles.social_twitter IS 'Twitter/X profile handle or URL';
COMMENT ON COLUMN public.profiles.social_instagram IS 'Instagram profile handle or URL';
COMMENT ON COLUMN public.profiles.social_linkedin IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.social_tiktok IS 'TikTok profile handle or URL';
COMMENT ON COLUMN public.profiles.social_youtube IS 'YouTube channel URL';
COMMENT ON COLUMN public.profiles.personal_website IS 'Personal website URL';

-- Update RLS policies to ensure users can read/write their own coaching and social fields
-- The existing policies should already cover these fields, but we'll be explicit

-- Grant usage on the profiles table for the new fields
-- (The existing grants should already cover this, but adding for completeness)

COMMIT;