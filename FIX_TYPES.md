# Type Error Fixes Required

## Priority 1: Critical Fixes (Blocking Build)

### 1. useAuth Store - Missing Properties (affects 5+ files)

**Files**: `useSession.ts`, `usePracticeSession.ts`
**Issue**: `useAuth()` doesn't have `activeTeamId` or `userId` properties
**Fix**: Use correct property names from auth store

### 2. Supabase Database Types (affects 10+ files)

**File**: `executionTrackingService.ts`, `situationalRecommender.ts`
**Issue**: TypeScript doesn't recognize new database tables/columns
**Fix**: Need to regenerate Supabase types OR use `as any` casts temporarily

### 3. useSession Hook Signature (affects 3 files)

**Files**: `usePracticeSession.ts`, `useGameSession.ts`  
**Issue**: `useSession()` expects parameters but called with 0 arguments
**Fix**: Make parameters optional OR pass required params

### 4. PracticeScript Type Mismatch (2 files)

**Files**: `usePracticeSession.ts`, `PracticeSession.tsx`
**Issue**: Two different `PracticeScript` types imported from different places
**Fix**: Use consistent type from single source

## Quick Workaround (Get Clean Build Fast)

Since these are new Stage 3 features that aren't fully integrated yet, we can:

1. **Disable strict type checking temporarily** in these new files
2. **Use type assertions** (`as any`) for Supabase queries
3. **Make hook parameters optional** to fix call signatures
4. **Comment out unused imports** to fix lint errors

This will let us:

- ✅ Get a clean build
- ✅ Push to git
- ✅ Fix properly later when integrating Stage 3

## Recommendation

Since we just completed Phase 13.3 and want to push clean code:

**Option A (Fast)**: Add `// @ts-nocheck` to the 5-6 problematic new files
**Option B (Better)**: Fix the 20-30 critical type errors (15 mins)  
**Option C (Best)**: Full type system fix with Supabase type regeneration (45 mins)

What do you prefer?
