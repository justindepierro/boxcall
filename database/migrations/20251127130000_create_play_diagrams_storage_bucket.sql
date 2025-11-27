-- Migration: Create play-diagrams storage bucket with RLS policies
-- Created: November 27, 2024
-- Description: Storage bucket for play diagram images (screenshots, photos, whiteboard captures)

-- ============================================================
-- STORAGE BUCKET CREATION
-- ============================================================
-- Note: Storage buckets must be created via Supabase Dashboard UI
-- This SQL is for reference only - execute the steps below manually

-- Steps to create bucket via Supabase Dashboard:
-- 1. Navigate to Storage in Supabase Dashboard
-- 2. Click "Create a new bucket"
-- 3. Bucket name: play-diagrams
-- 4. Settings:
--    - Public bucket: NO (private, RLS-protected)
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
-- 5. Click "Create bucket"

-- ============================================================
-- RLS POLICIES FOR play-diagrams BUCKET
-- ============================================================
-- Run these policies after bucket creation

-- Policy 1: Allow team members to upload play diagrams
CREATE POLICY "Team members can upload play diagrams"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'play-diagrams'
  AND auth.uid() IN (
    SELECT tm.user_id
    FROM team_members tm
    JOIN plays p ON p.playbook_id::text = (storage.foldername(name))[2]
      AND p.id::text = (storage.foldername(name))[3]
    JOIN playbooks pb ON pb.id = p.playbook_id
    WHERE pb.team_id = tm.team_id
      AND (storage.foldername(name))[1] = 'plays'
  )
);

-- Policy 2: Allow team members to view play diagrams for their team's plays
CREATE POLICY "Team members can view play diagrams"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'play-diagrams'
  AND auth.uid() IN (
    SELECT tm.user_id
    FROM team_members tm
    JOIN playbooks pb ON pb.team_id = tm.team_id
      AND pb.id::text = (storage.foldername(name))[2]
    WHERE (storage.foldername(name))[1] = 'plays'
  )
);

-- Policy 3: Allow team members to update play diagrams for their team's plays
CREATE POLICY "Team members can update play diagrams"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'play-diagrams'
  AND auth.uid() IN (
    SELECT tm.user_id
    FROM team_members tm
    JOIN playbooks pb ON pb.team_id = tm.team_id
      AND pb.id::text = (storage.foldername(name))[2]
    WHERE (storage.foldername(name))[1] = 'plays'
  )
)
WITH CHECK (
  bucket_id = 'play-diagrams'
  AND auth.uid() IN (
    SELECT tm.user_id
    FROM team_members tm
    JOIN playbooks pb ON pb.team_id = tm.team_id
      AND pb.id::text = (storage.foldername(name))[2]
    WHERE (storage.foldername(name))[1] = 'plays'
  )
);

-- Policy 4: Allow team members to delete play diagrams for their team's plays
CREATE POLICY "Team members can delete play diagrams"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'play-diagrams'
  AND auth.uid() IN (
    SELECT tm.user_id
    FROM team_members tm
    JOIN playbooks pb ON pb.team_id = tm.team_id
      AND pb.id::text = (storage.foldername(name))[2]
    WHERE (storage.foldername(name))[1] = 'plays'
  )
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'play-diagrams';

-- Check RLS policies for bucket
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%play diagrams%';

-- Test file path format (example)
-- Path should be: plays/{playbook_id}/{play_id}/{filename}
-- Example: plays/pb-uuid-123/play-uuid-456/diagram-1732737600.jpg

-- ============================================================
-- STORAGE BUCKET SETTINGS (REFERENCE)
-- ============================================================
-- Bucket Name: play-diagrams
-- Public: false (RLS-protected)
-- File Size Limit: 5MB (5,242,880 bytes)
-- Allowed MIME Types:
--   - image/jpeg
--   - image/png
--   - image/webp
--   - image/heic (iOS photos)

-- File Naming Convention:
-- Format: diagram-{timestamp}.{extension}
-- Example: diagram-1732737600.jpg

-- Path Structure:
-- plays/{playbook_id}/{play_id}/diagram-{timestamp}.{extension}
-- This structure ensures:
-- - Easy cleanup when plays/playbooks are deleted
-- - Team-based access control via RLS
-- - No filename collisions

-- ============================================================
-- CLEANUP NOTES
-- ============================================================
-- When a play is deleted, also delete its storage files:
-- DELETE FROM storage.objects 
-- WHERE bucket_id = 'play-diagrams' 
--   AND name LIKE 'plays/{playbook_id}/{play_id}/%';

-- When a playbook is deleted, also delete all its play diagrams:
-- DELETE FROM storage.objects 
-- WHERE bucket_id = 'play-diagrams' 
--   AND name LIKE 'plays/{playbook_id}/%';
