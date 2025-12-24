-- Supabase Database Linter Fixes (Security)
-- Addresses:
-- - 0010_security_definer_view: convert selected public views to SECURITY INVOKER
-- - 0013_rls_disabled_in_public: enable RLS on formation_sync_audit (audit table)
-- - 0014_extension_in_public: move common extensions to extensions schema (best-effort)
-- - 0011_function_search_path_mutable: set search_path for boxcall_global_search

-- Supabase linter prefers extensions not in public schema.
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    BEGIN
      EXECUTE 'ALTER EXTENSION pg_trgm SET SCHEMA extensions';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION pg_trgm SET SCHEMA extensions (insufficient privileges)';
      WHEN others THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION pg_trgm SET SCHEMA extensions (%).', SQLERRM;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    BEGIN
      EXECUTE 'ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions (insufficient privileges)';
      WHEN others THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions (%).', SQLERRM;
    END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    BEGIN
      EXECUTE 'ALTER EXTENSION pgcrypto SET SCHEMA extensions';
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION pgcrypto SET SCHEMA extensions (insufficient privileges)';
      WHEN others THEN
        RAISE NOTICE 'Skipping ALTER EXTENSION pgcrypto SET SCHEMA extensions (%).', SQLERRM;
    END;
  END IF;
END
$$;

-- Views are SECURITY DEFINER (owner privileges) by default in Postgres.
-- Flip to SECURITY INVOKER so RLS and privileges apply to the querying user.
ALTER VIEW IF EXISTS public.orphaned_personnel_configs SET (security_invoker = true);
ALTER VIEW IF EXISTS public.plays_missing_formation_link SET (security_invoker = true);
ALTER VIEW IF EXISTS public.live_sessions SET (security_invoker = true);
ALTER VIEW IF EXISTS public.play_tab_usage_analytics SET (security_invoker = true);
ALTER VIEW IF EXISTS public.plays_missing_personnel_link SET (security_invoker = true);
ALTER VIEW IF EXISTS public.game_plan_analytics SET (security_invoker = true);
ALTER VIEW IF EXISTS public.game_plans_enhanced SET (security_invoker = true);
ALTER VIEW IF EXISTS public.play_overall_confidence SET (security_invoker = true);
ALTER VIEW IF EXISTS public.practice_vs_game_comparison SET (security_invoker = true);
ALTER VIEW IF EXISTS public.formations_missing_personnel SET (security_invoker = true);
ALTER VIEW IF EXISTS public.situational_play_recommendations SET (security_invoker = true);
ALTER VIEW IF EXISTS public.play_confidence_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.play_creation_analytics SET (security_invoker = true);
ALTER VIEW IF EXISTS public.season_stats SET (security_invoker = true);
ALTER VIEW IF EXISTS public.formation_quality_analytics SET (security_invoker = true);
ALTER VIEW IF EXISTS public.team_play_analytics_summary SET (security_invoker = true);

-- formation_sync_audit is an internal audit table and should not be readable from PostgREST.
-- Enabling RLS with no policies blocks anon/authenticated access.
ALTER TABLE IF EXISTS public.formation_sync_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.formation_sync_audit FROM anon;
REVOKE ALL ON TABLE public.formation_sync_audit FROM authenticated;

-- Fix search_path warning for our new global search RPC.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'boxcall_global_search'
      AND pg_get_function_identity_arguments(p.oid) = 'p_team_id uuid, p_query text, p_playbook_id uuid, p_limit_per_type integer, p_limit_total integer'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.boxcall_global_search(uuid, text, uuid, integer, integer) SET search_path = public, extensions';
  END IF;
END
$$;
