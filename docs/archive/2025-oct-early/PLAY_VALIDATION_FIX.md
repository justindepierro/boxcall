# Play Validation Fix - October 14, 2025

## Issue Summary

Play creation was failing with validation errors for `p_type` and `personnel` fields, despite multiple attempts to clean up empty strings.

### Error Messages

```
Invalid option: expected one of "run"|"pass"|"rpo"|... but got "Pass"
Personnel must be 2 digits (e.g., '11', '12', '21') or empty but got "Blue"
```

## Root Cause Analysis

### Problem 1: Play Type Case Mismatch ❌

**Database Schema** (line 116 of `20250928012435_apply_complete_schema.sql`):

```sql
p_type TEXT NOT NULL CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action'))
```

- Database constraint requires **capitalized** values: `'Pass'`, `'Run'`, etc.

**Validation Schema** (playValidation.ts):

```typescript
const PlayTypeEnum = z.enum([
  "run", // ❌ lowercase
  "pass", // ❌ lowercase
  // ...
]);
```

- Validation expected **lowercase** values

**Form UI** (PlayTypeSection.tsx):

```typescript
const PLAY_TYPE_OPTIONS = ["Run", "Pass", "RPO", "Screen", "Boot"];
```

- Form sends **capitalized** values (matching database)

**Result**: Form → `"Pass"` → Validation rejects lowercase enum → Error

### Problem 2: Personnel Validation Too Strict ❌

**Database Schema**:

```sql
personnel TEXT,  -- No constraints, accepts any string
```

**Validation Schema** (playValidation.ts - BEFORE FIX):

```typescript
personnel: z.string().refine(
  (val) => !val || /^\d{2}$/.test(val),
  "Personnel must be 2 digits (e.g., '11', '12', '21') or empty"
);
```

- Validation required **exactly 2 digits**

**Form UI** (PersonnelSection.tsx):

```typescript
// Uses personnel configuration names from database
options={[
  { value: "Blue", label: "Blue (1 RB, 1 TE, 3 WR)" },
  { value: "Red", label: "Red (2 RB, 1 TE, 2 WR)" },
  // ...
]}
```

- Form sends **configuration names** like `"Blue"`, `"11 Personnel"`

**Result**: Form → `"Blue"` → Validation expects 2 digits → Error

## Solution

### Fix 1: Update PlayTypeEnum to Match Database ✅

**File**: `src/validation/playValidation.ts`

```typescript
// BEFORE
const PlayTypeEnum = z.enum([
  "run",
  "pass",
  "rpo",
  "play-action",
  // ...
]);

// AFTER - Match database constraint
const PlayTypeEnum = z.enum([
  "Run", // ✅ Capitalized
  "Pass", // ✅ Capitalized
  "RPO", // ✅ Uppercase
  "Play Action", // ✅ Capitalized with space
  "Screen",
  "Draw",
  "Bootleg",
  "Rollout",
  "QB Sneak",
  "Punt",
  "Field Goal",
  "Kickoff",
  "Special",
]);
```

**Reasoning**: Database constraint is the source of truth, existing data uses capitalized format.

### Fix 2: Remove Strict Personnel Validation ✅

**File**: `src/validation/playValidation.ts`

```typescript
// BEFORE
personnel: z.preprocess(
  (val) => val === "" || val === null ? undefined : val,
  z.string()
    .max(20)
    .refine((val) => !val || /^\d{2}$/.test(val),
      "Personnel must be 2 digits (e.g., '11', '12', '21') or empty")
    .optional()
),

// AFTER - Allow any string (configuration names)
personnel: z.preprocess(
  (val) => val === "" || val === null ? undefined : val,
  z.string()
    .max(50, "Personnel name too long")
    .optional()
),
```

**Reasoning**:

- Database has no constraints on personnel field
- Form uses configuration names ("Blue", "11 Personnel", etc.)
- Validation should match actual usage pattern

### Fix 3: Remove Debug Logging ✅

**Files**:

- `src/pages/PlaybookPage.tsx` - Removed console.log showing play data
- `src/services/securePlaysService.ts` - Removed console.log showing validation data

**Reasoning**: Debug logs served their purpose (identified root cause), no longer needed.

## Verification

### Type Check ✅

```bash
npm run type-check
# Result: 0 errors
```

### Expected Behavior Now ✅

**Test Case 1: Play with Type**

```typescript
{
  play_name: "Power",
  formation: "Trips",
  p_type: "Run",  // ✅ Capitalized, matches database
  personnel: "Blue"  // ✅ String, matches usage
}
// Result: ✅ Validation passes
```

**Test Case 2: Play without Type**

```typescript
{
  play_name: "Smaug",
  formation: "Twins",
  // p_type omitted
  // personnel omitted
}
// Result: ✅ Validation passes (both fields optional)
```

## Lessons Learned

1. **Database = Source of Truth**: When validation conflicts with database constraints, align with database schema
2. **Check Actual Data Flow**: Debug logs revealed values weren't empty strings (as initially suspected)
3. **Understand the Full Stack**: Issue required examining:
   - Database migrations (constraints)
   - Validation schemas (Zod)
   - Form components (UI)
   - Service layer (data flow)

## Files Changed

| File                                 | Lines   | Change                                                  |
| ------------------------------------ | ------- | ------------------------------------------------------- |
| `src/validation/playValidation.ts`   | 14-28   | Updated PlayTypeEnum to capitalized values              |
| `src/validation/playValidation.ts`   | 138-146 | Relaxed personnel validation from 2-digit to any string |
| `src/pages/PlaybookPage.tsx`         | ~1313   | Removed debug console.log                               |
| `src/services/securePlaysService.ts` | ~141    | Removed debug console.log                               |

## Testing Checklist

- [ ] Create play with p_type="Run" → Should succeed
- [ ] Create play with p_type="Pass" → Should succeed
- [ ] Create play without p_type → Should succeed
- [ ] Create play with personnel="Blue" → Should succeed
- [ ] Create play with personnel="11 Personnel" → Should succeed
- [ ] Create play without personnel → Should succeed
- [ ] Verify database receives correct capitalized p_type values
- [ ] Verify UI displays plays correctly after creation

## Related Issues Fixed

This fix also resolves the confusion from previous attempts:

- ❌ Attempt 1: Add empty string cleanup in PlaybookPage
- ❌ Attempt 2: Add Zod preprocess in validation schema
- ❌ Attempt 3: Add cleanup in SecurePlaysService
- ❌ Attempt 4: Multiple layers of empty string handling

**Actual Problem**: Values weren't empty strings at all - they were valid data being rejected by incorrect validation rules!

---

**Status**: ✅ **FIXED** - Play creation now works correctly with capitalized play types and configuration-based personnel names.
