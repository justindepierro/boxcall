# Data Validation Testing Guide

Quick reference for testing the new validation system in AddNewPlayModal.

## Test Scenarios

### ✅ Scenario 1: Auto-Normalization

**Test**: Type lowercase/uppercase variations

1. Open "Create New Play" modal
2. Formation field: Type `"SHOTGUN"` → Blur field
   - **Expected**: Auto-changes to `"Shotgun"` with green border
3. Formation field: Type `"i-formation"` → Blur field
   - **Expected**: Auto-changes to `"I-Formation"` with green border
4. Personnel field: Type `"TRIPS"` → Blur field
   - **Expected**: Auto-changes to `"Trips"` with green border

### ⚠️ Scenario 2: Fuzzy Matching (Dropdown Suggestions)

**Test**: Type similar values to existing plays

**Setup**: First create a play with Formation: "Twins"

1. Open modal again
2. Formation field: Type `"Twin"` (missing 's')
   - **Expected**: Yellow border appears after 300ms
   - **Expected**: Dropdown appears showing "Twins" with 90% confidence badge
   - **Expected**: Warning message below: "⚠️ Similar to existing values"
3. Press **Enter** key
   - **Expected**: First suggestion "Twins" is auto-selected
   - **Expected**: Green border, dropdown closes, focus moves to next field
4. **OR** Click **"Twins"** in dropdown
   - **Expected**: Input changes to "Twins"
   - **Expected**: Green border, dropdown closes

### 🛑 Scenario 3: Duplicate Prevention (Red Error)

**Test**: Try to create duplicate play names

**Setup**: First create a play named "Power O"

1. Open modal again
2. Play Name field: Type `"Power O"` exactly
   - **Expected**: Red border appears after 300ms
   - **Expected**: Error message: "Play name already exists"
3. Try to submit form
   - **Expected**: Submit button disabled OR error toast

### ⌨️ Scenario 4: Keyboard Navigation

**Test**: Use Enter/Escape keys

1. Open modal
2. Formation field: Type `"Shotgun"` → Press **Enter**
   - **Expected**: Focus moves to Play Name field
3. Play Name field: Type `"Power"` → Press **Escape**
   - **Expected**: Input clears, field blurs
4. Formation field: Type `"Twin"` (with "Twins" existing) → Press **Enter**
   - **Expected**: Dropdown suggestion "Twins" auto-selected
   - **Expected**: Input changes to "Twins", moves to next field
5. Formation field: Type `"Twin"` → Press **Escape**
   - **Expected**: Dropdown closes (first press)
   - **Expected**: Press Escape again → Input clears

### 🎯 Scenario 5: Create New Despite Warning

**Test**: Override fuzzy match suggestion

**Setup**: Existing formation "Twins"

1. Formation field: Type `"Twin"` (singular, intentional)
   - **Expected**: Yellow warning with "Twins" suggestion in dropdown
2. Press **Escape** to close dropdown without selecting
3. Input stays as "Twin", type continues
4. Press **Enter** again
   - **Expected**: Green border (valid new entry)
   - **Expected**: Moves to next field
5. Submit form
   - **Expected**: Play created with formation "Twin" (not "Twins")

### 💾 Scenario 6: Personnel Validation

**Test**: Numeric vs named personnel

1. Personnel field: Type `"11"`
   - **Expected**: Green border (valid numeric)
   - **Expected**: No normalization (stays "11")
2. Personnel field: Type `"12"`
   - **Expected**: Green border
3. Personnel field: Type `"empty"`
   - **Expected**: Auto-normalizes to "Empty" on blur
   - **Expected**: Green border

## Edge Cases

### Edge Case 1: Very Similar Matches (Multiple)

**Setup**: Create plays with formations "Trips", "Trips Right", "Trips Left"

1. Type `"Trip"` in formation field
   - **Expected**: Shows all 3 suggestions in confirmation dialog
   - **Expected**: Each with confidence percentage
   - **Expected**: Sorted by confidence (highest first)

### Edge Case 2: Empty Existing Values

**Test**: First play in empty playbook

1. Open modal with no existing plays
2. Type any formation (e.g., "Shotgun")
   - **Expected**: Green border (no duplicates to check)
   - **Expected**: No warnings

### Edge Case 3: Special Characters

**Test**: Formations with special chars

1. Formation: Type `"I-Formation"`
   - **Expected**: Green border, valid
2. Formation: Type `"3-4 Defense"`
   - **Expected**: Green border, valid
   - **Expected**: Auto-normalizes to "3-4 Defense" (Title Case)

### Edge Case 4: Long Formation Names

**Test**: 50+ character formation name

1. Formation: Type very long string (e.g., "Shotgun Trips Right Nasty Split with Motion")
   - **Expected**: Validation still works
   - **Expected**: Green border if unique
   - **Expected**: Fuzzy matching still fast (<500ms)

## Visual Indicators Reference

| State   | Border Color  | Icon | Message Example                    |
| ------- | ------------- | ---- | ---------------------------------- |
| Idle    | Gray          | -    | -                                  |
| Typing  | Gray          | -    | -                                  |
| Valid   | Green         | ✓    | "Looks good!"                      |
| Saved   | Green + Pulse | ✓    | "Saved" (green dot)                |
| Warning | Yellow        | ⚠   | "Similar to existing: Twins (90%)" |
| Error   | Red           | ✗    | "Formation already exists"         |

## Keyboard Hints

Shown below input field:

- **Enter** to confirm → Moves to next field
- **Escape** to clear → Clears input and blurs
- **Tab** → Standard tab order

## Performance Benchmarks

Expected validation times (measured in browser console):

- Normalization: <5ms
- Levenshtein calculation: <10ms
- Fuzzy matching (50 existing values): <50ms
- Total validation cycle: <300ms (debounced)

If validation takes >500ms, investigate performance issue.

## Browser Console Debugging

Enable debug logging:

```javascript
// In browser console
localStorage.setItem("DEBUG_VALIDATION", "true");
// Reload page
```

Look for logs:

```
[ValidatedInput] Validation result: {state: "warning", suggestions: [...]}
[dataValidation] Levenshtein distance: Twin → Twins = 1
[dataValidation] Normalized: SHOTGUN → Shotgun
```

## Common Issues & Fixes

### Issue: Validation not triggering

**Symptom**: Type input, but border stays gray

**Fix**: Check that `existingPlays` prop is passed to modal

### Issue: Fuzzy match too sensitive

**Symptom**: Everything shows yellow warning

**Fix**: Increase threshold in `findSimilarMatches()` from 2 to 3

### Issue: Auto-normalization not working

**Symptom**: "SHOTGUN" doesn't change to "Shotgun" on blur

**Fix**: Check `onBlur` handler in ValidatedInput component

### Issue: Keyboard shortcuts not working

**Symptom**: Enter key doesn't move to next field

**Fix**: Verify `onNextField` prop is connected in parent component

## Test Data Setup

Recommended test data for comprehensive testing:

```typescript
// Create these plays first for testing:
const testPlays = [
  { formation: "Twins", play_name: "Power O", personnel: "11" },
  { formation: "Shotgun", play_name: "Slant", personnel: "11" },
  { formation: "I-Formation", play_name: "Dive", personnel: "21" },
  { formation: "Trips Right", play_name: "Follow", personnel: "12" },
  { formation: "Empty", play_name: "Quick Screen", personnel: "10" },
];
```

Then test variations:

- "Twin" → Should warn about "Twins"
- "Shotgn" → Should warn about "Shotgun"
- "Power O" → Should error (duplicate play name)
- "TRIPS" → Should normalize to "Trips"

## Success Criteria

✅ All scenarios pass
✅ No console errors
✅ Validation feels instant (<300ms perceived)
✅ Keyboard shortcuts work smoothly
✅ Confirmation dialogs appear correctly
✅ Database stays "Clean AF" (no TWINS/twins/Twin variations)

## Next Steps After Testing

1. Test on mobile (smaller viewport)
2. Test with slow network (3G throttling)
3. Test with large playbooks (100+ plays)
4. Collect user feedback from coaches
5. Monitor analytics for validation override rate
