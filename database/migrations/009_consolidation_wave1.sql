-- Migration 009: Consolidation Wave 1 (Non-breaking scaffolding)
-- Purpose: Introduce compatibility views & unified recognition table (empty)
-- Safe to run multiple times (IF NOT EXISTS usage where possible)

-- 1. Compatibility View: team_players (legacy) -> player_roster (canonical)
DROP VIEW IF EXISTS team_players_view CASCADE;
CREATE OR REPLACE VIEW team_players_view AS
SELECT 
  pr.id,
  pr.team_id,
  pr.user_id,
  pr.jersey_number AS jersey_number,
  pr.primary_position AS position,
  pr.roster_status AS status,
  pr.height_inches,
  pr.weight_pounds,
  pr.graduation_year,
  pr.class_year,
  pr.dominant_hand,
  pr.join_date AS joined_at,
  pr.updated_at,
  pr.created_at
FROM player_roster pr;

-- For code expecting original name
DROP VIEW IF EXISTS team_players_compat CASCADE;
CREATE OR REPLACE VIEW team_players_compat AS SELECT * FROM team_players_view;

-- 2. Compatibility View: depth_chart (singular) -> depth_charts (plural)
DROP VIEW IF EXISTS depth_chart CASCADE;
CREATE OR REPLACE VIEW depth_chart AS
SELECT * FROM depth_charts;

-- 3. Unified Player Recognitions Table (empty shell) - DOES NOT migrate data yet
-- Combines achievements, helmet_stickers, player_awards, player_milestones
CREATE TABLE IF NOT EXISTS player_recognitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT, -- auth.users.id or null for team-wide
  recognition_type TEXT NOT NULL CHECK (recognition_type IN (
    'achievement','sticker','award','milestone'
  )),
  source_table TEXT, -- original table for traceability
  title TEXT NOT NULL,
  description TEXT,
  points_value INTEGER DEFAULT 0,
  icon TEXT,
  color TEXT,
  category TEXT,
  difficulty TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for new unified table
CREATE INDEX IF NOT EXISTS idx_player_recognitions_team_user ON player_recognitions(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_player_recognitions_type ON player_recognitions(recognition_type, team_id);
CREATE INDEX IF NOT EXISTS idx_player_recognitions_awarded_at ON player_recognitions(awarded_at DESC);

-- 5. View to aggregate legacy recognitions (read-only combined view)
DROP VIEW IF EXISTS recognitions_all CASCADE;
-- Unified read-only aggregation of legacy recognition sources (defensive column mapping)
CREATE OR REPLACE VIEW recognitions_all AS
-- Achievements (minimal baseline schema: no created_at column). Use earned_at for created/updated/awarded.
SELECT 
  a.id,
  a.team_id,
  a.user_id::text AS user_id,
  'achievement'::text AS recognition_type,
  a.title,
  a.description,
  0 AS points_value,
  NULL::text AS icon,
  NULL::text AS color,
  NULL::text AS category,
  NULL::text AS difficulty,
  a.earned_at AS awarded_at,
  '{}'::jsonb AS metadata,
  a.earned_at AS created_at,
  a.earned_at AS updated_at,
  'achievements'::text AS source_table
FROM achievements a
UNION ALL
-- Helmet stickers (no created_at; use awarded_at)
SELECT 
  hs.id,
  hs.team_id,
  hs.user_id::text AS user_id,
  'sticker',
  hs.reason AS title,
  NULL::text AS description,
  0 AS points_value,
  NULL::text AS icon,
  NULL::text AS color,
  'helmet' AS category,
  NULL::text AS difficulty,
  hs.awarded_at,
  '{}'::jsonb AS metadata,
  hs.awarded_at AS created_at,
  hs.awarded_at AS updated_at,
  'helmet_stickers'::text AS source_table
FROM helmet_stickers hs
UNION ALL
-- Player awards (map award_* columns; ceremony_date may be NULL)
SELECT 
  pa.id,
  pa.team_id,
  pa.user_id::text AS user_id,
  'award',
  pa.award_name AS title,
  pa.award_description AS description,
  0 AS points_value,
  NULL::text AS icon,
  NULL::text AS color,
  pa.award_category AS category,
  NULL::text AS difficulty,
  COALESCE(pa.ceremony_date::timestamptz, pa.created_at) AS awarded_at,
  '{}'::jsonb AS metadata,
  pa.created_at,
  pa.created_at AS updated_at,
  'player_awards'::text AS source_table
FROM player_awards pa
UNION ALL
-- Player milestones (achieved_date is DATE; cast to timestamptz at midnight UTC)
SELECT 
  pm.id,
  pm.team_id,
  pm.user_id::text AS user_id,
  'milestone',
  pm.milestone_name AS title,
  pm.milestone_description AS description,
  0 AS points_value,
  NULL::text AS icon,
  NULL::text AS color,
  NULL::text AS category,
  NULL::text AS difficulty,
  pm.achieved_date::timestamptz AS awarded_at,
  '{}'::jsonb AS metadata,
  pm.created_at,
  pm.created_at AS updated_at,
  'player_milestones'::text AS source_table
FROM player_milestones pm;

-- 6. Notice trigger for legacy tables (soft warning only)
-- Simplified (removed DO blocks for broader SQL editor compatibility)
DROP FUNCTION IF EXISTS legacy_table_notice();
CREATE FUNCTION legacy_table_notice()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Legacy table % will be deprecated. Use player_recognitions.', TG_TABLE_NAME;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Re-create triggers individually (safe if tables exist)
DROP TRIGGER IF EXISTS trg_legacy_notice ON achievements;
CREATE TRIGGER trg_legacy_notice BEFORE INSERT OR UPDATE ON achievements
FOR EACH ROW EXECUTE FUNCTION legacy_table_notice();

DROP TRIGGER IF EXISTS trg_legacy_notice ON helmet_stickers;
CREATE TRIGGER trg_legacy_notice BEFORE INSERT OR UPDATE ON helmet_stickers
FOR EACH ROW EXECUTE FUNCTION legacy_table_notice();

DROP TRIGGER IF EXISTS trg_legacy_notice ON player_awards;
CREATE TRIGGER trg_legacy_notice BEFORE INSERT OR UPDATE ON player_awards
FOR EACH ROW EXECUTE FUNCTION legacy_table_notice();

DROP TRIGGER IF EXISTS trg_legacy_notice ON player_milestones;
CREATE TRIGGER trg_legacy_notice BEFORE INSERT OR UPDATE ON player_milestones
FOR EACH ROW EXECUTE FUNCTION legacy_table_notice();

-- 7. Safety comment
COMMENT ON TABLE player_recognitions IS 'Unified recognition table (Wave 2 will backfill from achievements, helmet_stickers, player_awards, player_milestones).';
