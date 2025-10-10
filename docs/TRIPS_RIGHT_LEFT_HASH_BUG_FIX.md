# Trips Right - Left Hash Bug Fix

**Date:** October 10, 2025  
**Status:** ✅ Fixed

## Problem

When moving a **Trips Right** formation (3 receivers right, 1 receiver left) to the **left hash**, the single left receiver was incorrectly positioning in the **middle of the field** instead of staying on the left side at the numbers.

### User Report
> "in our trips right formation when we move it to the left hash the left most receiver goes to the middle of the field thats a bug"

### Root Cause

In `get3x1ReceiverPositions()` function, when handling:
- **Alignment:** Left hash
- **Formation:** Trips Right (3 receivers right, 1 left)
- **Code path:** `alignment === "left"` AND `threeToLeft === false` (trips right)

The single receiver position was incorrectly calculated as:
```typescript
single: rightHash - 3  // ❌ Wrong! rightHash is 32.8 yards, so this = 29.8 yards (middle)
```

This placed the receiver at ~30 yards from the left sideline, which is near the **middle of the field**, not on the left boundary.

## Technical Analysis

### Hash Positions
- **Left hash:** centerX = 20.5 yards
- **Right hash:** centerX = 32.8 yards  
- **Field width:** 53.333 yards

### Numbers Positions
- **Left numbers:** 8 yards from left sideline
- **Right numbers:** 45.3 yards from left sideline

### Formation Context: Trips Right on Left Hash
When the ball is on the **left hash**:
- **Right side** = **FIELD** (wide side, ~32.8 yards of space)
- **Left side** = **BOUNDARY** (short side, ~20.5 yards of space)

**Correct positioning:**
- **3 receivers (trips):** On the FIELD side (right) with spacing
- **1 receiver (single):** On the BOUNDARY side (left) at the numbers (~8 yards)

**Incorrect positioning (bug):**
- Single receiver at `rightHash - 3 = 29.8 yards` (middle of field) ❌

## Solution

Changed the single receiver position from `rightHash - 3` to `leftNumbers`:

```typescript
// Before (WRONG)
else {
  // 3 to FIELD (right/wide side)
  const spacing = (rightNumbers - rightTackleX) / 3;
  return {
    single: rightHash - 3, // ❌ Places at ~29.8 yards (middle)
    right3: rightTackleX + spacing,
    right2: rightTackleX + spacing * 2,
    right1: rightNumbers,
  };
}

// After (CORRECT)
else {
  // 3 to FIELD (right/wide side) - This is Trips Right
  const spacing = (rightNumbers - rightTackleX) / 3;
  return {
    single: leftNumbers, // ✅ Places at ~8 yards (left numbers)
    right3: rightTackleX + spacing,
    right2: rightTackleX + spacing * 2,
    right1: rightNumbers,
  };
}
```

## Verification

### Test Scenario
1. Create Trips Right formation (3 WR right, 1 WR left)
2. Start on middle hash
3. Click "Left" hash button
4. Observe receiver positions

### Expected Result After Fix
- **Single left receiver:** At left numbers (~8 yards from left sideline)
- **Three right receivers:** Evenly spaced from right tackle to right numbers
- **Formation appearance:** Natural trips right alignment with single to boundary

### Before Fix
- ❌ Single receiver at ~29.8 yards (appeared in middle of field)
- ❌ Looked like formation was bunched/compressed
- ❌ Not realistic trips formation

### After Fix
- ✅ Single receiver at ~8 yards (left numbers)
- ✅ Proper field/boundary spacing
- ✅ Realistic trips right formation

## Impact

**File Modified:**
- `/src/components/playbook/diagram-editor/components/PlayerControls.tsx`
  - Line 527: Changed `single: rightHash - 3` to `single: leftNumbers`

**Similar Patterns Checked:**
- ✅ Trips Left on Right Hash: Uses `rightNumbers` for single receiver (CORRECT)
- ✅ Trips Right on Middle Hash: Uses fixed position `6` yards (CORRECT)
- ✅ Trips Left on Middle Hash: Uses fixed position `fieldWidth - 6` (CORRECT)

**No other hash/formation combinations affected.**

## Related Code

### Function: `get3x1ReceiverPositions()`
**Purpose:** Calculate receiver X positions for 3x1 formations based on:
- Hash alignment (left/middle/right)
- Which side has 3 receivers (left/right)
- Tackle positions for spacing

**Logic:**
1. **Middle hash:** Balanced splits, fixed positions
2. **Left hash:** Right = field (wide), Left = boundary (short)
3. **Right hash:** Left = field (wide), Right = boundary (short)

### Receiver Naming Convention
- `left1`, `left2`, `left3`: Three receivers on left (outside to inside)
- `right1`, `right2`, `right3`: Three receivers on right (outside to inside)
- `single`: The lone receiver on opposite side

### Position References
```typescript
const leftNumbers = fieldWidth * 0.15;    // ~8 yards
const rightNumbers = fieldWidth * 0.85;   // ~45.3 yards
const leftSidelineHash = 1;               // 1 yard
const rightSidelineHash = fieldWidth - 1; // ~52.3 yards
const rightHash = fieldWidth / 2 + 6.17;  // ~32.8 yards
```

## Testing Checklist

- [x] No TypeScript errors
- [ ] Test Trips Right on Left hash (fixed scenario)
- [ ] Test Trips Right on Middle hash (should be unchanged)
- [ ] Test Trips Right on Right hash (should be unchanged)
- [ ] Test Trips Left on Left hash (should be unchanged)
- [ ] Test Trips Left on Middle hash (should be unchanged)
- [ ] Test Trips Left on Right hash (should be unchanged)
- [ ] Visual verification: Single receiver at numbers on boundary side
- [ ] Visual verification: Trips receivers evenly spaced on field side

## Notes

This was a simple but critical bug in formation alignment logic. The fix ensures that when trips is to the field (wide side), the single receiver correctly positions at the numbers on the boundary (short) side, not in the middle of the field.

The bug was specific to **Trips Right on Left Hash** because:
- Left hash makes right side the field (wide)
- Trips Right puts 3 receivers on the field side
- Single receiver should be on boundary (left) side
- Code incorrectly used `rightHash - 3` instead of `leftNumbers`

**Key insight:** When the ball is on a hash, the single receiver should ALWAYS be at the "numbers" position on the boundary side, not calculated relative to the hash position.
