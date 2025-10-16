-- Migration: Add Play Creation Tracking
-- Purpose: Track where plays are created from for usage analytics
-- Created: 2025-10-16

-- Create enum for play creation sources
CREATE TYPE play_creation_source AS ENUM (
  'add_play_modal',      -- From AddNewPlayModal (hero tile)
  'diagram_editor',      -- Created directly in diagram editor
  'play_card',          -- Duplicated from existing play
  'bulk_import',        -- CSV/bulk import
  'api',                -- API creation
  'migration',          -- Data migration
  'unknown'             -- Legacy or undefined
);

-- Add creation tracking columns to plays table
ALTER TABLE plays
  ADD COLUMN creation_source play_creation_source DEFAULT 'unknown',
  ADD COLUMN creation_context JSONB DEFAULT '{}'::jsonb;

-- Add index for analytics queries
CREATE INDEX idx_plays_creation_source ON plays(creation_source);

-- Create analytics view for play creation tracking
CREATE VIEW play_creation_analytics AS
SELECT 
  creation_source,
  COUNT(*) as play_count,
  COUNT(DISTINCT playbook_id) as playbook_count,
  AVG(confidence_base) as avg_confidence,
  AVG(times_called) as avg_times_called,
  COUNT(*) FILTER (WHERE diagram_data IS NOT NULL) as with_diagram_count,
  COUNT(*) FILTER (WHERE diagram_data IS NULL) as without_diagram_count
FROM plays
GROUP BY creation_source
ORDER BY play_count DESC;

-- Create separate view for tab usage analytics
CREATE VIEW play_tab_usage_analytics AS
SELECT 
  creation_source,
  creation_context->>'active_tab' as active_tab,
  COUNT(*) as usage_count,
  AVG(confidence_base) as avg_confidence,
  COUNT(*) FILTER (WHERE diagram_data IS NOT NULL) as with_diagram_count
FROM plays
WHERE creation_context->>'active_tab' IS NOT NULL
GROUP BY creation_source, creation_context->>'active_tab'
ORDER BY creation_source, usage_count DESC;

-- Backfill existing plays with 'unknown' source
UPDATE plays 
SET creation_source = 'unknown'
WHERE creation_source IS NULL;

-- Comment for documentation
COMMENT ON COLUMN plays.creation_source IS 
  'Tracks where the play was created from (modal, editor, import, etc.) for usage analytics';

COMMENT ON COLUMN plays.creation_context IS 
  'JSONB field storing additional creation context: active_tab, user_action, source_version, etc.';

COMMENT ON VIEW play_creation_analytics IS 
  'Analytics view showing play creation patterns by source, including diagram completion rates';

COMMENT ON VIEW play_tab_usage_analytics IS 
  'Analytics view showing which tabs are used for creating plays, broken down by creation source';
