-- Create storage bucket for play diagrams
-- Stores uploaded play diagram images (screenshots, photos, whiteboard captures)

-- Create the bucket (private with RLS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'play-diagrams',
  'play-diagrams',
  true, -- Public for easy URL access (RLS policies control who can upload/view)
  5242880, -- 5MB limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow authenticated users to upload play diagrams
-- Note: In production, this should be restricted to team members with proper playbook access
CREATE POLICY "Authenticated users can upload play diagrams"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'play-diagrams'
  AND auth.uid() IS NOT NULL
);

-- Policy 2: Allow authenticated users to view play diagrams
CREATE POLICY "Authenticated users can view play diagrams"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'play-diagrams'
);

-- Policy 3: Allow users to update their own uploaded diagrams
CREATE POLICY "Users can update their own play diagrams"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'play-diagrams'
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'play-diagrams'
  AND auth.uid() = owner
);

-- Policy 4: Allow users to delete their own uploaded diagrams
CREATE POLICY "Users can delete their own play diagrams"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'play-diagrams'
  AND auth.uid() = owner
);
