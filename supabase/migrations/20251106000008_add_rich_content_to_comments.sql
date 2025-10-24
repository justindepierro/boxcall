-- Add rich text content support to announcement comments
-- This allows comments to include formatted text and inline images

-- Add content_json column for rich text content (TipTap format)
ALTER TABLE announcement_comments
ADD COLUMN IF NOT EXISTS content_json JSONB;

-- Create GIN index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_announcement_comments_content_json 
ON announcement_comments USING gin (content_json);

-- Comment for documentation
COMMENT ON COLUMN announcement_comments.content_json IS 'Rich text content in TipTap JSON format. If null, use content field for plain text.';
