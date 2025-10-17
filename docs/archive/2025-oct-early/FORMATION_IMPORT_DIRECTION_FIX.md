# Formation Import Direction Fix

## Problem

When importing formations from plays, the system was only looking at the `formation` field (e.g., "Trips", "Twins") but ignoring the `f_dir` (formation direction) field. This meant:

- Play: "Trips Rt Near Power Read Lt" with `f_dir = "Right"`
- Only created: Formation "Trips" with `direction = "base"`
- **Should create**: Formation "Trips" with `direction = "right"`

## Solution

Updated `importFormationsFromPlays()` in `FormationService` to:

1. **Fetch `f_dir` field** from plays table
2. **Parse direction from TWO sources**:
   - **Method 1**: Check `f_dir` field first
     - "Left" / "Lt" / "L" → `direction = "left"`
     - "Right" / "Rt" / "R" → `direction = "right"`
   - **Method 2**: Parse formation name if `f_dir` is empty
     - "Trips **Rt**" → `direction = "right"`, name = "Trips"
     - "Twins **Lt**" → `direction = "left"`, name = "Twins"
     - "I Form **Right**" → `direction = "right"`, name = "I Form"
3. **Clean formation names** by removing direction suffixes
4. **Create unique combinations** of (name, direction)
5. **Check existing** formations by both name AND direction
6. **Only create missing** formation variants

## Examples

### Before Fix

```
Plays:
  - "Trips Rt Near Power Read Lt" (f_dir: "Right")
  - "Twins Lt Far Cross Rt" (f_dir: "Left")

Created Formations:
  - Trips (direction: "base")  ❌ Wrong!
  - Twins (direction: "base")  ❌ Wrong!
```

### After Fix

```
Plays:
  - "Trips Rt Near Power Read Lt" (f_dir: "Right")
  - "Twins Lt Far Cross Rt" (f_dir: "Left")

Created Formations:
  - Trips (direction: "right")  ✅ Correct!
  - Twins (direction: "left")   ✅ Correct!
```

## Impact

Now when users import plays from CSV or existing plays:

- Formations are created with **correct directions**
- Left and Right variants are properly separated
- Formation system works as designed
- Users see "2 Formations" instead of just formation names

## Testing

To test, you can:

1. Delete existing formations (or use a fresh playbook)
2. Run formation import from plays
3. Check Formation Manager - should see "Trips (Right)" and "Twins (Left)"

## Code Changes

**File**: `src/services/formationService.ts`

**Function**: `importFormationsFromPlays()`

**Key Changes**:

- Added `f_dir` to SELECT query
- Parse direction with fallback logic
- Create Map with unique (name, direction) keys
- Check existence by both name AND direction
- Set proper `direction` field on creation

**Lines**: ~780-900

## Related

- Works with new simplified formation direction system
- Compatible with CreateOppositeFormationModal
- Works with Formation Health Dashboard
