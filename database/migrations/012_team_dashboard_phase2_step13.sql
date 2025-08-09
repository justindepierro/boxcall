-- Migration: Team Dashboard Phase 2 Step 13
-- Purpose: Introduce core tables for events and game results plus season aggregate stats view.
-- NOTE: RLS and policies will be added in Step 14 (separate commit for clearer audit).
-- If deploying to Supabase, ensure this runs before policy migration.

-- Safety: create required extension for UUID generation if not present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. ENUM TYPES (idempotent guards)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE public.event_type AS ENUM ('practice','game','meeting','workout','other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_site') THEN
    CREATE TYPE public.game_site AS ENUM ('home','away','neutral');
  END IF;
END $$;

-- 2. TEAM EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.team_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type public.event_type NOT NULL DEFAULT 'other',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Basic updated_at trigger (reuse global trigger function if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_team_events_updated_at'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
    ) THEN
      CREATE TRIGGER trg_team_events_updated_at
        BEFORE UPDATE ON public.team_events
        FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    END IF;
  END IF;
END $$;

-- Indexes for team_events
CREATE INDEX IF NOT EXISTS idx_team_events_team_id_starts_at_desc ON public.team_events (team_id, starts_at DESC);
-- NOTE: Removed attempted partial index filtered by starts_at >= now();
-- Reason: Postgres error 42P17 (functions in index predicate must be IMMUTABLE) because now() is VOLATILE.
-- Planner can still efficiently satisfy upcoming events queries with the existing (team_id, starts_at DESC) btree index
-- via a backward/forward scan plus range condition (starts_at >= now()). If future profiling shows need for a
-- narrower index, consider:
--   * Creating a BRIN index on starts_at for very large tables, or
--   * Periodically maintaining a materialized view of upcoming events.
-- For now no additional index is created to avoid redundancy.

-- 3. GAME RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  opponent TEXT NOT NULL,
  site public.game_site NOT NULL DEFAULT 'home',
  points_for INTEGER NOT NULL CHECK (points_for >= 0),
  points_against INTEGER NOT NULL CHECK (points_against >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for recent results per team
CREATE INDEX IF NOT EXISTS idx_game_results_team_id_date_desc ON public.game_results (team_id, game_date DESC);

-- 4. SEASON STATS VIEW
-- Drops & recreates to stay idempotent (view is derived only)
DROP VIEW IF EXISTS public.season_stats;
CREATE VIEW public.season_stats AS
SELECT
  gr.team_id,
  date_part('year', gr.game_date)::INT AS season_year,
  COUNT(*) AS games_played,
  COUNT(*) FILTER (WHERE gr.points_for > gr.points_against) AS wins,
  COUNT(*) FILTER (WHERE gr.points_for < gr.points_against) AS losses,
  SUM(gr.points_for) AS pf_total,
  SUM(gr.points_against) AS pa_total,
  (CASE WHEN COUNT(*) > 0 THEN ROUND( (COUNT(*) FILTER (WHERE gr.points_for > gr.points_against)::numeric / COUNT(*)) * 100, 1) ELSE NULL END) AS win_pct
FROM public.game_results gr
GROUP BY gr.team_id, date_part('year', gr.game_date);

-- 5. COMMENTARY / FUTURE (not executed) -------------------------------------------------
-- RLS Enable + Policies will be handled in 012b / Step 14 migration:
--   ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
--   (Policies referencing membership & capability mapping)
-- Add potential future indexes:
--   CREATE INDEX idx_game_results_team_outcome ON public.game_results (team_id, (points_for > points_against));

-- 6. TEAM_POSTS (existing) - Optional feed optimization index for pinned posts
CREATE INDEX IF NOT EXISTS idx_team_posts_pinned_order ON public.team_posts (team_id, is_pinned, created_at DESC);

-- END OF STEP 13 MIGRATION
