-- Add rich content support to team_announcements
-- Stores TipTap document format (JSONB) for inline images and formatting

-- Add new column for rich content (JSONB format from TipTap)
ALTER TABLE team_announcements
ADD COLUMN IF NOT EXISTS content_json JSONB;

-- Add index for better performance when querying rich content
CREATE INDEX IF NOT EXISTS idx_team_announcements_content_json 
ON team_announcements USING gin (content_json);

-- Migration note: 
-- - Keep 'content' TEXT column for backward compatibility
-- - New announcements will use content_json (rich text)
-- - Old announcements will still display using content (plain text)
-- - Display logic checks content_json first, falls back to content
