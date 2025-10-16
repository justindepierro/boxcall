-- Debug and Fix Certifications Data Issue
-- Created: 2025-10-16
-- Description: Fixes "malformed array literal" error for certifications field

-- Check the current data type of certifications
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'certifications';

-- Check if there's any problematic data
SELECT 
  id,
  email,
  certifications,
  pg_typeof(certifications) as type
FROM profiles
WHERE certifications IS NOT NULL
LIMIT 10;

-- If certifications was created as an array type by mistake, fix it
-- (This should not be necessary if migration was applied correctly)
-- ALTER TABLE profiles ALTER COLUMN certifications TYPE TEXT;

-- If there's existing array data, convert it to comma-separated text
-- UPDATE profiles 
-- SET certifications = array_to_string(certifications::text[], ', ')
-- WHERE certifications IS NOT NULL;

-- Verify the fix
SELECT COUNT(*) as profiles_with_certifications
FROM profiles
WHERE certifications IS NOT NULL;
