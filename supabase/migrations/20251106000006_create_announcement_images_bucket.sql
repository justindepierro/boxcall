-- Create storage bucket for announcement images
-- Allows inline images in rich text announcements

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'announcement-images',
  'announcement-images',
  true, -- Public access for easy image display
  5242880, -- 5MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Allow team members to upload images
CREATE POLICY "Team members can upload announcement images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'announcement-images'
  AND auth.uid() IN (
    SELECT user_id FROM team_members WHERE status = 'active'
  )
);

-- Allow team members to view images
CREATE POLICY "Team members can view announcement images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'announcement-images'
  AND auth.uid() IN (
    SELECT user_id FROM team_members WHERE status = 'active'
  )
);

-- Allow authors to delete their own images
CREATE POLICY "Users can delete their own announcement images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'announcement-images'
  AND owner = auth.uid()
);
