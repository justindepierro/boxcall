# Practice Script PDF Redesign - October 18, 2025

## Overview

Enhanced the PDF export to match the visual richness of the playbook card view, making it easier to read and more professional. Now uses the exact same play name formatting logic as the web interface.

## Problem

The previous PDF export showed a basic list with all information condensed into a single "Game Scenario" line. It didn't visually match the rich playbook card layout and made it hard to quickly scan defensive settings and play details.

**Before:**

```
1. Cross
Formation: Twins L
Pass • Blue • R
🎯 Game Scenario: Hash: middle • Down: 1st & 10 • Front: base • Coverage: cover 2
💡 Coaching Points: ...
```

## Solution

Redesigned the PDF layout to match playbook cards with:

### 1. **Prominent Formation Display**

- Large, bold formation name in its own section
- Navy blue background with border
- Formation direction included
- Easy to spot at a glance

```tsx
<View
  style={{
    padding: 10,
    backgroundColor: colorTokens.navy[50],
    borderWidth: 1,
    borderColor: colorTokens.navy[200],
  }}
>
  <Text style={{ fontSize: 10, fontWeight: "bold" }}>FORMATION</Text>
  <Text style={{ fontSize: 16, fontWeight: "bold" }}>Twins L</Text>
</View>
```

### 2. **Offensive Details Section**

- Dedicated blue box for offensive information
- Play type, personnel, direction as separate badges
- Clear "OFFENSIVE DETAILS" header
- Consistent blue color scheme

### 3. **Defensive Look Section**

- Separate red box for defensive settings
- Front, Coverage, and Blitz displayed as individual badges
- Clear "DEFENSIVE LOOK" header
- Red color scheme to distinguish defense from offense
- Only shows if defensive settings exist

### 4. **Game Situation Section**

- Amber/yellow box for situational context
- Hash, down/distance, field position
- Separated from defensive look for clarity
- Only shows if situation details exist

### 5. **Enhanced Visual Hierarchy**

```
┌─────────────────────────────────────────┐
│ 1  Play Name              5 reps        │ ← Header (green badge + reps)
├─────────────────────────────────────────┤
│ FORMATION                               │
│ Twins L                                 │ ← Large, prominent (navy)
├─────────────────────────────────────────┤
│ OFFENSIVE DETAILS                       │
│ [Pass] [Personnel: 11] [Direction: R]  │ ← Blue badges
├─────────────────────────────────────────┤
│ DEFENSIVE LOOK                          │
│ [Front: base] [Coverage: cover 2]      │ ← Red badges
├─────────────────────────────────────────┤
│ 🎯 GAME SITUATION                       │
│ Hash: middle • 1st & 10 • Own 25       │ ← Amber box
├─────────────────────────────────────────┤
│ 💡 Coaching Points: ...                 │ ← Green left border
└─────────────────────────────────────────┘
```

## Color Coding

- **Green** (Jade): Play number badge, reps, coaching points
- **Navy Blue**: Formation section
- **Blue**: Offensive details
- **Red**: Defensive look
- **Amber**: Game situation
- **White/Gray**: Play name, general text

## Play Name Formatting ✨

**Critical Enhancement**: Now uses the **exact same** `getDisplayName()` function from `playNameUtils.ts` that the playbook uses!

### Before (Manual formatting):

```tsx
{
  scriptPlay.play?.play_name || "Unknown Play";
}
```

This only showed the raw `play_name` field, missing all the formation details and concatenation logic.

### After (Using playbook utils):

```tsx
import { getDisplayName } from "../../utils/playNameUtils";

{
  scriptPlay.play ? getDisplayName(scriptPlay.play, false) : "Unknown Play";
}
```

This generates the **complete play name** using the same logic as the web interface:

- Formation + direction (e.g., "Twins L")
- Formation tags (ftag1, ftag2)
- Play name + direction
- All the special handling for River/Lake formations
- Proper capitalization and spacing

**Result**: The PDF now shows "**Twins Lt Far Cross Rt**" instead of just "**Cross**" - exactly like the playbook!

## Key Improvements

### Visual Separation

Each type of information has its own section:

1. Header (play number + name + reps)
2. Formation (large and prominent)
3. Offensive details (type, personnel, direction)
4. Defensive look (front, coverage, blitz)
5. Game situation (hash, down, field position)
6. Coaching points

### Better Scannability

- Coaches can quickly find formation at a glance
- Defensive settings clearly separated from offensive
- Color coding helps distinguish sections
- Larger text for formation (16pt vs 9-12pt for other text)

### Conditional Display

- Defensive section only shows if defensive settings exist
- Game situation only shows if situation details exist
- No empty boxes cluttering the layout

### Professional Appearance

- Consistent padding and spacing
- Rounded corners on all boxes
- Border accents (navy border on formation, red on defense)
- Left border accent on game situation (amber)
- Proper badge styling with borders

## Technical Details

### New Layout Structure

```tsx
<View style={styles.playItem} wrap={false}>
  {/* Header */}
  <View style={styles.playHeader}>...</View>

  {/* Formation - NEW */}
  <View style={{ backgroundColor: navy[50], border: navy[200] }}>
    <Text>FORMATION</Text>
    <Text style={{ fontSize: 16 }}>Twins L</Text>
  </View>

  {/* Offensive Details - NEW */}
  <View style={{ backgroundColor: blue[50] }}>
    <Text>OFFENSIVE DETAILS</Text>
    <View>{/* Badge components */}</View>
  </View>

  {/* Defensive Look - NEW */}
  {(defensiveFront || coverage || blitz) && (
    <View style={{ backgroundColor: red[50], border: red[200] }}>
      <Text>DEFENSIVE LOOK</Text>
      <View>{/* Badge components */}</View>
    </View>
  )}

  {/* Game Situation - ENHANCED */}
  {(hash || downDistance || fieldPosition) && (
    <View style={{ backgroundColor: amber[50], leftBorder: amber[500] }}>
      <Text>🎯 GAME SITUATION</Text>
      <Text>Hash: middle • 1st & 10 • Own 25</Text>
    </View>
  )}

  {/* Coaching Points */}
  {notes && <View>...</View>}
</View>
```

### Badge Styling

All badges now have:

- Background color (lighter shade)
- Border (darker shade)
- Padding (8px horizontal, 4px vertical)
- Border radius (4px)
- Bold text

### Size Changes

- Play number badge: 24px → 28px
- Formation text: 9pt → 16pt
- Section headers: 9pt bold uppercase
- Badge text: 9pt bold

## Testing Checklist

- [ ] PDF generates without errors
- [ ] Formation displays prominently
- [ ] Offensive details show all badges
- [ ] Defensive look only shows when present
- [ ] Game situation only shows when present
- [ ] All defensive settings visible (front, coverage, blitz)
- [ ] Custom defensive settings display correctly
- [ ] Coaching points still visible with green border
- [ ] Colors match design system (navy, blue, red, amber, jade)
- [ ] Text is readable at print size
- [ ] Page breaks don't split play cards

## Files Modified

### `/src/components/pdf/PracticeScriptPDF.tsx` (403 lines)

- Enlarged play number badge (24px → 28px)
- Created dedicated Formation section with navy background
- Separated Offensive Details into blue section
- Created Defensive Look section in red (conditional)
- Enhanced Game Situation section in amber (conditional)
- Added section headers ("FORMATION", "OFFENSIVE DETAILS", etc.)
- Improved badge styling with borders and better padding
- Better spacing between sections

## Future Enhancements

1. **Formation Diagrams**: Add visual play diagrams if available
2. **Page Layout Options**: Multiple plays per page for compact printing
3. **Custom Branding**: Team logo, colors in header
4. **Statistics**: Add success rate, yards per play if available
5. **Tags Display**: Show script tags (e.g., "Red Zone", "Two-Minute")
6. **Player Highlights**: Bold key player names in notes
7. **Export Options**: Letter vs A4 size selection

## Impact

- ✅ **Clarity**: Each section clearly labeled and color-coded
- ✅ **Scannability**: Coaches can find formation instantly
- ✅ **Completeness**: All defensive settings prominently displayed
- ✅ **Professional**: Matches modern playbook card design
- ✅ **Printability**: Clear hierarchy for printed copies
- ✅ **Consistency**: Same visual language as web interface

---

**Status**: ✅ Complete and ready for testing
**Date**: October 18, 2025
**Related**: PRACTICE_SCRIPT_ENHANCEMENTS_OCT18.md
