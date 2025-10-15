# Formation Selector: Hide Linked Base Formations

**Date**: October 14, 2025  
**Status**: ✅ Complete

## 🎯 Problem

When a base formation has been linked to database formations (left/right variants), both the base formation and its variants were showing in the FormationSelector dropdown. This caused confusion and clutter.

**Example:**

```
Formation Selector:
- Trips (base) ← Should be hidden
- Trips (left) ← Keep
- Trips (right) ← Keep
```

## ✅ Solution

Added filtering logic to hide base formations that have variants linked to them. Now only shows:

1. **Formation variants** (formations with `base_formation_id` set)
2. **Base formations that haven't been linked yet** (no variants exist)

## 📝 Changes Made

### 1. FormationSelector.tsx - Added Visibility Filtering

**Location**: `src/components/playbook/FormationSelector.tsx`

**Before:**

```typescript
const groupedFormations = formations.reduce(
  (acc, formation) => {
    const category = formation.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(formation);
    return acc;
  },
  {} as Record<string, Formation[]>
);
```

**After:**

```typescript
// Filter out base formations that have variants (linked formations)
// Keep: 1) Formations with variants (base_formation_id NOT NULL)
//       2) Base formations with NO variants yet
const baseFormationIds = new Set(
  formations
    .filter((f) => f.base_formation_id !== null)
    .map((f) => f.base_formation_id)
);

const visibleFormations = formations.filter((formation) => {
  // If this is a variant (has base_formation_id), always show it
  if (formation.base_formation_id !== null) return true;

  // If this is a base formation (base_formation_id is null),
  // only show it if it has NO variants yet
  return !baseFormationIds.has(formation.id);
});

const groupedFormations = visibleFormations.reduce(
  (acc, formation) => {
    const category = formation.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(formation);
    return acc;
  },
  {} as Record<string, Formation[]>
);
```

### 2. Updated Empty State Logic

**Changed references from `formations` to `visibleFormations`:**

```typescript
// Dropdown menu condition
{isOpen && !isLoading && visibleFormations.length > 0 && (

// Empty state condition
{isOpen && !isLoading && visibleFormations.length === 0 && (
```

### 3. Enhanced Empty State Message

**Before:**

```typescript
<p className="text-sm text-text-muted mb-spacing-xs">
  No formations yet
</p>
<p className="text-xs text-text-muted">
  Create formations using the Formation Builder
</p>
```

**After:**

```typescript
<p className="text-sm text-text-muted mb-spacing-xs">
  {formations.length > 0
    ? "All base formations have been linked to variants"
    : "No formations yet"}
</p>
<p className="text-xs text-text-muted">
  {formations.length > 0
    ? "Use the Link button to manage formation variants"
    : "Create formations using the Formation Builder"}
</p>
```

Now provides context-aware messaging:

- If formations exist but all are hidden → "All base formations have been linked"
- If no formations exist at all → "No formations yet"

## 🧪 How It Works

### Formation Data Structure

```typescript
interface Formation {
  id: string;
  base_formation_id: string | null; // NULL = this IS the base formation
  direction: FormationDirection; // "base" | "left" | "right"
  // ... other fields
}
```

### Filtering Logic

1. **Build Set of Base Formation IDs** that have variants:

   ```typescript
   const baseFormationIds = new Set(
     formations
       .filter((f) => f.base_formation_id !== null) // Find all variants
       .map((f) => f.base_formation_id) // Get their base IDs
   );
   ```

2. **Filter Formations**:
   ```typescript
   const visibleFormations = formations.filter((formation) => {
     // Variant? Always show
     if (formation.base_formation_id !== null) return true;

     // Base formation? Only show if no variants exist
     return !baseFormationIds.has(formation.id);
   });
   ```

### Example Scenarios

**Scenario 1: Base formation with variants**

```
Database:
- Trips (id: "abc", base_formation_id: null) ← Hidden
- Trips Left (id: "def", base_formation_id: "abc") ← Visible
- Trips Right (id: "ghi", base_formation_id: "abc") ← Visible

Selector shows: Trips Left, Trips Right
```

**Scenario 2: Base formation without variants**

```
Database:
- I Formation (id: "jkl", base_formation_id: null) ← Visible

Selector shows: I Formation
```

**Scenario 3: Mix of both**

```
Database:
- Trips (id: "abc", base_formation_id: null) ← Hidden
- Trips Left (id: "def", base_formation_id: "abc") ← Visible
- Trips Right (id: "ghi", base_formation_id: "abc") ← Visible
- I Formation (id: "jkl", base_formation_id: null) ← Visible

Selector shows: Trips Left, Trips Right, I Formation
```

## 🎯 Benefits

1. **Cleaner UI** - No duplicate base formations cluttering the selector
2. **Better UX** - Users select the specific variant they want (Left/Right)
3. **Consistent** - Encourages use of the formation linking system
4. **Smart Fallback** - Unlinked base formations still show up for legacy support

## ✅ Validation

- ✅ Type check passed (0 errors)
- ✅ Logic tested with Set-based filtering
- ✅ Empty states handled correctly
- ✅ Context-aware messaging implemented

## 🚀 Impact

**User Experience:**

- Formations dropdown is now cleaner and more focused
- Users see only actionable formation choices
- Clear messaging when all formations are linked

**Developer Experience:**

- Clean, readable filtering logic
- Well-commented code explains the behavior
- Performance: O(n) filtering with Set-based lookup

## 📊 Technical Notes

### Performance

- **Time Complexity**: O(n) where n = number of formations
- **Space Complexity**: O(m) where m = number of base formation IDs
- Typically very small datasets (< 50 formations per playbook)

### Edge Cases Handled

1. ✅ No formations exist → Show "No formations yet"
2. ✅ All formations are linked → Show helpful message
3. ✅ Mix of linked and unlinked → Show unlinked bases + all variants
4. ✅ Formation is selected but then gets linked → Selection still valid

## 🔄 Future Enhancements

Potential improvements:

1. Add visual indicator for base vs variant formations
2. Show base formation name in variant tooltip
3. Add "View all formations (including bases)" toggle for advanced users
4. Bulk linking UI for multiple formations at once

---

**Result**: Formation selector now intelligently hides base formations that have been linked to variants, creating a cleaner and more focused user experience! 🎉
