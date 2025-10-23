# Personnel Migration Fix - Reserved Keyword Issue

## Problem

PostgreSQL error when running migration:

```
ERROR: 42601: syntax error at or near "position"
LINE 259: position TEXT,
```

## Root Cause

`position` is a reserved keyword in PostgreSQL (used for string position functions).

## Solution

Renamed column from `position` to `player_position` throughout the migration:

### Changes Made:

1. **Table Definition:**

   ```sql
   -- BEFORE:
   position TEXT NOT NULL CHECK (position IN ('QB', 'RB', 'TE', 'WR'))

   -- AFTER:
   player_position TEXT NOT NULL CHECK (player_position IN ('QB', 'RB', 'TE', 'WR'))
   ```

2. **Helper Function:**

   ```sql
   -- BEFORE:
   RETURNS TABLE (... position TEXT ...)
   SELECT pp.position ...

   -- AFTER:
   RETURNS TABLE (... player_position TEXT ...)
   SELECT pp.player_position ...
   ```

3. **Seed Data (5 locations):**

   ```sql
   -- BEFORE:
   INSERT INTO personnel_players (config_id, position, label, ...)

   -- AFTER:
   INSERT INTO personnel_players (config_id, player_position, label, ...)
   ```

## Status

✅ **FIXED** - Migration file updated and ready to run

## Next Steps

1. Copy updated SQL from: `supabase/migrations/20251011000000_add_personnel_system.sql`
2. Paste into Supabase Dashboard SQL Editor
3. Run migration
4. Verify success

## Note for Service Layer (Phase 3)

When creating `personnelService.ts`, remember to use `player_position` instead of `position`:

```typescript
// TypeScript interface
interface PersonnelPlayer {
  id: string;
  config_id: string;
  player_position: "QB" | "RB" | "TE" | "WR"; // ✅ Use player_position
  label: string;
  sort_order: number;
  is_wildcat_qb: boolean;
}
```

---

**Fixed:** October 11, 2025  
**Issue:** PostgreSQL reserved keyword  
**Resolution:** Column renamed to `player_position`
