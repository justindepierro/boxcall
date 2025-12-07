# Practice Script Dropdown - Full Debug & Fix

**Date**: December 7, 2025  
**Status**: 🔧 Fixed - Ready for Testing

---

## 🐛 Issues Found & Fixed

### Issue 1: Supabase Query Error (400)

**Problem**: Multi-line select statement with newlines and spaces causing Supabase REST API to reject the query

**Error**:

```
Failed to load resource: the server responded with a status of 400
```

**Root Cause**:

```typescript
// ❌ BROKEN - Newlines and spaces in select string
.select(`
  id, play_name, formation, personnel, p_type, diagram_image_url, diagram_url,
  f_dir, f_type, back_align, back_position, shift, motion, ftag1, ftag2,
  p_dir, protection, p_tag1, p_tag2, one_word_play, r_str, p_str
`)
```

**Fix**:

```typescript
// ✅ FIXED - Single line, no spaces around commas
.select("id,play_name,formation,personnel,p_type,diagram_image_url,diagram_url,f_dir,f_type,back_align,shift,motion,ftag1,ftag2,p_dir,protection,p_tag1,p_tag2,one_word_play,r_str,p_str")
```

### Issue 2: Non-existent Field

**Problem**: Querying `back_position` field that doesn't exist in the `plays` table

**Database Schema** (from `src/types/play.ts`):

- ✅ `back_align` - EXISTS
- ❌ `back_position` - DOES NOT EXIST
- ✅ `back_left_of_qb` - EXISTS (boolean)
- ✅ `back_right_of_qb` - EXISTS (boolean)

**Fix**: Removed `back_position` from query

### Issue 3: Search Not Working

**Problem**: Filtering plays by `play.play_name` but users see formatted display names

**Root Cause**:

```typescript
// ❌ User sees "Pro Right Sooner" but searches raw "sooner"
filteredPlays = playbookPlays.filter((play) =>
  play.play_name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

**Fix**:

```typescript
// ✅ Search by formatted display name
filteredPlays = playbookPlays.filter((play) => {
  const displayName = getDisplayName(play, false);
  return displayName.toLowerCase().includes(searchQuery.toLowerCase());
});
```

### Issue 4: Combobox Display Value Mismatch

**Problem**: Input shows raw `play_name` instead of formatted display name

**Root Cause**:

```typescript
// ❌ Shows "sooner" instead of "Pro Right Sooner"
displayValue={(play: Play | null) => play?.play_name || searchQuery}
```

**Fix**:

```typescript
// ✅ Shows formatted name matching list view
displayValue={(play: Play | null) => {
  if (play) {
    return getDisplayName(play, false);
  }
  return searchQuery;
}}
```

---

## 🔍 Debug Logging Added

### Console Logs for Tracing

1. **Play Loading**:

   ```typescript
   console.log("✅ Loaded plays:", plays?.length || 0);
   console.log("📋 Sample play:", plays[0]);
   console.log("⚠️ No active playbook found for team");
   ```

2. **Search Filtering**:

   ```typescript
   console.log("🔍 Filtering plays:", { totalPlays, searchQuery });
   console.log("✅ Match found:", displayName);
   console.log("📊 Filtered results:", filtered.length);
   ```

3. **Play Selection**:

   ```typescript
   console.log("🎯 Play selected:", play?.play_name);
   console.log("📝 Formatted display name:", displayName);
   ```

4. **Input Changes**:
   ```typescript
   console.log("⌨️ Input changed:", value);
   console.log("📺 Display value for selected play:", displayName);
   ```

---

## 🧪 Testing Checklist

### Test 1: Modal Opens

- [ ] Open practice script modal from playbook page
- [ ] "Add New Play" form visible
- [ ] Input field shows placeholder text

### Test 2: Plays Load

**Expected Console Output**:

```
✅ Loaded plays: 26
📋 Sample play: { id: "...", play_name: "sooner", formation: "Pro", ... }
```

**If No Plays**:

```
⚠️ No active playbook found for team
```

### Test 3: Search Works

**Steps**:

1. Type "soon" in play name input
2. Check console for:
   ```
   🔍 Filtering plays: { totalPlays: 26, searchQuery: "soon" }
   ✅ Match found: Pro Right Sooner
   📊 Filtered results: 2
   ```
3. Dropdown should show matching plays in list format

### Test 4: Dropdown Shows List View

**Expected**:

- ✅ Simple list items (not grid cards)
- ✅ Play names formatted like playbook (e.g., "Pro Right Sooner", "Trips Left Weak")
- ✅ Personnel badge visible
- ✅ Play type badge visible
- ✅ Thumbnail image if available

### Test 5: Play Selection

**Steps**:

1. Click a play from dropdown
2. Check console:
   ```
   🎯 Play selected: sooner
   📝 Formatted display name: Pro Right Sooner
   ⌨️ Input changed: Pro Right Sooner
   ```
3. Input should show formatted name
4. Personnel field should auto-fill if available

### Test 6: Custom Play Name

**Steps**:

1. Type a play name not in playbook (e.g., "Custom Play 1")
2. Should see: "No plays found. Enter a custom play name."
3. Can still submit with custom name

---

## 🎯 Expected Behavior

### Display Name Format

The dropdown now uses `getDisplayName(play, false)` which formats plays based on:

1. **One Word Play** (if set): `"SOONER"`
2. **Concatenated Name** (default):
   - Formation: `"Pro"`
   - Direction: `"Right"`
   - Formation Tags: `"Twins"`, `"Stack"`
   - Back Alignment: `"Near"` (if applicable)
   - Shift/Motion: `"Jet"`, `"Orbit"`
   - Protection: `"60"` (excluding "half" protections)
   - Play Name: `"Sooner"`
   - Play Direction: `"Left"`
   - Play Tags: `"Read"`, `"Option"`

**Example Output**: `"Pro Right Twins Sooner Left Read"`

### User Experience

1. **Type to search** - Searches formatted names, not raw database values
2. **Select from list** - Clean list view matching playbook
3. **Auto-fill metadata** - Personnel, formation data carried over
4. **Custom plays supported** - Can enter any play name manually

---

## 📁 Files Modified

### `PracticeScriptPlayForm.tsx`

**Location**: `/src/components/practice/PracticeScriptModal/components/`

**Changes**:

1. ✅ Fixed Supabase query (removed newlines, removed `back_position`)
2. ✅ Added comprehensive console logging
3. ✅ Search filters by display name
4. ✅ Combobox shows formatted display names
5. ✅ Grid layout → List layout
6. ✅ Added `useMemo` for filtered plays
7. ✅ Import `getDisplayName` utility
8. ✅ Import `PersonnelBadge` component

**Imports Added**:

```typescript
import { useMemo } from "react";
import { getDisplayName } from "../../../../utils/playNameUtils";
import { PersonnelBadge } from "../../../playbook/PersonnelBadge";
```

**Imports Removed**:

```typescript
import {
  getTileGradient,
  getTileIcon,
} from "../../../playbook/play-card/helpers";
```

---

## 🚀 Next Steps

1. **Test in Browser**
   - Open practice script modal
   - Try searching for plays
   - Check console logs for errors
   - Verify dropdown shows plays

2. **Verify Export**
   - Add plays to script
   - Save script
   - Check database: play names should be formatted
   - Export to PDF/CSV: names should match

3. **Edge Cases**
   - Empty playbook (no plays)
   - Custom play names (not in playbook)
   - Plays with missing fields
   - Special characters in play names

4. **Performance**
   - Large playbooks (100+ plays)
   - Search responsiveness
   - Dropdown scroll performance

---

## 🎓 Technical Notes

### Why List View vs Grid?

- **User Request**: "i want it to be in list mode. i just want the names to display how they are displayed on the list view"
- **Consistency**: Matches playbook list view exactly
- **Performance**: Faster rendering for large play lists
- **Usability**: Easier to scan play names quickly

### Field Visibility

The `getDisplayName()` utility respects user preferences for:

- Field order (formation fields, play detail fields)
- Field visibility (hide/show specific fields)
- Direction display format (full, abbreviated, letter)

**Future Enhancement**: Could pass user preferences to the dropdown to match their exact playbook customization.

### Type Safety

All field mappings use proper TypeScript types from:

- `src/types/play.ts` - Play interface
- `src/utils/playNameUtils.ts` - Display name utilities
- No `as any` casting in the dropdown code

---

## ✅ Success Criteria

- [ ] No 400 errors in console
- [ ] Plays load successfully (see count in console)
- [ ] Search finds plays by formatted name
- [ ] Dropdown shows list view (not grid)
- [ ] Play names formatted like playbook
- [ ] Selection fills in play name correctly
- [ ] Custom play names still work
- [ ] Export uses formatted names

**Status**: 🟢 Ready for Testing
