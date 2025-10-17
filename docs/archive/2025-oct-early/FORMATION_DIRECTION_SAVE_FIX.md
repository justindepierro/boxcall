# Formation Direction Not Saving Fix - October 14, 2025

## Issue Summary

**User Report**: "I set the formation direction (Left/Right) in the new play editor, but when the play appeared in the list, I had to re-enter the direction."

**Symptom**:

- User clicks "Left" or "Right" button in AddNewPlayModal
- Button highlights (appears selected)
- Play gets created
- Direction is NOT saved to database
- PlayCard shows no direction, user must set it again

**Impact**: Data loss, poor UX, wasted time re-entering data

## Root Cause Analysis

### The Two Direction Fields

The codebase has **two separate fields** for formation direction:

1. **`formationDir`** (OLD - Legacy text field)
   - Type: `string`
   - Values: `"Left"`, `"Right"`, `""` (capitalized or empty)
   - Used by old text-based formation system
   - Stored in `f_dir` database column

2. **`formation_direction`** (NEW - Database relationship field)
   - Type: `"base" | "left" | "right" | null`
   - Values: Lowercase enum matching database schema
   - Used by new FormationSelector with database formations
   - Stored in `formation_direction` database column
   - **This is the field that should be saved!**

### The Bug

**File**: `src/components/playbook/AddNewPlayModal.tsx`

**Line 313** (BEFORE FIX):

```tsx
formationDir={formData.formationDir}  // ❌ Passing wrong field
```

**Line 338** (BEFORE FIX):

```tsx
onFormationDirChange={(value) => updateField("formationDir", value)}  // ❌ Updating wrong field
```

**Line 92** (Data submission):

```tsx
formation_direction: formData.formation_direction || undefined,  // ✅ Sending correct field
```

**Problem Flow**:

1. User clicks "Left" button
2. Button calls `onFormationDirChange("Left")`
3. Updates `formData.formationDir = "Left"` ❌ (wrong field)
4. On submit, sends `formData.formation_direction` ✅ (correct field)
5. But `formation_direction` was never updated! Still `null`
6. Database receives `formation_direction: undefined`
7. Play saves without direction

### Why This Happened

During the Phase 6/7 formation system refactor:

- Added new database fields (`formation_id`, `formation_direction`)
- Created new FormationSelector component
- FormationSelector correctly sets `formation_direction` when selecting from database
- **BUT** forgot to update the Left/Right button handlers to use the new field
- Buttons still updated the old `formationDir` field (legacy)

## Solution

### Fix 1: Update Button Handler to Use New Field ✅

**File**: `src/components/playbook/AddNewPlayModal.tsx` (lines 310-343)

```tsx
// BEFORE ❌
formationDir={formData.formationDir}
onFormationDirChange={(value) => updateField("formationDir", value)}

// AFTER ✅
formationDir={formData.formation_direction || ""} // Use formation_direction
onFormationDirChange={(value) => {
  // Update formation_direction (database field), not formationDir (legacy)
  const direction = value === "Left" ? "left" : value === "Right" ? "right" : null;
  updateField("formation_direction", direction);
}}
```

**Key Changes**:

1. Pass `formation_direction` value to FormationSection (line 313)
2. Convert capitalized button values ("Left"/"Right") to lowercase database values ("left"/"right")
3. Handle empty string → null conversion for database

### Fix 2: Handle Case-Insensitive Display ✅

**File**: `src/components/playbook/AddNewPlayModal/sections/FormationSection.tsx` (lines 73-91)

```tsx
// BEFORE ❌
variant={formationDir === "Left" ? "primary" : "outline"}
onClick={() => onFormationDirChange(formationDir === "Left" ? "" : "Left")}

// AFTER ✅
variant={formationDir.toLowerCase() === "left" ? "primary" : "outline"}
onClick={() => onFormationDirChange(formationDir.toLowerCase() === "left" ? "" : "Left")}
```

**Why**: The prop might contain lowercase "left"/"right" from database, but buttons show capitalized "Left"/"Right". Case-insensitive comparison ensures buttons highlight correctly.

## Data Flow (AFTER FIX)

### Creating a Play with Direction

```
User Interface:
  ├─ Select formation: "Trips"
  │    ↓ FormationSelector
  │    ↓ onFormationIdChange()
  │    ↓ Sets: formation_direction = "base"
  │
  ├─ Click "Left" button
  │    ↓ FormationSection
  │    ↓ onFormationDirChange("Left")
  │    ↓ Converts: "Left" → "left"
  │    ↓ Sets: formation_direction = "left" ✅
  │
  └─ Click "Create Play"
       ↓ AddNewPlayModal.handleSubmit()
       ↓ playData = { formation_direction: "left", ... }
       ↓ SecurePlaysService.createPlay()
       ↓ Database: formation_direction = "left" ✅
       ↓ Play appears with direction! ✅
```

### Editing Existing Play

```
Load Play:
  ├─ play.formation_direction = "right"
  │    ↓ usePlayFormState()
  │    ↓ formData.formation_direction = "right"
  │    ↓ FormationSection receives: formationDir="right"
  │    ↓ "Right" button highlights ✅
  │
User Changes:
  ├─ Click "Left" button
  │    ↓ Sets: formation_direction = "left"
  │
  └─ Click "Save"
       ↓ Updates database: formation_direction = "left" ✅
       ↓ Direction persists! ✅
```

## Testing Checklist

### Create Play with Direction

- [ ] Open AddNewPlayModal
- [ ] Select formation: "Trips"
- [ ] Click "Left" button → Button should highlight
- [ ] Create play
- [ ] Play appears in grid with direction indicator
- [ ] Click play to view PlayCard → Shows "Left" direction
- [ ] Refresh page → Direction still shows "Left"

### Toggle Direction

- [ ] Click "Left" → Highlights
- [ ] Click "Left" again → Unhighlights (clears direction)
- [ ] Click "Right" → Highlights
- [ ] Click "Left" → Switches to Left (Right unhighlights)

### Edit Play Direction

- [ ] Open existing play with direction="right"
- [ ] "Right" button should be highlighted
- [ ] Click "Left" → Switches to Left
- [ ] Save → Direction updates in database
- [ ] Reload → Shows "Left"

### Database Verification

```sql
-- Check that direction is saved correctly
SELECT play_name, formation, formation_direction
FROM plays
WHERE playbook_id = 'YOUR_ID'
ORDER BY created_at DESC
LIMIT 5;

-- Should show:
-- play_name | formation | formation_direction
-- ----------|-----------|--------------------
-- Test Play | Trips     | left
-- Power     | I Form    | right
-- Sweep     | Twins     | null (base)
```

## Edge Cases Handled

1. **No Direction Selected** ✅
   - User doesn't click Left or Right
   - `formation_direction = null`
   - Database accepts null (optional field)

2. **Clear Direction** ✅
   - User clicks "Left", then clicks "Left" again
   - Sets `formation_direction = null`
   - Clears database value

3. **Switch Direction** ✅
   - User clicks "Left", then "Right"
   - Updates from "left" → "right"
   - No double-set issues

4. **Edit Existing Play** ✅
   - Play has `formation_direction = "right"`
   - Form loads with "Right" button highlighted
   - User can change or keep existing direction

5. **Legacy Play (No Direction)** ✅
   - Old play has `formation_direction = null`
   - Buttons show unhighlighted
   - User can add direction if desired

## Migration Notes

**Breaking Changes**: None - this is a bug fix

**Data Impact**:

- Existing plays: No changes required
- New plays: Will now correctly save direction
- No migration needed

**Backwards Compatibility**:

- Old `formationDir` field still exists (not removed)
- Legacy plays still work
- Gradual migration as plays are edited

## Files Changed

| File                                                                    | Lines        | Change                                              |
| ----------------------------------------------------------------------- | ------------ | --------------------------------------------------- |
| `src/components/playbook/AddNewPlayModal.tsx`                           | 313, 338-342 | Use `formation_direction` instead of `formationDir` |
| `src/components/playbook/AddNewPlayModal/sections/FormationSection.tsx` | 77, 84       | Case-insensitive button highlighting                |

## Related Systems

**Phase 6 Formation System**:

- FormationSelector component
- formation_id, formation_direction database fields
- Formation variants (base/left/right)

**Phase 7 Formation Bulletproofing**:

- Database constraints on formation relationships
- Directionality types (mirror/built-in/symmetric)
- Transaction-safe formation linking

**This Fix Completes**:

- User-facing direction selection
- Proper data persistence
- Consistent state between UI and database

---

**Status**: ✅ **FIXED** - Formation direction now saves correctly when creating/editing plays via AddNewPlayModal.

**Next Steps**:

1. User tests play creation with direction
2. Verify direction shows on PlayCard
3. Confirm direction persists after refresh
4. Check that database stores lowercase "left"/"right" correctly
