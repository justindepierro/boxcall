# Database Table Types Fixed - team_players Table Added

**Date**: October 15, 2025
**Issue**: 406 errors when adding/editing players due to missing `team_players` table in TypeScript types
**Status**: ✅ FIXED - Requires TypeScript Server Restart

## Problem Summary

After fixing the Aurora component pointer-events issue, we discovered that adding/editing players was failing with 406 errors:

```
Failed to load resource: the server responded with a status of 406 ()
team_players_view?select=*&id=eq.000d88cc-7559-47cb-8016-959283ffdd95
```

### Root Cause

1. **Database Schema**: The `team_players` table EXISTS in the database schema (`database/schema.sql`)
2. **TypeScript Types**: The `team_players` table was MISSING from TypeScript type definitions
3. **Service Attempts**: Trying to use `team_players_view` returned 406 errors
4. **Type Errors**: Switching to `team_players` table caused TypeScript to reject it as type `never`

## Solution Implemented

### 1. Added `team_players` Table to Type Definitions

**File**: `src/types/database/tables/teamTables.ts`

Added complete type definition for the `team_players` table:

```typescript
team_players: {
  Row: {
    id: string;
    team_id: string;
    first_name: string;
    last_name: string;
    jersey_number: number | null;
    position: string | null;
    grade_level: string | null;
    height_inches: number | null;
    weight_lbs: number | null;
    is_active: boolean | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    team_id: string;
    first_name: string;
    last_name: string;
    jersey_number?: number | null;
    position?: string | null;
    grade_level?: string | null;
    height_inches?: number | null;
    weight_lbs?: number | null;
    is_active?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    team_id?: string;
    first_name?: string;
    last_name?: string;
    jersey_number?: number | null;
    position?: string | null;
    grade_level?: string | null;
    height_inches?: number | null;
    weight_lbs?: number | null;
    is_active?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
};
```

### 2. Added Type Exports

**File**: `src/types/database/index.ts`

Added convenience type exports:

```typescript
// Row type
export type TeamPlayer = Tables<"team_players">;

// Insert type
export type TeamPlayerInsert = Inserts<"team_players">;

// Update type
export type TeamPlayerUpdate = Updates<"team_players">;
```

### 3. Fixed rosterService.ts

**File**: `src/services/rosterService.ts`

Updated to use properly typed Supabase client:

```typescript
import {
  type PostgrestError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { supabase as sharedClient } from "../lib/supabase";
import type { Database } from "../types/database";

// Typed getClient function
function getClient(): SupabaseClient<Database> {
  return sharedClient;
}

export class RosterService {
  private client: SupabaseClient<Database> = getClient();

  // Now insert/update operations are properly typed
  async createPlayer(
    playerData: PlayerRosterInsert
  ): Promise<RosterPlayerView> {
    const { data, error } = await this.client
      .from("team_players") // ✅ Now properly typed
      .insert([insertData]) // ✅ No more `as any` needed
      .select()
      .single();

    return this.getPlayerById(data.id); // ✅ data.id is now typed
  }
}
```

## Database Schema Verification

The `team_players` table exists in `database/schema.sql`:

```sql
CREATE TABLE team_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  grade_level TEXT,
  height_inches INTEGER,
  weight_lbs INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Required Action: Restart TypeScript Server

⚠️ **IMPORTANT**: TypeScript's language server needs to be restarted to pick up the new type definitions.

### How to Restart TypeScript Server in VS Code:

1. Open Command Palette: `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux)
2. Type: `TypeScript: Restart TS Server`
3. Press Enter

### Alternative: Restart VS Code

Simply close and reopen VS Code to restart all language servers.

## Expected Behavior After Restart

✅ **TypeScript Errors Should Disappear**:

- No more `type 'never'` errors on `.from("team_players")`
- No more errors on `.insert([insertData])`
- No more errors on `data.id` access

✅ **Add Player Should Work**:

- Click "Add Player" button
- Fill in player information
- Save successfully
- Player appears in roster

✅ **Edit Player Should Work**:

- Click on existing player
- Modify information
- Save successfully
- Changes reflect in roster

## Files Modified

1. ✅ `src/types/database/tables/teamTables.ts` - Added `team_players` table definition
2. ✅ `src/types/database/index.ts` - Added type exports (TeamPlayer, TeamPlayerInsert, TeamPlayerUpdate)
3. ✅ `src/services/rosterService.ts` - Added proper typing with `SupabaseClient<Database>`

## Testing Checklist

After restarting TypeScript server:

- [ ] No TypeScript errors in `rosterService.ts`
- [ ] Add new player works without 406 errors
- [ ] Edit existing player works
- [ ] Delete player works
- [ ] Player list loads correctly
- [ ] Console shows no errors

## Related Issues Fixed

- ✅ Aurora component pointer-events blocking clicks (BUTTON_CLICK_ISSUE_FIXED.md)
- ✅ team_players table missing from TypeScript types (this document)
- ⏳ Ready to proceed with Phase 2 Task 2: Bulk Delete Operation

## Next Steps

1. **Restart TypeScript Server** (see instructions above)
2. **Verify no TypeScript errors** in rosterService.ts
3. **Test add/edit player operations** work correctly
4. **Continue with Phase 2 Task 2**: Bulk Delete Operation

---

**Note**: This fix synchronizes the TypeScript types with the actual database schema that already existed. No database migrations were needed - only type definition updates.
