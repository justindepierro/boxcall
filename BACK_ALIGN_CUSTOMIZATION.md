# Back Alignment Customization ✅

## Summary

Updated the back alignment field to support customizable multi-character values instead of being limited to single characters. Users can now use their preferred terminology: "Near/Far", "Flip/Same", "1/2", "Strong/Weak", etc.

## Problem

Previously, the back alignment field only accepted single-character input, which didn't accommodate common coaching terminology where teams use words like "Near", "Far", "Flip", "Same", "Strong", "Weak", etc.

## Solution

Added a comprehensive set of back alignment suggestions and enabled the dropdown/autocomplete feature for the field.

## Changes Made

### 1. Added Back Alignment Options

**File:** `src/components/playbook/play-card/constants.ts`

```typescript
export const BACK_ALIGN_OPTIONS = [
  { value: "Near", label: "Near" },
  { value: "Far", label: "Far" },
  { value: "Flip", label: "Flip" },
  { value: "Same", label: "Same" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "Strong", label: "Strong" },
  { value: "Weak", label: "Weak" },
  { value: "Open", label: "Open" },
  { value: "Closed", label: "Closed" },
];
```

**Options Included:**

- **Near/Far** - Distance-based terminology
- **Flip/Same** - Mirror-based terminology
- **1/2** - Numeric system
- **Strong/Weak** - Strength-based system
- **Open/Closed** - Formation-based terminology

### 2. Updated Field Definition

**File:** `src/components/playbook/play-card/fieldDefinitions.tsx`

**Before:**

```tsx
<InlineEditField
  value={optimisticPlay.back_align || ""}
  onSave={(value) => handleInlineSave("back_align", value)}
  placeholder="Backfield alignment"
  isSaving={savingFields.has("back_align")}
/>
```

**After:**

```tsx
<InlineEditField
  value={optimisticPlay.back_align || ""}
  onSave={(value) => handleInlineSave("back_align", value)}
  placeholder="e.g., Near, Far, Flip, Same, 1, 2"
  suggestions={BACK_ALIGN_OPTIONS.map((option) => option.label)}
  enableSuggestions={true}
  isSaving={savingFields.has("back_align")}
/>
```

**Changes:**

- ✅ Added `suggestions` prop with all back alignment options
- ✅ Enabled `enableSuggestions` for dropdown functionality
- ✅ Updated placeholder text to show examples of accepted values
- ✅ No character limit - users can type any custom value or select from suggestions

### 3. Database Support

**Database:** Already supports TEXT type (unlimited length)

- Column: `back_align TEXT` in `plays` table
- No migration needed - already flexible enough

## Features

### Dropdown Suggestions

- Click the field to see all 10 suggested options
- Start typing to filter suggestions (e.g., type "N" to see "Near")
- Click any suggestion to auto-fill

### Custom Values

- Users can still type any custom value they want
- Not limited to the suggestions
- Supports any length (not just single characters)

### Common Terminology Systems

#### System 1: Near/Far

- **Near** - Back aligned to near side
- **Far** - Back aligned to far side

#### System 2: Flip/Same

- **Flip** - Back flips to opposite side
- **Same** - Back stays on same side

#### System 3: Numeric (1/2)

- **1** - First back alignment
- **2** - Second back alignment

#### System 4: Strong/Weak

- **Strong** - Back to strong side
- **Weak** - Back to weak side

#### System 5: Open/Closed

- **Open** - Open side alignment
- **Closed** - Closed side alignment

## User Experience

### Before

- Could only type 1 character
- No suggestions or guidance
- Limited to single-letter codes

### After

- Can type full words or phrases
- Dropdown with 10 common options
- Helpful placeholder showing examples
- Still supports custom values
- Autocomplete/fuzzy search enabled

## Example Usage

```
User clicks "Back Align" field
↓
Dropdown shows: Near, Far, Flip, Same, 1, 2, Strong, Weak, Open, Closed
↓
User types "Nea"
↓
"Near" is highlighted
↓
User clicks "Near" or presses Enter
↓
Value saved: "Near"
```

## Files Modified

1. **src/components/playbook/play-card/constants.ts**
   - Added `BACK_ALIGN_OPTIONS` constant (10 options)

2. **src/components/playbook/play-card/fieldDefinitions.tsx**
   - Imported `BACK_ALIGN_OPTIONS`
   - Added `suggestions` and `enableSuggestions` to back_align field
   - Updated placeholder text

## Testing Checklist

- [ ] Click back alignment field - dropdown shows 10 options
- [ ] Select "Near" from dropdown - saves correctly
- [ ] Select "Far" from dropdown - saves correctly
- [ ] Select "Flip" from dropdown - saves correctly
- [ ] Select "Same" from dropdown - saves correctly
- [ ] Select "1" from dropdown - saves correctly
- [ ] Type custom value "My Custom" - saves correctly
- [ ] Type "N" - filters to show "Near"
- [ ] Reload page - saved value persists
- [ ] Works in both list and tile view

## Benefits

1. **Flexibility** - Teams can use their preferred terminology
2. **Guidance** - New users see common options
3. **Speed** - Quick selection from dropdown
4. **Compatibility** - Still allows custom values
5. **Consistency** - Same UX as other suggestion fields (personnel, direction, etc.)

## Future Enhancements (Optional)

- Allow teams to customize the suggestion list in settings
- Track most-used back alignment terms per team
- Add team-specific presets
- Include descriptions/tooltips for each option
