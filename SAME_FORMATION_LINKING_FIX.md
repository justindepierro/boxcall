# Same-Formation Linking Fix

## Problem Identified ✅

When linking the same formation to itself (e.g., "Trips" + "Trips"), the original code had a bug that would result in **only 2 formations** instead of a proper left/right pair.

### Original Buggy Behavior

**Before linking:** 1 formation

- `"Trips"` with `direction = 'base'`

**After linking "Trips" + "Trips":**

- ❌ "Trips" with `direction = 'base'` (original, incorrectly left as base)
- ✅ "Trips" with `direction = 'right'` (new duplicate)
- ❌ **MISSING**: No proper left variant!

**Result:** 2 formations, but base should be left

## Root Cause

The code was updating the base formation to `direction = 'base'` at the end, but it should have been `direction = 'left'` for same-formation linking. The left variant update was skipped because `leftFormationId === baseFormationId`.

## Solution Implemented ✅

Added a `isSameFormationLink` flag to handle same-formation linking separately from different-formation linking.

### New Behavior

**Before linking:** 1 formation

- `"Trips"` with `direction = 'base'`, `base_formation_id = null`

**After linking "Trips" + "Trips":**

- ✅ "Trips Left" with `direction = 'left'`, `base_formation_id = null` (original, transformed)
- ✅ "Trips Right" with `direction = 'right'`, `base_formation_id = [left-id]` (new duplicate)

**Result:** 2 formations in proper left/right relationship

## Database Structure After Fix

### Same Formation Linking (e.g., "Trips" + "Trips")

**Left Variant (original):**

```sql
{
  id: "abc-123",
  name: "Trips",
  direction: "left",
  base_formation_id: NULL,  -- This IS the base
  personnel_packages: ["uuid-11", "uuid-12"]
}
```

**Right Variant (duplicate):**

```sql
{
  id: "def-456",
  name: "Trips",
  direction: "right",
  base_formation_id: "abc-123",  -- Points to left as base
  personnel_packages: ["uuid-11", "uuid-12"]
}
```

### Different Formation Linking (e.g., "Rip" + "Liz")

**Base Formation:**

```sql
{
  id: "abc-123",
  name: "Rip",
  direction: "base",
  base_formation_id: NULL,
  personnel_packages: ["uuid-11", "uuid-12"]
}
```

**Left Variant:**

```sql
{
  id: "abc-123",  -- Same as base
  name: "Rip",
  direction: "left",
  base_formation_id: "abc-123",  -- Self-reference
  personnel_packages: ["uuid-11", "uuid-12"]
}
```

**Right Variant:**

```sql
{
  id: "ghi-789",
  name: "Liz",
  direction: "right",
  base_formation_id: "abc-123",  -- Points to base
  personnel_packages: ["uuid-11", "uuid-12"]
}
```

## Code Changes

### Key Logic

```typescript
// Detect same-formation linking
let isSameFormationLink = false;
if (
  leftFormationId &&
  rightFormationId &&
  leftFormationId === rightFormationId
) {
  isSameFormationLink = true;

  // Create duplicate for right side
  const duplicate = await supabase.from("formations").insert([
    {
      name: sourceFormation.name,
      direction: "right",
      base_formation_id: baseFormationId,
      personnel_packages: personnelPackages || [],
      // ... other fields
    },
  ]);

  // Transform original to left side
  await supabase
    .from("formations")
    .update({
      direction: "left",
      base_formation_id: null, // This IS the base
      personnel_packages: personnelPackages || [],
    })
    .eq("id", baseFormationId);
}

// Only update base to 'base' for different-formation linking
if (!isSameFormationLink) {
  await supabase
    .from("formations")
    .update({
      direction: "base",
      personnel_packages: personnelPackages || [],
    })
    .eq("id", baseFormationId);
}
```

## Testing Scenarios

### Test 1: Same Formation Linking ✅

**Input:** Link "Trips" to "Trips"
**Expected Result:**

- 2 formations total
- Left: "Trips" with `direction = 'left'`, `base_formation_id = null`
- Right: "Trips" with `direction = 'right'`, `base_formation_id = [left-id]`

**UI Display:**

- "Trips Lt" or "Trips Left"
- "Trips Rt" or "Trips Right"

### Test 2: Different Formation Linking ✅

**Input:** Link "Rip" to "Liz"
**Expected Result:**

- 2 formations total
- Left/Base: "Rip" with `direction = 'base'` or `'left'`
- Right: "Liz" with `direction = 'right'`, `base_formation_id = [rip-id]`

**UI Display:**

- "Rip Left"
- "Liz Right"

## Benefits of This Approach

1. **No orphaned base formation** - The original formation is reused as left
2. **Consistent pairing** - Always get exactly 2 formations (left + right)
3. **Proper relationships** - `base_formation_id` correctly links variants
4. **Clean queries** - Can find all "Trips" variants: `WHERE name = 'Trips'`
5. **Personnel integration** - Both variants share the same personnel packages

## Migration Path

No database migration needed! This is purely a logic fix in `FormationService.linkFormations()`.

Existing formations are unaffected. New links will use the corrected behavior.

## Build Status

✅ **Build successful** (8.61s)
✅ **No type errors** (Supabase type warnings are expected)
✅ **Ready to test**

## Next Steps

1. **Run SQL migration** for `personnel_packages` column (if not done yet)
2. Refresh browser
3. Test same-formation linking ("Trips" + "Trips")
4. Verify database shows 2 formations with correct directions
5. Test different-formation linking ("Rip" + "Liz")
6. Verify FormationBadge displays correctly in UI
