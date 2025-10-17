# Formation Selector: Missing LEFT Variants Issue

**Date**: October 14, 2025  
**Status**: ⚠️ Issue Identified

## 🐛 Problem

In the Formation Selector dropdown (new play creator), seeing:

- ✅ Base formations (Trips Base, Twins Base)
- ✅ RIGHT variants (Trips → Right, Twins → Right)
- ❌ **Missing LEFT variants** (Trips → Left, Twins → Left)

## 🔍 Root Cause Analysis

### Current State

```
Database formations:
- Trips (direction: "base", base_formation_id: null)
- Trips (direction: "right", base_formation_id: <trips_base_id>)
- Twins (direction: "base", base_formation_id: null)
- Twins (direction: "right", base_formation_id: <twins_base_id>)

Missing:
- Trips (direction: "left", base_formation_id: <trips_base_id>) ❌
- Twins (direction: "left", base_formation_id: <twins_base_id>) ❌
```

### Why Are LEFT Variants Missing?

**Most Likely**: When formations were imported from text-based plays, only RIGHT variants were created.

**Formation Import Process**:

1. System scans existing plays for formation names
2. Creates database formations for each unique name
3. Creates variants based on detected usage
4. **Issue**: If plays only used "Trips Right" and not "Trips Left", LEFT variant wasn't created

## 📊 Current Filtering Logic

The filtering logic is working correctly:

```typescript
// Hide base formations that have variants
const baseFormationIds = new Set(
  formations
    .filter((f) => f.base_formation_id !== null) // Find all variants
    .map((f) => f.base_formation_id) // Get their base IDs
);

const visibleFormations = formations.filter((formation) => {
  // Show all variants
  if (formation.base_formation_id !== null) return true;

  // Only show base formations that have NO variants
  return !baseFormationIds.has(formation.id);
});
```

**Current Behavior** (with debug logs added):

- Trips Base: Has RIGHT variant → Should hide ✅
- Trips Right: Is variant → Should show ✅
- Twins Base: Has RIGHT variant → Should hide ✅
- Twins Right: Is variant → Should show ✅

**BUT**: Base formations are still showing in the screenshot! This means either:

1. The filtering isn't being applied (caching issue?)
2. OR the base formations actually DON'T have variants yet (data mismatch)

## 🔧 Changes Made

### 1. Added Debug Logging

```typescript
console.log(
  "[FormationSelector] All formations:",
  formations.map((f) => ({
    name: f.name,
    direction: f.direction,
    base_formation_id: f.base_formation_id,
    id: f.id,
  }))
);
console.log(
  "[FormationSelector] Base formation IDs with variants:",
  Array.from(baseFormationIds)
);
console.log(
  "[FormationSelector] Visible formations:",
  visibleFormations.map((f) => `${f.name} (${f.direction})`)
);
```

**This will show us**:

- What formations are actually in the database
- Which ones have `base_formation_id` set
- What's visible after filtering

### 2. Fixed Direction Label for Base Formations

```typescript
// Before
case "base":
default:
  return "Base"; // ❌ Shows "Base" label

// After
case "base":
default:
  return ""; // ✅ No label for base formations
```

**Impact**: Base formations that don't have variants will just show "Trips" instead of "Trips Base"

## 🎯 Solution Options

### Option 1: Create Missing LEFT Variants (Recommended)

**For each base formation that has a RIGHT variant**, also create a LEFT variant:

```typescript
// Pseudo-code
for each base formation with RIGHT variant:
  if (no LEFT variant exists):
    create LEFT variant with:
      - name: <base_name>
      - direction: "left"
      - base_formation_id: <base_id>
      - copy all other fields from base
```

**Pros**:

- Complete variant coverage
- Users can select left OR right formations
- Symmetrical formation system

**Cons**:

- Need to bulk-create missing variants
- Takes a few minutes to implement

### Option 2: Keep Current State (Not Recommended)

Accept that some formations only have RIGHT variants.

**Pros**:

- No code changes needed

**Cons**:

- Inconsistent user experience
- Users can't create left-variant plays
- Confusing when "Trips Left" option doesn't exist

### Option 3: Hide Base Formations Even Without LEFT Variants

If we want base formations to ONLY show when they have BOTH left AND right variants:

```typescript
const hasLeftVariant = (baseId: string) => {
  return formations.some(
    (f) => f.base_formation_id === baseId && f.direction === "left"
  );
};

const hasRightVariant = (baseId: string) => {
  return formations.some(
    (f) => f.base_formation_id === baseId && f.direction === "right"
  );
};

const visibleFormations = formations.filter((formation) => {
  if (formation.base_formation_id !== null) return true;

  // Only hide base if it has BOTH variants
  return !hasLeftVariant(formation.id) || !hasRightVariant(formation.id);
});
```

**Pros**:

- Forces complete variant sets
- Clean UI

**Cons**:

- Hides bases even with incomplete variants
- Users can't create base formations at all

## 🚀 Recommended Action

**Option 1: Create Missing LEFT Variants**

### Step 1: Audit Current Formations

Run this in browser console on Formation Selector page:

```javascript
// This will show in console after debug logs are active
// Look for formations with base_formation_id !== null
// Check if each base has BOTH left and right variants
```

### Step 2: Bulk Create LEFT Variants

Use FormationService to create missing LEFT variants:

```typescript
// For each base formation with ONLY right variant
const missingLeftVariants = baseFormations.filter((base) => {
  const hasRight = formations.some(
    (f) => f.base_formation_id === base.id && f.direction === "right"
  );
  const hasLeft = formations.some(
    (f) => f.base_formation_id === base.id && f.direction === "left"
  );
  return hasRight && !hasLeft;
});

// Create LEFT variants for each
for (const base of missingLeftVariants) {
  await FormationService.createFormation({
    playbook_id: base.playbook_id,
    name: base.name,
    description: base.description,
    category: base.category,
    base_formation_id: base.id, // Link to base
    direction: "left",
    // ... copy other fields from base
  });
}
```

### Step 3: Verify

After creating LEFT variants:

1. Refresh Formation Selector
2. Should see: Trips → Left, Trips → Right (no base)
3. Should see: Twins → Left, Twins → Right (no base)

## 🧪 Testing the Debug Logs

1. Open new play creator
2. Click Formation Selector dropdown
3. Open browser console (F12)
4. Look for logs like:

```
[FormationSelector] All formations: [...]
[FormationSelector] Base formation IDs with variants: [...]
[FormationSelector] ✅ Showing variant: Trips (right)
[FormationSelector] ❌ Base formation: Trips - has variants: true
[FormationSelector] Visible formations: [...]
```

This will tell us:

- **If base formations actually have `base_formation_id` links**
- **Why they're still showing in the UI**
- **What formations are being filtered out**

## 📝 Next Steps

1. ✅ Debug logs added - Check console output
2. ⏳ Audit database to find missing LEFT variants
3. ⏳ Create missing LEFT variants in bulk
4. ⏳ Verify filtering works correctly
5. ⏳ Remove debug logs once confirmed working

---

**Status**: Waiting for console output to determine if it's a filtering bug or missing data issue.

**Most Likely**: Missing LEFT variants in database need to be created.
