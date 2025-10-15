# Play Field 1-Character Limit Investigation - October 14, 2025

## Issue Report

**User**: "It's the play fields of the play editor in the play list and grid."

**Context**: When editing play fields inline in the PlayCard (list/grid view), fields only accept 1 character.

## Investigation Findings

### ✅ No maxLength Props Found

Checked all field definitions in `fieldDefinitions.tsx`:

- ❌ No `maxLength` props on any InlineEditField components
- ❌ No `maxLength` props on InlineSelectField components
- All fields should accept unlimited input (database is TEXT type)

### ✅ Component Code is Correct

**InlineEditField.tsx**:

- ✅ Accepts `maxLength` prop (optional, defaults to undefined)
- ✅ Passes maxLength to HTML input: `maxLength={maxLength}`
- ✅ No hardcoded restrictions

### ✅ Validation Fixed for Updates

**Fixed in**: `src/validation/playValidation.ts` (PlayUpdateSchema)

- ✅ `personnel` field now allows up to 50 characters (was 20 with 2-digit regex)
- ✅ All other fields have reasonable limits (50-100 characters)

## Possible Causes Still to Investigate

### 1. Browser/React State Issue

- **Symptom**: React state update not processing multi-character input
- **Debug**: Check browser console for errors
- **Test**: Try in different browser

### 2. Event Handler Issue

- **Symptom**: `onChange` handler limiting input somehow
- **Debug**: Add console.log to see what values are being set
- **File**: `InlineEditField.tsx` line 203 (`handleInputChange`)

### 3. Validation Error Blocking Input

- **Symptom**: Validation runs on every keystroke and rejects input
- **Debug**: Check for validation errors in console
- **Check**: If error messages appear briefly

### 4. CSS/Display Issue

- **Symptom**: Characters ARE being saved but not displayed
- **Debug**: Check if database has full values
- **Test**: Refresh page after typing 1 character

### 5. Input Focus/Blur Issue

- **Symptom**: Input loses focus after 1 character
- **Debug**: Check if field exits edit mode after keystroke
- **Check**: Does the field stay in "edit" mode?

## Debug Steps Needed

**User Actions**:

1. **Hard Refresh Browser**
   - Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
   - Clear cached JavaScript

2. **Open Browser Console** (F12 or Cmd+Option+I)
   - Clear console
   - Try editing a field

3. **Test Specific Field** (e.g., "Protection"):
   - Click to edit
   - Type "P" → Does it appear?
   - Type "r" → What happens?
     - [ ] "r" appears, now shows "Pr"
     - [ ] "r" replaces "P", now shows "r"
     - [ ] Nothing happens, stays "P"
     - [ ] Field exits edit mode
   - Type "o" → What happens?

4. **Check Console Logs**:
   - Look for `[InlineEditField]` logs
   - Look for validation errors
   - Copy/paste any errors you see

5. **Test Different Field Types**:
   - **Text fields**: Protection, Shift, Motion
   - **Dropdowns**: Direction (f_dir), Pass Direction (p_dir)
   - Does it affect ALL fields or only some?

6. **Check Database**:
   - After typing 1 character and "saving"
   - Refresh page
   - Does the 1 character persist?
   - Or is nothing saved at all?

## Expected Behavior After Fixes

**What SHOULD happen**:

1. Click field → Enters edit mode (input box with border)
2. Type multiple characters → All appear in input
3. Press Enter or click away → Saves to database
4. Field shows saved value (not truncated)

## Next Steps

**IF** after browser refresh it still only accepts 1 character:

- Need console logs to see what's happening
- Need to know if it's ALL fields or specific ones
- Need to know if values are being saved at all

**Possible Emergency Fix**:
If we can't find the root cause, we could:

1. Add explicit `maxLength={undefined}` to all field definitions
2. Add override in InlineEditField to ignore maxLength={1}
3. Force input to allow unlimited characters

---

**Status**: ⏳ **AWAITING USER TEST**

**Actions**:

1. ✅ Fixed `personnel` validation in PlayUpdateSchema
2. ⏳ User needs to refresh browser and test
3. ⏳ User needs to report exact behavior
4. ⏳ User needs to share console logs if issue persists
