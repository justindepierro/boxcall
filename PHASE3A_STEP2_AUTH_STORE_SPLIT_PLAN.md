# Phase 3A Step 2: auth-store.ts Splitting Plan

## Overview
**File**: `src/app/auth-store.ts`  
**Size**: 1,271 lines  
**Risk Level**: MEDIUM  
**Estimated Time**: 4-5 hours

## Current Structure Analysis

### Responsibilities Identified
1. **Authentication State** (user, session management)
2. **User Profile Management** (profile CRUD, caching)
3. **Session Management** (refresh, monitoring, lifecycle)
4. **Error Handling** (comprehensive error messages)
5. **Security** (rate limiting, offline support, network resilience)
6. **Monitoring & Telemetry** (AuthMonitoring, telemetry events)
7. **Profile Caching** (TTL-based cache with Map)

### Key Components
- **State**: user, session, profile, loading, profileLoading, error
- **Actions**: signIn, signUp, signOut, resetPassword, refreshSession
- **Utilities**: getAuthErrorMessage, profile caching, offline handling
- **Session Refresh**: Automatic refresh with retry logic
- **Auth State Listener**: Supabase onAuthStateChange
- **Initialization**: initializeAuth on app start
- **Selector Hooks**: useAuthUser, useAuthProfile, useIsAuthenticated, etc.

### Dependencies
- Zustand (create, persist)
- Supabase client
- authRateLimit utilities
- NetworkResilience
- AuthMonitoring
- database-helpers
- telemetry
- logger

## Proposed Modular Structure

```
src/app/auth/
├── types.ts                    # Shared types and interfaces
├── constants.ts                # Configuration constants
├── utils/
│   ├── errorMessages.ts        # getAuthErrorMessage function
│   ├── profileCache.ts         # Profile caching logic
│   └── sessionRefresh.ts       # Session refresh logic
├── stores/
│   ├── authStore.ts            # Core auth state (user, session)
│   ├── profileStore.ts         # User profile state
│   └── loadingStore.ts         # Loading states (optional, can merge)
├── actions/
│   ├── signIn.ts               # Sign in logic
│   ├── signUp.ts               # Sign up logic
│   ├── signOut.ts              # Sign out logic
│   ├── resetPassword.ts        # Password reset
│   └── refreshSession.ts       # Session refresh action
├── hooks/
│   ├── useAuth.ts              # Combined auth hook (main export)
│   ├── useAuthUser.ts          # User selector
│   ├── useAuthProfile.ts       # Profile selector
│   ├── useAuthLoading.ts       # Loading selector
│   └── useAuthRole.ts          # Role selectors (isCoach, isPlayer, etc.)
├── initialization.ts           # Auth initialization and listener
└── index.ts                    # Public API exports
```

## Implementation Strategy

### Phase 1: Extract Utilities (Low Risk)
1. **types.ts** - Extract interfaces
   - `ProfileCache`
   - Re-export from external types (User, Session, UserProfile)

2. **constants.ts** - Extract constants
   - `PROFILE_CACHE_TTL`
   - `MAX_REFRESH_ATTEMPTS`
   - `REFRESH_RETRY_DELAY`
   - `SESSION_CHECK_INTERVAL`
   - `SESSION_REFRESH_THRESHOLD`
   - `MS_PER_SECOND`
   - `NETWORK_MAX_RETRIES`
   - `NETWORK_BASE_DELAY`
   - `NETWORK_MAX_DELAY`
   - `POSTGRES_NO_ROWS_CODE`

3. **utils/errorMessages.ts** - Extract error handling
   - `getAuthErrorMessage()` function (80+ lines)

4. **utils/profileCache.ts** - Extract caching
   - Profile cache Map
   - Cache management functions

5. **utils/sessionRefresh.ts** - Extract session refresh
   - `startSessionRefresh()` function
   - `stopSessionRefresh()` function
   - Internal state (refreshInterval, refreshAttempts)

### Phase 2: Create Core Store (Medium Risk)
1. **stores/authStore.ts** - Main Zustand store
   - Keep persist middleware
   - State: user, session, profile, loading, profileLoading, error
   - Actions: All auth actions integrated
   - Use extracted utilities

### Phase 3: Extract Actions (Low Risk - Optional Refactor)
If time permits, extract individual actions into separate files for better organization:
- **actions/signIn.ts** - Sign in implementation
- **actions/signUp.ts** - Sign up implementation
- **actions/signOut.ts** - Sign out implementation
- **actions/resetPassword.ts** - Password reset
- **actions/refreshSession.ts** - Session refresh

### Phase 4: Create Selector Hooks (Low Risk)
1. **hooks/useAuth.ts** - Main hook (re-exports store)
2. **hooks/useAuthUser.ts** - User selector
3. **hooks/useAuthProfile.ts** - Profile selector
4. **hooks/useAuthLoading.ts** - Loading selectors
5. **hooks/useAuthRole.ts** - Role selectors (isCoach, isPlayer, etc.)

### Phase 5: Extract Initialization (Medium Risk)
1. **initialization.ts**
   - `initializeAuth()` function
   - `onAuthStateChange` listener setup
   - Call initialization on module load

### Phase 6: Create Public API (Low Risk)
1. **index.ts** - Export everything
   - Main `useAuth` hook
   - All selector hooks
   - Types (if needed externally)

### Phase 7: Backward Compatibility (Critical)
1. Update original `auth-store.ts` to re-export from new structure
2. Maintain exact same API surface

## Detailed File Breakdown

### 1. types.ts (~30 lines)
```typescript
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export type UserProfile = Database['public']['Tables']['profiles']['Row'];

export interface ProfileCache {
  data: UserProfile;
  timestamp: number;
  ttl: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  // ... actions
}
```

### 2. constants.ts (~25 lines)
```typescript
// Cache configuration
export const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Session refresh configuration
export const MAX_REFRESH_ATTEMPTS = 3;
export const REFRESH_RETRY_DELAY = 5000;
export const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const SESSION_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
export const MS_PER_SECOND = 1000;

// Network resilience configuration
export const NETWORK_MAX_RETRIES = 3;
export const NETWORK_BASE_DELAY = 1000;
export const NETWORK_MAX_DELAY = 10000;

// Database error codes
export const POSTGRES_NO_ROWS_CODE = 'PGRST116';
```

### 3. utils/errorMessages.ts (~120 lines)
- Extract entire `getAuthErrorMessage()` function
- Self-contained, no dependencies on store state

### 4. utils/profileCache.ts (~80 lines)
```typescript
import type { UserProfile, ProfileCache } from '../types';
import { PROFILE_CACHE_TTL } from '../constants';

const profileCache = new Map<string, ProfileCache>();

export function getCachedProfile(userId: string): UserProfile | null {
  const cached = profileCache.get(userId);
  const now = Date.now();
  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
}

export function cacheProfile(userId: string, profile: UserProfile): void {
  profileCache.set(userId, {
    data: profile,
    timestamp: Date.now(),
    ttl: PROFILE_CACHE_TTL,
  });
}

export function invalidateProfileCache(userId: string): void {
  profileCache.delete(userId);
}

export function clearAllProfileCache(): void {
  profileCache.clear();
}
```

### 5. utils/sessionRefresh.ts (~180 lines)
- Extract `startSessionRefresh()` function
- Extract `stopSessionRefresh()` function
- Keep internal state (refreshInterval, refreshAttempts)
- Takes useAuth store as dependency

### 6. stores/authStore.ts (~600 lines)
- Main Zustand store with persist
- All auth actions
- Uses extracted utilities
- Maintains exact same state shape

### 7. hooks/useAuth.ts (~15 lines)
```typescript
export { useAuth } from '../stores/authStore';
export * from './useAuthUser';
export * from './useAuthProfile';
export * from './useAuthLoading';
export * from './useAuthRole';
```

### 8. hooks/useAuthUser.ts (~5 lines)
```typescript
import { useAuth } from '../stores/authStore';
export const useAuthUser = () => useAuth((state) => state.user);
```

### 9. hooks/useAuthProfile.ts (~5 lines)
```typescript
import { useAuth } from '../stores/authStore';
export const useAuthProfile = () => useAuth((state) => state.profile);
```

### 10. hooks/useAuthLoading.ts (~15 lines)
```typescript
import { useAuth } from '../stores/authStore';
export const useAuthLoading = () => useAuth((state) => state.loading);
export const useAuthProfileLoading = () => useAuth((state) => state.profileLoading);
export const useAuthError = () => useAuth((state) => state.error);
```

### 11. hooks/useAuthRole.ts (~30 lines)
```typescript
import { useAuth } from '../stores/authStore';

export const useIsAuthenticated = () => useAuth((state) => !!state.user);
export const useIsCoach = () => useAuth((state) => state.profile?.role === 'coach');
export const useIsPlayer = () => useAuth((state) => state.profile?.role === 'player');
export const useIsFamily = () => useAuth((state) => state.profile?.role === 'family');
export const useIsAdmin = () => useAuth((state) => state.profile?.role === 'admin');
```

### 12. initialization.ts (~200 lines)
- `initializeAuth()` function
- `onAuthStateChange` listener
- Executes on module load

### 13. index.ts (~40 lines)
```typescript
// Main hook
export { useAuth } from './stores/authStore';

// Selector hooks
export * from './hooks/useAuthUser';
export * from './hooks/useAuthProfile';
export * from './hooks/useAuthLoading';
export * from './hooks/useAuthRole';

// Types (if needed externally)
export type { UserProfile, AuthState } from './types';

// Initialization happens automatically via side effect
import './initialization';
```

### 14. Original auth-store.ts (backward compat, ~15 lines)
```typescript
// Backward compatibility re-export
export { useAuth } from './auth';
export * from './auth';
```

## Size Breakdown
- **types.ts**: 30 lines
- **constants.ts**: 25 lines
- **utils/errorMessages.ts**: 120 lines
- **utils/profileCache.ts**: 80 lines
- **utils/sessionRefresh.ts**: 180 lines
- **stores/authStore.ts**: 600 lines
- **hooks/useAuth.ts**: 15 lines
- **hooks/useAuthUser.ts**: 5 lines
- **hooks/useAuthProfile.ts**: 5 lines
- **hooks/useAuthLoading.ts**: 15 lines
- **hooks/useAuthRole.ts**: 30 lines
- **initialization.ts**: 200 lines
- **index.ts**: 40 lines
- **Original auth-store.ts**: 15 lines

**Total**: ~1,360 lines (90 lines overhead for structure)
**Original**: 1,271 lines

## Benefits
1. **Separation of Concerns**: Utils, stores, hooks, initialization separated
2. **Testability**: Each utility/action can be tested independently
3. **Maintainability**: Clear boundaries, easier to locate code
4. **Reusability**: Extracted utilities can be used elsewhere
5. **Type Safety**: Maintained throughout with TypeScript
6. **Backward Compatibility**: Existing imports continue working

## Risks & Mitigation
1. **Zustand Persist**: Keep in authStore.ts, test thoroughly
2. **Module Initialization**: Ensure initialization.ts runs on import
3. **Circular Dependencies**: Careful with cross-imports
4. **Type Exports**: Ensure types are properly exported
5. **State Synchronization**: Profile cache must stay consistent

## Testing Checklist
- [ ] Type check passes (0 errors)
- [ ] ESLint passes
- [ ] Sign in flow works
- [ ] Sign up flow works
- [ ] Sign out flow works
- [ ] Password reset works
- [ ] Session refresh works automatically
- [ ] Profile fetching works
- [ ] Profile caching works
- [ ] Error messages display correctly
- [ ] Offline queue works
- [ ] Rate limiting works
- [ ] Monitoring events fire
- [ ] All selector hooks work
- [ ] Backward compatibility maintained

## Implementation Order
1. Create directory structure
2. Extract types.ts
3. Extract constants.ts
4. Extract utils/errorMessages.ts
5. Extract utils/profileCache.ts
6. Extract utils/sessionRefresh.ts
7. Create stores/authStore.ts (main migration)
8. Create hooks files
9. Create initialization.ts
10. Create index.ts
11. Update original auth-store.ts
12. Test all flows
13. Commit and push

## Estimated Time Breakdown
- Setup & planning: 30 min ✅
- Extract utilities: 1 hour
- Migrate authStore: 1.5 hours
- Create hooks: 30 min
- Extract initialization: 45 min
- Testing: 1 hour
- Documentation: 15 min
- **Total**: 4.5-5 hours

---

## Decision: Simplified Approach
Given the complexity and risk of splitting a Zustand store with persist middleware, we'll take a **more conservative approach**:

### Alternative: Partial Extract (Lower Risk, 2-3 hours)
1. **Extract utilities only** (errorMessages, profileCache, sessionRefresh, constants)
2. **Keep authStore.ts as single file** but cleaner
3. **Extract hooks** to separate files
4. **Extract initialization** to separate file
5. **Create organized structure** without breaking store apart

This approach:
- **Reduces risk** of breaking persist middleware
- **Improves organization** significantly
- **Maintains single source of truth** for state
- **Easier to test** and validate
- **Faster to implement** (2-3 hours vs 4-5)

Let's proceed with this approach!
