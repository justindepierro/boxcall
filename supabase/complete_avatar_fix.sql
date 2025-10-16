-- Complete Avatar Upload Fix - Run this in Supabase SQL Editor
-- Created: 2025-10-16
-- This fixes BOTH the RLS policy and certifications issues

-- ============================================
-- PART 1: FIX CERTIFICATIONS FIELD
-- ============================================

-- First, check what type certifications is
DO $$
DECLARE
  cert_type TEXT;
BEGIN
  SELECT data_type INTO cert_type
  FROM information_schema.columns
  WHERE table_name = 'profiles' AND column_name = 'certifications';
  
  RAISE NOTICE 'Certifications column type: %', cert_type;
  
  -- If it's an array, convert it to text
  IF cert_type LIKE '%ARRAY%' OR cert_type = 'text[]' THEN
    RAISE NOTICE 'Converting certifications from array to text...';
    
    -- First, convert any existing array data to comma-separated text
    UPDATE profiles 
    SET certifications = array_to_string(certifications::text[], ', ')
    WHERE certifications IS NOT NULL;
    
    -- Then change the column type
    ALTER TABLE profiles ALTER COLUMN certifications TYPE TEXT;
    
    RAISE NOTICE 'Certifications converted to TEXT successfully!';
  ELSE
    RAISE NOTICE 'Certifications is already TEXT type - no conversion needed';
  END IF;
END $$;

-- ============================================
-- PART 2: FIX STORAGE RLS POLICIES
-- ============================================

-- Drop any existing avatar policies
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Also drop any variations that might exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar upload policy" ON storage.objects;

RAISE NOTICE 'Old policies dropped successfully';

-- Create new policies with correct RLS syntax

-- Policy 1: Allow users to INSERT (upload) their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

RAISE NOTICE 'INSERT policy created';

-- Policy 2: Allow users to UPDATE (replace) their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

RAISE NOTICE 'UPDATE policy created';

-- Policy 3: Allow anyone to SELECT (view) avatars
CREATE POLICY "Public avatar read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

RAISE NOTICE 'SELECT policy created';

-- Policy 4: Allow users to DELETE their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

RAISE NOTICE 'DELETE policy created';

-- ============================================
-- PART 3: VERIFY THE FIXES
-- ============================================

-- Check storage policies
SELECT 
  'Storage Policies' as check_type,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';

-- Check certifications type
SELECT 
  'Certifications Type' as check_type,
  data_type as current_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'certifications';

-- Check your auth status
SELECT 
  'Auth Check' as check_type,
  auth.uid() as your_user_id,
  auth.role() as your_role;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '===================================';
  RAISE NOTICE 'AVATAR UPLOAD FIX COMPLETE!';
  RAISE NOTICE '===================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your profile page';
  RAISE NOTICE '2. Select an avatar image';
  RAISE NOTICE '3. Click Save Changes';
  RAISE NOTICE '4. Avatar should upload and display!';
  RAISE NOTICE '===================================';
END $$;
