# Supabase Standardization Roadmap

## Executive Summary

**Date**: December 11, 2025  
**Priority**: CRITICAL  
**Status**: Blocking all database functionality

The BoxCall app has accumulated significant technical debt in its Supabase integration, resulting in queries that hang indefinitely despite valid credentials. This document outlines the complete audit findings and standardization roadmap.

---

## Current State Analysis

### Problem Statement

Database queries hang indefinitely. Direct `fetch()` calls to Supabase REST API work perfectly, proving:

- ✅ Network connectivity is working
- ✅ Auth tokens in localStorage are valid
- ✅ Supabase server is responding
- ❌ **Supabase JS client is stuck/broken**

### Root Cause

The Supabase client initialization and auth management has become overly complex with multiple competing systems:

1. **Over-engineered auth-store.ts** (1,501 lines!)
   - 59+ debug/logging statements
   - Multiple redundant caching layers
   - Custom session management that conflicts with Supabase's built-in handling
   - Race conditions between manual `setSession()` and auto-initialization

2. **Conflicting session management**
   - Supabase auto-loads from `boxcall-auth` localStorage key
   - `auth-store.ts` manually reads same key and tries to set session again
   - Web Locks API causing deadlocks on `getSession()` calls

3. **No clear data flow pattern**
   - Some hooks use React Query
   - Some hooks call `supabase.from()` directly
   - No standardized error handling

---

## Supabase Best Practices (From Official Docs)

### The Correct Pattern (React Quickstart)

```typescript
// 1. Create client ONCE at module level
const supabase = createClient(url, anonKey);

// 2. Use onAuthStateChange for reactive auth
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);
```

**Key principles:**

1. Let Supabase manage sessions internally
2. Don't manually call `setSession()` unless exchanging tokens
3. Use `onAuthStateChange` as the single source of truth
4. Don't cache sessions externally - Supabase handles this

---

## Proposed Architecture

### Layer 1: Supabase Client (`src/lib/supabase.ts`)

```typescript
// SIMPLIFIED - No custom lock, no debug logging in prod
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "boxcall-auth",
      flowType: "pkce",
    },
  }
);
```

### Layer 2: Auth Context (`src/contexts/AuthContext.tsx`)

```typescript
// NEW FILE - React context following Supabase patterns
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

### Layer 3: Data Hooks (`src/hooks/useSupabaseQuery.ts`)

```typescript
// Standardized query hook using React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

// Generic query hook with auth awareness
export function useSupabaseQuery<T>(
  key: string[],
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options?: { enabled?: boolean }
) {
  const { session } = useAuth();

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    },
    enabled: !!session && (options?.enabled ?? true),
  });
}

// Example: Team members hook
export function useTeamMembers(teamId: string | undefined) {
  return useSupabaseQuery(
    ["team_members", teamId ?? ""],
    () =>
      supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId!)
        .eq("status", "active"),
    { enabled: !!teamId }
  );
}
```

---

## Migration Roadmap

### Phase 1: Emergency Fix (Today) ⚡

**Goal**: Get queries working immediately

1. **Create minimal auth context** following Supabase patterns
2. **Remove custom lock function** from supabase.ts
3. **Test with `window.testBoxCallDB()`** to verify

### Phase 2: Auth Simplification (Week 1)

**Goal**: Replace 1,500-line auth-store with ~150-line context

1. Create `src/contexts/AuthContext.tsx`
2. Create `src/hooks/useAuthActions.ts` for sign-in/out
3. Migrate components to use new context
4. Keep old `auth-store.ts` as fallback during migration
5. Remove after all components migrated

### Phase 3: Data Layer Standardization (Week 2)

**Goal**: Consistent data fetching patterns

1. Create `src/hooks/useSupabaseQuery.ts` wrapper
2. Audit all 87 hooks for consistency
3. Standardize error handling
4. Add proper TypeScript types
5. Remove redundant api() client entirely

### Phase 4: Cleanup & Documentation (Week 3)

**Goal**: Remove tech debt, document patterns

1. Remove old auth-store.ts
2. Remove ApiClient and api() function
3. Update ARCHITECTURE.md with new patterns
4. Create CONTRIBUTING.md section on data fetching
5. Add ESLint rules for Supabase patterns

---

## Files to Change

### Delete/Replace

- `src/app/auth-store.ts` → Replace with `src/contexts/AuthContext.tsx`
- `src/lib/api/client.ts` → Delete (unused after migration)

### Create

- `src/contexts/AuthContext.tsx` - New auth management
- `src/hooks/useSupabaseQuery.ts` - Standardized data fetching
- `src/hooks/useAuthActions.ts` - Auth actions (sign in, out, etc.)

### Modify

- `src/lib/supabase.ts` - Simplify config
- `src/App.tsx` - Add AuthProvider wrapper
- All 87 hooks - Migrate to new patterns

---

## Immediate Next Steps

1. **Clear browser data** and test fresh
2. **Create AuthContext** following Supabase quickstart pattern
3. **Wrap App with AuthProvider**
4. **Test with simplified setup**

---

## Success Metrics

- [ ] `supabase.auth.getSession()` returns immediately (no hang)
- [ ] `supabase.from('team_members').select()` returns data
- [ ] Dashboard loads with real data
- [ ] Auth flow works: login → dashboard → data loads
- [ ] auth-store.ts reduced from 1,500 lines to <200 lines
- [ ] All hooks follow same pattern

---

## References

- [Supabase React Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase JS Reference](https://supabase.com/docs/reference/javascript/initializing)
- [React Query + Supabase](https://tanstack.com/query/latest/docs/framework/react/overview)
