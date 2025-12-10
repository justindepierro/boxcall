# BoxCall API Architecture - Industry-Leading Data Layer

## Overview

BoxCall now uses a **unified API client architecture** that provides:

- ✅ **Blazing Fast Performance** - Request deduplication, parallel queries, smart caching
- ✅ **Bulletproof Reliability** - Automatic retry with exponential backoff
- ✅ **Type Safety** - Full TypeScript support with database types
- ✅ **Auth Token Management** - Automatic token sync between auth and data layers
- ✅ **Future-Proof** - Easy to extend, test, and maintain

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        React Components                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ PlaybookPage │    │  GamePlans   │    │   BoxCall    │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              React Query Hooks Layer                  │       │
│  │  (usePlaybookData, useGamePlans, usePracticeScripts) │       │
│  └──────────────────────────┬───────────────────────────┘       │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────┐       │
│  │             Unified ApiClient (api())                 │       │
│  │  - Request deduplication                              │       │
│  │  - Automatic retry with backoff                       │       │
│  │  - Auth token management                              │       │
│  │  - Type-safe query builder                            │       │
│  └──────────────────────────┬───────────────────────────┘       │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Supabase REST  │
                    │      API        │
                    └─────────────────┘
```

## Key Components

### 1. ApiClient (`src/lib/api/client.ts`)

The core data fetching client with:

```typescript
import { api } from "@/lib/api";

// Simple queries
const { data, error } = await api("plays")
  .select("*")
  .eq("playbook_id", playbookId)
  .order("created_at", { ascending: false });

// Parallel queries with automatic deduplication
const [plays, formations] = await Promise.all([
  api("plays").select("*").in("playbook_id", ids),
  api("formations").select("*").in("playbook_id", ids),
]);
```

**Features:**

- **Request Deduplication**: Same query called twice = one network request
- **Automatic Retry**: 3 retries with exponential backoff (1s, 2s, 4s)
- **30s Timeout**: Prevents hanging requests
- **Smart Error Handling**: Don't retry 4xx errors (except 408, 429)

### 2. React Query Hooks (`src/lib/api/hooks.ts`)

Pre-built hooks for common data needs:

```typescript
import { usePlaybookData, useGamePlans, usePracticeScripts } from "@/lib/api";

// Get all playbook data in one hook
const { playbooks, plays, formations, isLoading, error } =
  usePlaybookData(teamId);

// Get game plans
const { data: gamePlans, isLoading } = useGamePlans(teamId);

// Get practice scripts
const { data: scripts, isLoading } = usePracticeScripts(teamId);
```

### 3. Auth Integration (`src/lib/supabase.ts`)

Auth tokens automatically sync to the ApiClient:

```typescript
// When user logs in, token is automatically synced
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    ApiClient.setAccessToken(session.access_token);
  } else {
    ApiClient.setAccessToken(null);
  }
});
```

## Performance Optimizations

### Request Deduplication

```typescript
// These two calls result in ONE network request
const result1 = api("plays").select("*").eq("team_id", "123");
const result2 = api("plays").select("*").eq("team_id", "123");

// Both resolve with the same data
await Promise.all([result1, result2]); // 1 HTTP request
```

### React Query Caching

```typescript
// Default cache settings
staleTime: 10 * 60 * 1000,  // 10 minutes - data considered fresh
gcTime: 30 * 60 * 1000,     // 30 minutes - cache lifetime
refetchOnWindowFocus: false, // Use cached data
refetchOnMount: false,       // Use cached data on mount
```

### Parallel Queries

```typescript
// BAD: Sequential (3 network roundtrips)
const teams = await api("teams").select("*");
const playbooks = await api("playbooks").select("*");
const plays = await api("plays").select("*");

// GOOD: Parallel (1 network roundtrip)
const [teams, playbooks, plays] = await Promise.all([
  api("teams").select("*"),
  api("playbooks").select("*"),
  api("plays").select("*"),
]);
```

## Migration Guide

### Before (Direct Supabase Client)

```typescript
// ❌ Old approach - could hang, no deduplication
const { data, error } = await supabase
  .from("plays")
  .select("*")
  .eq("team_id", teamId);
```

### After (Unified ApiClient)

```typescript
// ✅ New approach - reliable, deduplicated, type-safe
const { data, error } = await api("plays").select("*").eq("team_id", teamId);
```

## When to Use What

| Use Case                       | Solution                                    |
| ------------------------------ | ------------------------------------------- |
| Data fetching in components    | React Query hooks (`usePlaybookData`, etc.) |
| Data fetching in services      | `api()` function                            |
| Auth operations (login/logout) | Supabase client (`supabase.auth.*`)         |
| Real-time subscriptions        | Supabase client (`supabase.channel()`)      |

## Error Handling

```typescript
const { data, error } = await api("plays").select("*");

if (error) {
  console.error("API Error:", {
    message: error.message,
    code: error.code,
    status: error.status,
  });
  return;
}

// Use data safely
console.log(`Loaded ${data.length} plays`);
```

## Troubleshooting

### "No data returned"

1. Check if user is authenticated
2. Check RLS policies on the table
3. Enable dev logging: `console.log` statements in ApiClient

### "Request timeout"

1. Check network connectivity
2. Increase timeout in ApiClient config
3. Check if database is under load

### "Auth token not found"

1. Clear localStorage and re-login
2. Check if `onAuthStateChange` is firing
3. Verify `boxcall-auth` key in localStorage

## Files

| File                    | Purpose                           |
| ----------------------- | --------------------------------- |
| `src/lib/api/client.ts` | Core ApiClient with retry logic   |
| `src/lib/api/hooks.ts`  | React Query hooks for common data |
| `src/lib/api/index.ts`  | Public exports                    |
| `src/lib/supabase.ts`   | Supabase client + auth sync       |
