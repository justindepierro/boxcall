# CSV Import Validation Guide

## Overview

BoxCall's CSV import includes **smart validation** that checks your data and helps you fix issues **before importing**. No more failed imports or duplicate data!

## How It Works

### Step 1: Upload CSV

- Drag & drop or browse to select your CSV file
- BoxCall immediately validates all rows
- You'll see a preview with validation status

### Step 2: Review Validation Results

The preview shows:

- ✅ **Green checkmark**: Valid, ready to import
- ⚠️ **Yellow warning**: Has warnings, but can still import
- ❌ **Red X**: Has errors, needs fixing before import

### Step 3: Fix Issues Inline

Click the **expand button** (►) next to any row to see:

- Detailed validation for each field
- Fuzzy match suggestions for similar values
- Auto-correction options
- Inline editing to fix problems

## Validation Types

### 1. Formation Validation

**Checks:**

- Does formation exist in your playbook?
- Is the spelling similar to existing formations?
- Is the name too short or generic?

**Example:**

```
❌ "Twns" → Did you mean: "Twins" (85% match), "Trips" (60% match)
⚠️ "SHOTGUN" → Auto-normalize to "Shotgun" (click to apply)
✅ "Twins" → Valid existing formation
```

**Actions:**

- Click suggested formation to apply
- Click edit button to type custom value
- Click "Apply" on auto-correction

### 2. Play Name Validation

**Checks:**

- Does play name already exist? (prevents duplicates)
- Is spelling similar to existing plays?
- Is the name descriptive enough?

**Example:**

```
⚠️ "Power" → Warning: Play already exists in playbook
❌ "Pwr" → Did you mean: "Power" (70% match), "Power Read" (65% match)
✅ "Power Iso" → Valid unique play name
```

**Actions:**

- Review duplicate warnings
- Choose similar play name if updating existing
- Edit to make unique if creating new play

### 3. Personnel Validation

**Checks:**

- Is format valid? (11, 12, 21, 22, 10, etc.)
- Does it match standard personnel groupings?

**Example:**

```
❌ "111" → Error: Invalid format. Did you mean "11" (1RB, 1TE)?
❌ "1 RB 1 TE" → Error: Use format "11" instead
✅ "11" → Valid (1 Running Back, 1 Tight End)
✅ "12" → Valid (1 Running Back, 2 Tight Ends)
```

**Personnel Legend:**

- **11** = 1 RB, 1 TE (4 WR)
- **12** = 1 RB, 2 TE (3 WR)
- **21** = 2 RB, 1 TE (2 WR)
- **22** = 2 RB, 2 TE (1 WR)
- **10** = 1 TE only (5 WR)
- **01** = 1 RB only (4 WR)

### 4. Play Type Validation

**Checks:**

- Is play type one of: Pass, Run, RPO, Screen, Play Action, Option?
- Auto-corrects common variations

**Example:**

```
🔧 "pass" → Auto-correct to "Pass"
🔧 "rushing" → Auto-correct to "Run"
🔧 "run-pass-option" → Auto-correct to "RPO"
✅ "Pass" → Valid
```

## Smart Features

### Fuzzy Matching

BoxCall uses **similarity scoring** to find matches:

- **85-100%**: Very similar, high confidence suggestion
- **60-84%**: Similar, moderate confidence
- **<60%**: Not shown (too different)

**Example Suggestions:**

```
Input: "Twns"
Suggestions:
- Twins (85% match) ← Click to apply
- Trips (60% match)
- Twins Right (58% match) ← Not shown (too low)
```

### Auto-Correction

BoxCall suggests normalization for:

- **Case**: "SHOTGUN" → "Shotgun"
- **Spacing**: "I Formation" → "I-Formation"
- **Abbreviations**: "rpo" → "RPO", "pa" → "Play Action"
- **Plurals**: "Twin" → "Twins"

Click **"Apply"** to accept the suggestion.

### Batch Operations

At the bottom of the preview:

- **Import X Valid Plays**: Only imports rows that pass validation
- **Fix All**: (Coming soon) Auto-apply all suggestions
- **Skip Errors**: (Coming soon) Import valid rows, skip errors

## Common Scenarios

### Scenario 1: Typo in Formation

**Problem:**

```csv
formation,play_name,p_type
Twns,QB Shirt,RPO
```

**Validation:**

```
❌ Row 2: Formation "Twns" not recognized
💡 Did you mean:
- Twins (85% match) ← Click here
- Trips (60% match)
```

**Solution:**

1. Click "Twins" suggestion
2. Value updates to "Twins"
3. Row becomes valid ✅
4. Continue to import

### Scenario 2: Duplicate Play Name

**Problem:**

```csv
formation,play_name,p_type
Twins,Power,Run    ← Already exists
```

**Validation:**

```
⚠️ Row 2: Play "Power" already exists
Options:
1. Update existing play (replaces current data)
2. Rename to make unique (e.g., "Power Iso")
3. Skip this row
```

**Solution:**

1. Click edit button
2. Change to "Power Iso"
3. Save
4. Row becomes unique ✅

### Scenario 3: Wrong Personnel Format

**Problem:**

```csv
formation,play_name,p_type,personnel
Twins,QB Shirt,RPO,1 RB 1 TE
```

**Validation:**

```
❌ Row 2: Invalid personnel format
💡 Use format "11" for 1RB 1TE
Auto-correction available: "11" ← Click to apply
```

**Solution:**

1. Click "Apply" on auto-correction
2. Value updates to "11"
3. Row becomes valid ✅

### Scenario 4: Mixed Case

**Problem:**

```csv
formation,play_name,p_type
SHOTGUN,four verts,PASS
```

**Validation:**

```
🔧 Row 2: Auto-normalization available
- formation: "SHOTGUN" → "Shotgun"
- play_name: "four verts" → "Four Verts"
- p_type: "PASS" → "Pass"
Click "Apply All" to normalize
```

**Solution:**

1. Click "Apply All"
2. All fields normalized
3. Row becomes standard format ✅

## Tips for Clean Imports

### 1. Use the Template

Download the Excel-friendly template:

- Descriptive headers with examples
- Help text explaining each field
- Example rows to copy

### 2. Check Existing Data First

Before importing:

1. Export your current playbook
2. Review existing formations, play names
3. Use same naming conventions
4. Avoid duplicates

### 3. Fix in Excel First

For large imports:

1. Use Excel's spell check
2. Apply consistent case (Title Case)
3. Standardize abbreviations
4. Remove duplicate rows

### 4. Import in Batches

For 100+ plays:

1. Split into smaller CSV files (25-50 plays)
2. Import and validate each batch
3. Fix errors between batches
4. Less overwhelming than fixing 100 errors at once

### 5. Review Before Import

Always:

- ✅ Check validation summary (X valid, Y warnings, Z errors)
- ✅ Expand rows with warnings/errors
- ✅ Fix critical errors (red X)
- ✅ Review warnings (yellow ⚠️) - can import but may cause issues
- ✅ Verify duplicate play handling

## Validation Summary

**At the top of preview:**

```
┌─────────────────────────────────────┐
│ Import Summary                      │
├─────────────────────────────────────┤
│ ✅ 23 Valid Plays                   │
│ ⚠️ 5 Warnings (can import)          │
│ ❌ 2 Errors (must fix)              │
│                                     │
│ [Fix Errors] [Import 23 Valid]     │
└─────────────────────────────────────┘
```

**Only valid plays will be imported.** Rows with errors are skipped.

## Need Help?

**Common Questions:**

**Q: Can I import plays with warnings?**  
A: Yes! Warnings are suggestions, not blockers. Fix if you want consistent data.

**Q: What happens to rows with errors?**  
A: They're skipped during import. Fix them and re-upload, or import the valid ones first.

**Q: Can I edit multiple fields at once?**  
A: Yes! Expand the row and edit any field. Changes are saved immediately.

**Q: How do I know what format to use?**  
A: Check the help text in the template, or look at the auto-correction suggestions.

**Q: Can I undo changes?**  
A: Not yet - but you can click "Back" and re-upload the original CSV.

## Technical Details

**Validation Engine:**

- Uses Levenshtein distance for fuzzy matching
- Confidence scores based on edit distance
- Real-time validation as you edit
- Integrates with existing dataValidation.ts

**Performance:**

- Validates up to 1000 rows
- <1 second preview generation
- Instant fuzzy matching
- No server round-trip for validation

**Data Privacy:**

- Validation happens in browser
- No data sent to external services
- Only uploads after you click "Import"
