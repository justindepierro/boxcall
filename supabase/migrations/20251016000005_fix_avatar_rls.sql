-- Fix Avatar Upload RLS Policy Issue
-- Created: 2025-10-16
-- Description: Fixes "violates row-level security policy" error for avatar uploads

-- First, let's check existing policies
SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Create corrected policies with proper RLS syntax

-- Policy 1: Allow authenticated users to INSERT their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow authenticated users to UPDATE their own avatar
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

-- Policy 3: Allow public to SELECT (read) avatars
CREATE POLICY "Public avatar read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 4: Allow authenticated users to DELETE their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify policies are created
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Test query to verify auth.uid() works
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;
