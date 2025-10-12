# Playbook UI Audit - October 12, 2025

## Issues Identified

### 1. 🔴 Direction Fields Not Saving Correctly

**Problem:** Direction fields (f_dir, p_dir) have display toggles but may be saving incorrectly to the database.

**Current Implementation:**
- `FormationSection.tsx` (lines 46-66): Toggle buttons for "Left"/"Right" formation direction
- `PlayTypeSection.tsx`: Similar toggles for play direction
- Values saved as-is: "Left", "Right", or empty string
- No normalization between display preference and database storage

**Files Involved:**
- `src/components/playbook/AddNewPlayModal/sections/FormationSection.tsx`
- `src/components/playbook/AddNewPlayModal/sections/PlayTypeSection.tsx`
- `src/components/playbook/play-card/fieldDefinitions.tsx` (lines 81-91, 202-212)
- `src/components/playbook/AddNewPlayModal.tsx` (lines 94, 104)

**Root Cause:**
Direction values are stored directly as "Left"/"Right" without normalization. If there's a display toggle that flips the view, it doesn't normalize the underlying data.

**Recommended Fix:**
1. **Database Storage:** Always store normalized direction (e.g., "Left", "Right", or "")
2. **Display Layer:** Apply user preference for how to render (could flip display without changing data)
3. **Save Logic:** Ensure all direction saves normalize to canonical values
4. **Validation:** Add schema validation to only allow: "", "Left", "Right"

**Implementation Steps:**
- [ ] Audit all direction field save handlers
- [ ] Add normalization function: `normalizeDirection(value: string): "" | "Left" | "Right"`
- [ ] Apply normalization in `playsService.ts` createPlay/updatePlay
- [ ] Separate display preference from data storage
- [ ] Add database constraint if not exists: `CHECK (f_dir IN ('', 'Left', 'Right'))`

---

### 2. 🔴 Missing Personnel Dropdown

**Problem:** No dropdown to select personnel grouping (11, 12, 21, 10, 13, 22, 23, 00) in the play creation form.

**Current Implementation:**
- `PersonnelSection.tsx` (lines 1-114): **HAS** a Select dropdown for personnel!
- Line 70-79: Select with options from `personnel_configurations` table
- Line 84-102: Quick-select buttons for first 4 personnel options
- Loads personnel from database via `usePersonnelConfigurations` hook

**Status:** ✅ **ALREADY IMPLEMENTED**

**Verification Needed:**
- [ ] Check if PersonnelSection is rendered in AddNewPlayModal
- [ ] Verify personnel options are being populated from database
- [ ] Test that selected personnel saves to `plays.personnel` field

**Files to Check:**
- `src/components/playbook/AddNewPlayModal.tsx` - Verify PersonnelSection is included
- `src/hooks/usePersonnel.ts` - Check personnel loading logic
- Database: `personnel_configurations` table should have standard groupings

---

### 3. 🔴 Duplicate Arrows in Dropdown Menus

**Problem:** Dropdown menus showing multiple duplicate arrow icons in both list view and grid view.

**Root Cause Found:** `InlineSelectField.tsx` lines 183-185

```tsx
<Icon
  name="edit"
  className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-muted"
/>
<Icon name="chevron-down" className="h-4 w-4 text-muted" />  // <-- DUPLICATE
```

**Also at Line 132:**
```tsx
<Icon name="chevron-down" className="h-4 w-4 text-muted" />  // <-- In editing mode
```

**Issue:** Component shows:
1. Chevron-down when editing (line 132) - **CORRECT**
2. Edit icon + chevron-down when hovering (lines 183-185) - **DUPLICATE**

**Where Used:**
- `PlayCard` inline editing for: f_dir, p_dir, r_str, p_str fields
- Used in both List View and Grid View
- All direction/strength dropdowns affected

**Recommended Fix:**
Remove the duplicate chevron-down icon on line 185. Keep only the edit icon on hover.

```tsx
// BEFORE (lines 183-185)
<Icon
  name="edit"
  className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-muted"
/>
<Icon name="chevron-down" className="h-4 w-4 text-muted" />  // <-- REMOVE THIS

// AFTER
<Icon
  name="edit"
  className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted"
/>
```

**Files to Fix:**
- `src/components/ui/InlineSelectField.tsx` (line 185)

---

## Summary of Actions

### High Priority (P0)
1. ✅ Remove duplicate chevron-down icon in `InlineSelectField.tsx` line 185
2. 🔍 Audit direction field normalization and add canonical storage
3. ✅ Verify PersonnelSection is rendered and working

### Medium Priority (P1)
4. Add direction value validation/normalization to playsService
5. Add database constraints for direction fields
6. Document direction field behavior in schema

### Low Priority (P2)
7. Consider adding visual indicator when direction display is flipped
8. Add tooltip explaining direction normalization to users

---

## Testing Checklist

### Direction Fields
- [ ] Create play with f_dir="Left", verify saves correctly
- [ ] Create play with f_dir="Right", verify saves correctly
- [ ] Edit play direction inline, verify saves correctly
- [ ] Toggle display preference (if exists), verify data unchanged
- [ ] Query database directly to confirm stored values

### Personnel Dropdown
- [ ] Open AddNewPlayModal, verify personnel dropdown appears
- [ ] Select personnel (e.g., "11"), verify saves to database
- [ ] Quick-select personnel button, verify saves
- [ ] Edit play personnel inline, verify works

### Duplicate Arrows
- [ ] View plays in List View, check f_dir/p_dir dropdowns for duplicate arrows
- [ ] View plays in Grid View, check same fields
- [ ] Hover over dropdown field, should show only edit icon (no arrow)
- [ ] Click to edit, should show chevron-down in select element

---

## Related Files

### Direction Fields
- `src/components/playbook/AddNewPlayModal/sections/FormationSection.tsx`
- `src/components/playbook/AddNewPlayModal/sections/PlayTypeSection.tsx`
- `src/components/playbook/play-card/fieldDefinitions.tsx`
- `src/services/playsService.ts`
- `src/types/play.ts`

### Personnel Dropdown
- `src/components/playbook/AddNewPlayModal/sections/PersonnelSection.tsx`
- `src/hooks/usePersonnel.ts`
- `database/schema.sql` (personnel_configurations table)

### Duplicate Arrows
- `src/components/ui/InlineSelectField.tsx` ⚠️ **NEEDS FIX**
- `src/components/playbook/play-card/fieldDefinitions.tsx` (uses InlineSelectField)

---

## Next Steps

1. **Fix duplicate arrows** (quick win, 2 minutes)
2. **Verify personnel dropdown** (check if already working)
3. **Audit direction normalization** (requires testing and potential DB changes)
4. **Update documentation** (schema.sql, ARCHITECTURE.md)
