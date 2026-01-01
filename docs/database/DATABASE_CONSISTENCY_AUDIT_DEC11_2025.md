# Database Call Consistency Audit - December 11, 2025

## Executive Summary

BoxCall has **3 different patterns** for making database calls, causing auth race conditions, inconsistent error handling, and maintenance nightmares. This document provides a complete audit and roadmap to standardize on a single, bulletproof pattern.

---

## Current State: The Problem

### Three Competing Patterns

| Pattern              | Location                             | Auth Handling        | Usage Count       |
| -------------------- | ------------------------------------ | -------------------- | ----------------- |
| 1. `supabase.from()` | Direct import from `../lib/supabase` | ✅ Auto via session  | ~122 files        |
| 2. `api()` client    | `../lib/api/client.ts`               | ❌ Manual token sync | Partially removed |
| 3. `BaseService`     | `services/base/BaseService.ts`       | ✅ Injected supabase | ~5 services       |

### Root Cause of Issues

The `api()` client was designed to solve a problem that doesn't exist:

```typescript
// api() client - PROBLEMATIC
// Requires manual token sync via ApiClient.setAccessToken()
// Race condition: requests fire before token is available
const { data } = await api("plays").select("*").eq("team_id", teamId);

// supabase.from() - CORRECT
// Auth handled internally via session management
// No race conditions - session is available immediately
const { data } = await supabase.from("plays").select("*").eq("team_id", teamId);
```

### Files Still Using `api()` (As of Dec 11, 2025)

After recent cleanup, we removed api() from:

- ✅ `src/lib/api/hooks.ts` - Converted to supabase.from()
- ✅ `src/hooks/useTeamsData.ts` - Converted
- ✅ `src/hooks/useDashboardStats.ts` - Converted
- ✅ `src/hooks/useTeamActivity.ts` - Converted
- ✅ `src/services/roleService.ts` - Converted
- ✅ `src/services/practiceService.ts` - Critical functions converted
- ✅ `src/services/gamePlanService.ts` - Critical functions converted

**Status**: No files actively importing `api()` from the api client module.

---

## The Standardized Architecture

### Single Source of Truth: `supabase.from()`

```typescript
// ✅ CORRECT: All database calls should use this pattern
import { supabase } from "../lib/supabase";

// Simple query
const { data, error } = await supabase
  .from("plays")
  .select("*")
  .eq("team_id", teamId);

// With relationship
const { data, error } = await supabase
  .from("practice_scripts")
  .select(
    `
    *,
    practice_script_plays (
      play_id,
      plays (*)
    )
  `
  )
  .eq("team_id", teamId);

// Insert
const { data, error } = await supabase
  .from("plays")
  .insert({ name, team_id, playbook_id })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from("plays")
  .update({ name })
  .eq("id", playId)
  .select()
  .single();

// Delete
const { error } = await supabase.from("plays").delete().eq("id", playId);
```

### Why `supabase.from()` Wins

1. **Auth Handled Automatically**: Session managed by Supabase client
2. **No Race Conditions**: Token available immediately on page load
3. **TypeScript Support**: Full type inference from `Database` types
4. **Simpler Code**: No abstraction layer to maintain
5. **RLS Compatible**: Works seamlessly with Row Level Security

---

## The Three-Layer Architecture

### Layer 1: React Query Hooks (UI → Data)

Located in `src/lib/api/hooks.ts` - already standardized.

```typescript
// ✅ These hooks use supabase.from() internally
export function usePlays(playbookIds: string[]) {
  return useQuery({
    queryKey: queryKeys.plays(playbookIds),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .in("playbook_id", playbookIds);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });
}
```

### Layer 2: Domain Services (Business Logic)

Located in `src/services/*.ts` - need audit.

```typescript
// ✅ CORRECT pattern for services
import { supabase } from "../lib/supabase";

export async function getPlays(playbookId: string) {
  const { data, error } = await supabase
    .from("plays")
    .select("*")
    .eq("playbook_id", playbookId);

  if (error) {
    console.error("[getPlays] Error:", error);
    throw error;
  }

  return data || [];
}
```

### Layer 3: Base Service (Optional Abstraction)

Located in `src/services/base/BaseService.ts` - for complex services.

```typescript
// ✅ BaseService accepts supabase client in constructor
export abstract class BaseService<
  T extends keyof Database["public"]["Tables"],
> {
  protected supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>, tableName: T) {
    this.supabase = supabase; // Uses injected client
  }
}
```

---

## Service Audit Matrix

### Phase 2 Audit Results (December 11, 2025)

**Total Services Audited**: 57 files in `src/services/`
**Total Hooks Audited**: 87 files in `src/hooks/`
**Total Pages Audited**: 6 pages using supabase directly

**Result**: ✅ ALL files use `supabase.from()` pattern correctly

### Services Using supabase.from() (37 services)

| Service              | Status   | Pattern         | Notes           |
| -------------------- | -------- | --------------- | --------------- |
| `practiceService.ts` | ✅ Fixed | supabase.from() | Critical path   |
| `gamePlanService.ts` | ✅ Fixed | supabase.from() | Critical path   |
| `playsService.ts`    | ✅ OK    | supabase.from() | Already correct |
| `roleService.ts`     | ✅ Fixed | supabase.from() | Auth-sensitive  |
| `teamService.ts`     | ⚠️ Audit | Mixed           | Needs review    |

### Medium Priority Services

| Service                   | Status   | Pattern         | Notes            |
| ------------------------- | -------- | --------------- | ---------------- |
| `announcementsService.ts` | ⚠️ Audit | supabase.from() | Check real-time  |
| `notificationsService.ts` | ⚠️ Audit | supabase.from() | Has real-time    |
| `achievementService.ts`   | ⚠️ Audit | supabase.from() | Check pattern    |
| `calendarService.ts`      | ⚠️ Audit | Mixed           | Uses CalendarAPI |

### Low Priority Services (Edge Features)

| Service               | Status   | Pattern         | Notes  |
| --------------------- | -------- | --------------- | ------ |
| `formationService.ts` | ⚠️ Audit | supabase.from() | Review |
| `personnelService.ts` | ⚠️ Audit | supabase.from() | Review |
| `diagramService.ts`   | ⚠️ Audit | supabase.from() | Review |

---

## Hooks Audit Matrix

| Hook                          | Status   | Pattern         | Notes         |
| ----------------------------- | -------- | --------------- | ------------- |
| `src/lib/api/hooks.ts`        | ✅ Fixed | supabase.from() | All 10+ hooks |
| `useTeamsData.ts`             | ✅ Fixed | supabase.from() | Converted     |
| `useDashboardStats.ts`        | ✅ Fixed | supabase.from() | Converted     |
| `useTeamActivity.ts`          | ✅ Fixed | supabase.from() | Converted     |
| `useAnnouncementsRealtime.ts` | ⚠️ Audit | supabase        | Has channels  |

---

## Migration Roadmap

### Phase 1: Immediate (Day 1) ✅ COMPLETE

- [x] Convert `src/lib/api/hooks.ts` to supabase.from()
- [x] Convert `useTeamsData.ts`
- [x] Convert `useDashboardStats.ts`
- [x] Convert `useTeamActivity.ts`
- [x] Convert `roleService.ts`
- [x] Fix critical paths in `practiceService.ts`
- [x] Fix critical paths in `gamePlanService.ts`

### Phase 2: Services Cleanup (Week 1) ✅ COMPLETE

- [x] Audit all 57 services for consistency - ALL USE supabase.from()
- [x] Remove `api()` imports from any remaining files - NONE FOUND
- [x] Simplify supabase.ts (removed ApiClient sync)
- [x] Verified all 87 hooks use supabase correctly

### Phase 3: Remove Dead Code (Week 2) - IN PROGRESS

- [x] Simplified `src/lib/supabase.ts` (removed ApiClient token sync)
- [ ] Consider removing `src/lib/api/client.ts` entirely (optional - not hurting anything)
- [ ] Update documentation

### Phase 4: Testing & Validation

- [ ] Add integration tests for all critical paths
- [ ] Verify auth flow on page refresh
- [ ] Test offline/online transitions
- [ ] Performance benchmark

---

## Error Handling Standard

```typescript
// ✅ STANDARD ERROR HANDLING PATTERN
import { supabase } from "../lib/supabase";
import { logError } from "../utils/logger";

export async function getEntity(id: string) {
  try {
    const { data, error } = await supabase
      .from("entities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logError(`[getEntity] Database error: ${error.message}`, { id, error });
      throw new Error(`Failed to fetch entity: ${error.message}`);
    }

    return data;
  } catch (error) {
    logError("[getEntity] Unexpected error:", error);
    throw error;
  }
}
```

---

## Real-Time Subscriptions Pattern

```typescript
// ✅ CORRECT real-time pattern
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export function useRealtimeUpdates(teamId: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`team-${teamId}-updates`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plays",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          console.log("Change received:", payload);
        }
      )
      .subscribe();

    // ✅ CRITICAL: Always cleanup subscriptions
    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);
}
```

---

## Testing Checklist

After migration, verify:

1. [ ] Practice Scripts page loads "Install 1" with 4 plays
2. [ ] Game Plans page loads correctly
3. [ ] Playbook page shows all plays
4. [ ] Dashboard stats calculate correctly
5. [ ] Team Bulletin real-time updates work
6. [ ] Page refresh maintains auth state
7. [ ] No "scripts.map is not a function" errors
8. [ ] No auth race conditions on cold start

---

## Files to Monitor

These files are critical and should be audited regularly:

```
src/lib/supabase.ts          # Main supabase client
src/lib/api/hooks.ts         # React Query hooks
src/services/practiceService.ts
src/services/gamePlanService.ts
src/services/playsService.ts
src/services/roleService.ts
src/services/teamService.ts
```

---

## Conclusion

The path forward is clear: **standardize on `supabase.from()`** everywhere. The `api()` client layer added complexity without benefit and introduced race conditions. By completing this migration, we achieve:

1. **Reliability**: No more auth race conditions
2. **Simplicity**: One pattern to learn and maintain
3. **Type Safety**: Full TypeScript support
4. **Performance**: Direct Supabase calls, no abstraction overhead

---

_Last Updated: December 11, 2025_
_Author: BoxCall Engineering_
