# Supabase Linter Checklist

This checklist is based on the Supabase Database Linter output you pasted (Dec 2025).

## ✅ Fix in SQL migrations (repo-managed)

### [ ] 0010 `security_definer_view` (ERROR)
**What it means**: Postgres views are SECURITY DEFINER by default, which can bypass RLS depending on ownership.

**Fix**: Set affected views to `security_invoker = true`.

**Implemented**: Migration [supabase/migrations/20251222120000_supabase_linter_security_fixes.sql](../../supabase/migrations/20251222120000_supabase_linter_security_fixes.sql)

Views covered:
- `public.orphaned_personnel_configs`
- `public.plays_missing_formation_link`
- `public.live_sessions`
- `public.play_tab_usage_analytics`
- `public.plays_missing_personnel_link`
- `public.game_plan_analytics`
- `public.game_plans_enhanced`
- `public.play_overall_confidence`
- `public.practice_vs_game_comparison`
- `public.formations_missing_personnel`
- `public.situational_play_recommendations`
- `public.play_confidence_stats`
- `public.play_creation_analytics`
- `public.season_stats`
- `public.formation_quality_analytics`
- `public.team_play_analytics_summary`

### [ ] 0013 `rls_disabled_in_public` (ERROR)
**What it means**: A table is in `public` (exposed to PostgREST) but RLS isn’t enabled.

Table:
- `public.formation_sync_audit`

**Fix**:
- Enable RLS
- Ensure anon/authenticated can’t read it (unless explicitly intended)

**Implemented**: Migration [supabase/migrations/20251222120000_supabase_linter_security_fixes.sql](../../supabase/migrations/20251222120000_supabase_linter_security_fixes.sql)

## ⚠️ Fixable in SQL (recommended), but treat as a sweep

### [ ] 0011 `function_search_path_mutable` (WARN)
**What it means**: Functions without a fixed `search_path` can be vulnerable to object-shadowing attacks.

**Best practice**:
- For `SECURITY DEFINER` functions: always set `SET search_path = pg_catalog, public, extensions` (or similar)
- For `SECURITY INVOKER` functions: still recommended to set search_path, but it’s less critical

**Implemented**:
- `public.boxcall_global_search` now sets `search_path` in its definition.
- Migration [supabase/migrations/20251222121000_fix_function_search_path.sql](../../supabase/migrations/20251222121000_fix_function_search_path.sql) applies `SET search_path = pg_catalog, public, extensions` to all overloads of the flagged functions.

## ⚠️ Supabase platform / dashboard settings (not repo-managed)

### [ ] `auth_leaked_password_protection` (WARN)
Enable leaked password protection in Supabase Auth settings.

### [ ] `vulnerable_postgres_version` (WARN)
Upgrade the Supabase Postgres version via the Supabase dashboard.

## ⚠️ Extension placement (WARN)
### [ ] 0014 `extension_in_public` (WARN)
Extensions flagged:
- `pg_trgm`
- `uuid-ossp`
- `pgcrypto`

**Fix**: move them to `extensions` schema.

**Implemented (best-effort)**:
- Migration [supabase/migrations/20251222120000_supabase_linter_security_fixes.sql](../../supabase/migrations/20251222120000_supabase_linter_security_fixes.sql)
- Also updated [supabase/migrations/20251221220000_global_search_rpc.sql](../../supabase/migrations/20251221220000_global_search_rpc.sql) to install `pg_trgm` into `extensions`.

## After deploying migrations

1. Apply new migrations in Supabase.
2. Re-run Supabase Database Linter.
3. Smoke test in-app screens that rely on the views (game plan analytics, linking audits, sessions).
