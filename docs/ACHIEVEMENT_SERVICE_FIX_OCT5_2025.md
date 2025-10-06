# Achievement Service 400 Errors Fix

**Date**: October 5, 2025  
**Issue**: Persistent 400 Bad Request errors from Supabase achievement queries

## Problem

The application was throwing repeated 400 errors in the console:

```
GET https://...supabase.co/rest/v1/achievements?select=*%2Cachievement_definitions%28*%29... 400 (Bad Request)
GET https://...supabase.co/rest/v1/achievement_progress?select=*%2Cachievement_definitions%28*%29... 400 (Bad Request)
```

### Root Cause

The `achievementService.ts` was querying database tables that **don't exist in the current schema**:

- ❌ `achievement_definitions` - Not in schema
- ❌ `achievement_progress` - Not in schema
- ✅ `achievements` - Exists (simple table)

The service was built for an advanced achievement system, but the database only has a basic `achievements` table.

## Solution

Added graceful degradation with a feature flag:

### 1. Feature Flag Added

```typescript
// Feature flag - disable advanced achievement features until DB tables exist
const ACHIEVEMENT_SYSTEM_ENABLED = false;
```

### 2. Early Returns in All Methods

**trackPlayerAction()**:

```typescript
static async trackPlayerAction(player: Player, action: AchievementTrigger, ...): Promise<EarnedAchievement[]> {
  try {
    // Achievement system not enabled until DB tables are created
    if (!ACHIEVEMENT_SYSTEM_ENABLED) {
      return [];
    }
    // ... rest of method
  }
}
```

**getUserAchievements()**:

```typescript
static async getUserAchievements(userId: string): Promise<...> {
  try {
    // Achievement system not enabled until DB tables are created
    if (!ACHIEVEMENT_SYSTEM_ENABLED) {
      return { earned: [], progress: [], definitions: [] };
    }
    // ... rest of method
  }
}
```

**trackAction()**:

```typescript
static async trackAction(userId: string, action: ..., ...): Promise<EarnedAchievement[]> {
  // Achievement system not enabled until DB tables are created
  if (!ACHIEVEMENT_SYSTEM_ENABLED) {
    return [];
  }
  // ... rest of method
}
```

### 3. Error Handling Improvements

Added error checks for database queries:

```typescript
const { data: earned, error: earnedError } = await supabase
  .from("achievements")
  .select("*")
  .eq("player_id", player.id);

if (earnedError) {
  console.warn("[Achievement] Tables may not exist:", earnedError.message);
  return { earned: [], progress: [], definitions: [] };
}
```

### 4. Documentation Added

Added clear comments explaining the situation:

```typescript
/**
 * NOTE: achievement_definitions and achievement_progress tables don't exist in current schema.
 * Service gracefully degrades to empty achievements until tables are created.
 */
```

## Current Database Schema

**What exists**:

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  description TEXT,
  earned_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**What's missing** (but service expects):

- `achievement_definitions` - Defines available achievements
- `achievement_progress` - Tracks progress toward achievements

## Result

✅ **No more 400 errors**  
✅ **Service returns empty arrays gracefully**  
✅ **Console logs explain what's happening**  
✅ **Application continues to work normally**

## Future Work

To enable the full achievement system, create these tables:

### achievement_definitions

```sql
CREATE TABLE achievement_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_target TEXT NOT NULL,
  trigger_count INTEGER NOT NULL,
  points INTEGER NOT NULL,
  rarity TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### achievement_progress

```sql
CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES team_players(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  current_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, achievement_id)
);
```

Then set `ACHIEVEMENT_SYSTEM_ENABLED = true` in `achievementService.ts`.

## Files Modified

- ✅ `src/services/achievementService.ts`
  - Added `ACHIEVEMENT_SYSTEM_ENABLED` flag
  - Added early returns in `trackPlayerAction()`
  - Added early returns in `getUserAchievements()`
  - Added early returns in `trackAction()`
  - Improved error handling
  - Added documentation comments
  - Imported `Player` type from `app/store`

## Console Output (After Fix)

**Before** (errors):

```
❌ GET .../achievements?select=...achievement_definitions... 400 (Bad Request)
❌ GET .../achievement_progress?select=...achievement_definitions... 400 (Bad Request)
```

**After** (clean):

```
[Achievement] Getting achievements for user fafcaafd-0154-4f87-9752-95fbfa2372a0
✅ (Returns empty achievements silently)
```

## Verification

1. **Check console** - No more 400 errors ✅
2. **Check network tab** - No failed requests to achievement tables ✅
3. **Check functionality** - App works normally ✅
4. **Check user profile** - Loads without errors ✅

---

**Related Issues**: Database schema mismatch, feature development vs production database state
**Status**: ✅ Fixed - Service now gracefully handles missing tables
**Next Steps**: Create missing database tables when ready to enable achievement system
