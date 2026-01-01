# BoxCall Database Roadmap - Bulletproof & Industry-Leading

**Date:** December 11, 2025  
**Status:** Phase 1-2 Complete ✅ | All 8 Migrations Deployed ✅

---

## Current State Summary

### ✅ Completed Migrations (All Deployed)

| Migration                                          | Purpose                                                    | Status          |
| -------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| `20251211200000_fix_rls_with_security_definer.sql` | Fix RLS infinite recursion with `public.get_my_team_ids()` | ✅ Deployed     |
| `20251211210000_add_missing_tables.sql`            | Add 12 core tables (games, sessions, achievements, social) | ✅ Deployed     |
| `20251211220000_fix_session_tables_schema.sql`     | Fix session table columns                                  | ✅ Deployed     |
| `20251211230001_part1_columns.sql`                 | Add missing columns (plays, formations, game_plans)        | ✅ Deployed     |
| `20251211230002_part2_tables.sql`                  | Create tables (notifications, mentions, etc.)              | ✅ Deployed     |
| `20251211230003_part3_rls.sql`                     | Bulletproof RLS for social tables                          | ✅ Deployed     |
| `20251211230004_part4_core_rls_views.sql`          | Core table RLS + analytics views                           | ✅ Deployed     |
| `20251211230005_part5_fix_game_plans.sql`          | Fix game_plans schema (name, notes, game_location)         | ✅ Deployed     |
| `20251211240000_confidence_system.sql`             | Analytics views for play confidence tracking               | ⏳ **RUN NEXT** |

### 🔧 Code Fixes Applied

| File                                        | Fix                                                                       | Status  |
| ------------------------------------------- | ------------------------------------------------------------------------- | ------- |
| `src/services/executionTrackingService.ts`  | Fixed `game_plans` join (removed invalid `name`, `game_location` columns) | ✅ Done |
| `src/app/auth-store.ts`                     | Removed duplicate console logging (3 warnings fixed)                      | ✅ Done |
| `src/hooks/calendar/useCalendarPrefetch.ts` | Fixed infinite re-render loop                                             | ✅ Done |
| `src/hooks/calendar/useCalendarUrlState.ts` | Fixed infinite re-render loop                                             | ✅ Done |

### ✅ Validation Status

| Check                             | Status      |
| --------------------------------- | ----------- |
| TypeScript (`npm run type-check`) | ✅ Passes   |
| ESLint (`npm run lint`)           | ✅ Passes   |
| App loads without RLS errors      | ✅ Verified |

### 🎯 Database Architecture Principles

1. **Single Source of Truth**: `public.get_my_team_ids()` SECURITY DEFINER function for ALL team-based RLS
2. **No Circular Dependencies**: RLS policies never query team_members directly
3. **Idempotent Migrations**: All migrations use `IF NOT EXISTS` / `IF EXISTS` patterns
4. **Performance First**: Strategic indexes on every foreign key and common query pattern

---

## ✅ ALL MIGRATIONS COMPLETE

All 8 bulletproof migrations have been deployed. The database now has:

- ✅ `public.get_my_team_ids()` SECURITY DEFINER function (no RLS recursion)
- ✅ All missing tables created (games, sessions, achievements, social)
- ✅ All missing columns added (plays, formations, game_plans)
- ✅ Bulletproof RLS policies on all tables
- ✅ Analytics views created
- ✅ Performance indexes added

---

## Phase 3: Dead Code Cleanup (NEXT)

These tables/services are referenced in code but need refactoring:

| Reference            | Issue                        | Action                       | Priority |
| -------------------- | ---------------------------- | ---------------------------- | -------- |
| `super_admins`       | Not implemented              | Remove service code          | LOW      |
| `support_tickets`    | Not implemented              | Remove service code          | LOW      |
| `team_files`         | Not implemented              | Remove service code          | LOW      |
| `team_goals`         | Not implemented              | Remove service code          | LOW      |
| `user_profiles`      | Duplicate of `profiles`      | Refactor to use `profiles`   | MEDIUM   |
| `users`              | Should use `auth.users`      | Refactor to use `auth.users` | MEDIUM   |
| `gamePlanService.ts` | Uses columns added in Part 5 | Verify after Part 5 runs     | HIGH     |

### Test Files to Fix (Mock Issues)

Some test files have Supabase mock issues causing 14 test failures:

| Test File                                         | Issue                             | Action         |
| ------------------------------------------------- | --------------------------------- | -------------- |
| `src/routes/__tests__/authorize.test.ts`          | Mock `.maybeSingle()` not defined | Fix mock setup |
| `src/routes/__tests__/basicLoaders.test.tsx`      | Mock `.maybeSingle()` not defined | Fix mock setup |
| `src/routes/__tests__/analyticsLoader.test.tsx`   | Mock `.maybeSingle()` not defined | Fix mock setup |
| `src/routes/__tests__/dashboardsLoaders.test.tsx` | Mock `.maybeSingle()` not defined | Fix mock setup |
| `src/routes/__tests__/roleLoaders.test.tsx`       | Mock `.maybeSingle()` not defined | Fix mock setup |
| `src/routes/__tests__/loaderAuth.test.tsx`        | Mock `.maybeSingle()` not defined | Fix mock setup |

---

## Phase 4: Performance Optimization Roadmap

### 4.1 Query Optimization (Priority: HIGH)

- [ ] Add database functions for complex queries
- [ ] Create materialized views for dashboard stats
- [ ] Implement connection pooling (PgBouncer)

### 4.2 Caching Strategy (Priority: HIGH)

- [x] React Query: 10min staleTime, 30min gcTime
- [ ] Redis for server-side caching
- [ ] Edge caching for static assets

### 4.3 Index Optimization (Priority: MEDIUM)

- [x] Basic indexes on FKs and common filters
- [ ] Analyze slow queries with `EXPLAIN ANALYZE`
- [ ] Add covering indexes for hot paths
- [ ] Implement partial indexes for archived data

### 4.4 Data Archival (Priority: MEDIUM)

- [ ] Archive old practice_sessions (>1 year)
- [ ] Archive old play_executions (>1 year)
- [ ] Implement soft delete with is_archived flags

---

## Phase 5: Industry-Leading Features

### 5.1 Real-time Subscriptions

```sql
-- Already supported via Supabase Realtime
-- Enable on key tables:
ALTER PUBLICATION supabase_realtime ADD TABLE team_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE play_executions;
```

### 5.2 Full-Text Search

```sql
-- Add to plays table
ALTER TABLE plays ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_plays_search ON plays USING gin(search_vector);

-- Update trigger
CREATE OR REPLACE FUNCTION plays_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.formation, '') || ' ' ||
    COALESCE(NEW.personnel, '') || ' ' ||
    COALESCE(NEW.notes, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Audit Logging

```sql
-- Create audit table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add triggers to important tables
```

### 5.4 Database Functions for Complex Operations

```sql
-- Example: Get team dashboard stats in single query
CREATE OR REPLACE FUNCTION get_team_dashboard_stats(p_team_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'play_count', (SELECT COUNT(*) FROM plays p JOIN playbooks pb ON pb.id = p.playbook_id WHERE pb.team_id = p_team_id),
    'game_plan_count', (SELECT COUNT(*) FROM game_plans WHERE team_id = p_team_id),
    'practice_script_count', (SELECT COUNT(*) FROM practice_scripts WHERE team_id = p_team_id),
    'recent_activity', (SELECT json_agg(a) FROM (
      SELECT * FROM activities WHERE team_id = p_team_id ORDER BY created_at DESC LIMIT 10
    ) a)
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## Migration Checklist

### Before Running Any Migration

- [ ] Backup database (Supabase dashboard → Database → Backups)
- [ ] Test in development environment first
- [ ] Review migration SQL for correctness

### After Running Migration

- [ ] Verify no console errors in app
- [ ] Test key features (Playbook, Game Plans, Practice Scripts)
- [ ] Check RLS is working (can only see own team's data)
- [ ] Monitor Supabase logs for any policy violations

---

## Table Count Summary

| Category      | Count  | Tables                                                                                                                                        |
| ------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Core          | 6      | teams, team_members, team_players, profiles, playbooks, plays                                                                                 |
| Game Planning | 4      | game_plans, game_plan_situations, game_plan_plays, games                                                                                      |
| Practice      | 6      | practice_scripts, practice_script_plays, practice_schedules, practice_templates, practice_attendance, practice_sessions                       |
| Sessions      | 3      | game_sessions, play_executions, activities                                                                                                    |
| Social        | 8      | team_announcements, announcement_reactions, announcement_comments, announcement_views, comment_reactions, mentions, notifications, team_posts |
| Library       | 3      | formations, personnel_configurations, personnel_players                                                                                       |
| Other         | 6      | achievements, achievement_definitions, achievement_progress, calendar_events, team_events, equipment                                          |
| **Total**     | **36** |                                                                                                                                               |

---

## Quick Reference: The Bulletproof RLS Pattern

```sql
-- For tables with direct team_id:
CREATE POLICY "table_select" ON table_name
  FOR SELECT USING (team_id IN (SELECT public.get_my_team_ids()));

-- For tables linked through playbooks:
CREATE POLICY "table_select" ON table_name
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playbooks pb
      WHERE pb.id = table_name.playbook_id
      AND pb.team_id IN (SELECT public.get_my_team_ids())
    )
  );

-- For user-owned data:
CREATE POLICY "table_select" ON table_name
  FOR SELECT USING (user_id = auth.uid());
```

This pattern NEVER causes infinite recursion because `get_my_team_ids()` is SECURITY DEFINER and bypasses RLS.

---

## 🚀 What's Next (Priority Order)

### Immediate (Today)

1. **Run Part 5 Migration** - Fixes game_plans schema, unblocks gamePlanService
2. **Test App** - Verify 400 errors are resolved
3. **Regenerate Types** - Run `npm run db:types` if available, or manually update `src/types/database.ts`

### Short-term (This Week)

4. **Fix Test Mocks** - Fix the 14 failing tests with Supabase mock issues
5. **Dead Code Cleanup** - Remove unused service references
6. **Type Sync** - Ensure `src/types/database.ts` matches actual schema

### Medium-term (Next Sprint)

7. **Performance Monitoring** - Add query timing, identify slow queries
8. **Real-time Subscriptions** - Enable for notifications, announcements
9. **Full-Text Search** - Add to plays table for better search

### Long-term (Future)

10. **Audit Logging** - Track all data changes
11. **Data Archival** - Archive old sessions (>1 year)
12. **Redis Caching** - Server-side caching for hot paths
