-- Add diagram_image_url column to plays table for uploaded play diagrams
-- Migration: 20251127122653_add_diagram_image_url_to_plays

-- Add diagram_image_url column (nullable, stores Supabase Storage URL)
ALTER TABLE plays 
ADD COLUMN IF NOT EXISTS diagram_image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN plays.diagram_image_url IS 'URL to uploaded play diagram image in Supabase Storage (screenshots/photos from coaches phones)';

-- Create storage bucket for play diagrams (if not exists)
-- Note: This needs to be run via Supabase Dashboard Storage UI or via SQL:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('play-diagrams', 'play-diagrams', true)
-- ON CONFLICT DO NOTHING;

-- Add RLS policies for play-diagrams bucket
-- (Storage policies must be created via Supabase Dashboard)

