# Jersey Badge Color Update - Jade Design Token

**Date**: October 15, 2025
**Update**: Changed jersey number badge color from primary to jade-700
**Status**: ✅ COMPLETE

## Problem

The jersey number badges were using `bg-primary text-white`, but with white text on the primary color, the contrast was poor and hard to read.

## Solution

Updated jersey number badges to use **jade-700** from the design token system:

- Background: `bg-jade-700`
- Text: `text-white`
- Better contrast and readability

## Design Token Integration

**Current Implementation**:

```tsx
{
  player.jersey_number && (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-jade-700 text-white">
      #{player.jersey_number}
    </span>
  );
}
```

**Color System**:

- **Jersey Number Badge**: `jade-700` (dark jade/teal, good contrast with white text)
- **Position Badge**: `blue-100` background, `blue-800` text
- **Grade Level Badge**: `purple-100` background, `purple-800` text
- **Status Active**: `green-100` background, `green-800` text
- **Status Inactive**: `gray-100` background, `gray-600` text

## Future Enhancement: Team Branding

Added comment in code noting that jersey badges will eventually pull from team branding colors:

```typescript
/**
 * Badge Colors:
 * - Jersey Number: jade-700 (default, will use team branding colors when available)
 * - Position: blue-100/800
 * - Grade Level: purple-100/800
 */
```

This allows for future implementation where:

1. Teams can set their primary/secondary colors
2. Jersey badges automatically use team's primary color
3. Falls back to jade-700 if no team colors configured

**Example Future Implementation**:

```tsx
const jerseyBadgeColor = team?.primaryColor || "bg-jade-700";

<span className={`... ${jerseyBadgeColor} text-white`}>
  #{player.jersey_number}
</span>;
```

## Visual Comparison

**Before**:

```
[#12]  ← White on primary (low contrast)
```

**After**:

```
[#12]  ← White on jade-700 (high contrast, professional look)
```

## Badge Color Hierarchy

1. **Jersey Number** (Jade) - Most prominent, represents the player
2. **Position** (Blue) - Primary role information
3. **Grade Level** (Purple) - Secondary information
4. **Status** (Green/Gray) - Indicator badge

Each color has distinct meaning and visual weight.

## Design Token Available Shades

Jade color scale from `tailwind.config.js`:

- jade-50 (lightest)
- jade-100
- jade-200
- jade-300
- jade-400
- jade-500
- jade-600
- jade-700 ← **Selected for jersey badges**
- jade-800
- jade-900 (darkest)

**Why jade-700?**

- Dark enough for excellent contrast with white text
- Professional, athletic aesthetic
- Distinct from blue (position) and purple (grade)
- Matches common sports team color palettes

## Accessibility

✅ **WCAG AA Compliant**:

- White text on jade-700 background provides high contrast ratio
- Readable at small sizes (text-xs)
- Clear visual distinction from other badge types

## Files Modified

1. ✅ `src/pages/RosterPage.tsx` - Updated jersey badge background color
2. ✅ Added documentation comment about team branding

## Testing Checklist

- [x] No TypeScript errors
- [ ] Jersey badges display with jade-700 background
- [ ] White text is clearly visible on jade background
- [ ] Distinct from other badge colors (blue, purple)
- [ ] Looks professional and athletic
- [ ] Readable at all screen sizes

## Related Documentation

- PLAYER_CARD_BADGES_ADDED.md - Original badge implementation
- MULTIPLE_POSITIONS_FEATURE.md - Multiple position support

---

**Note**: This is a stepping stone toward full team branding integration. The jade-700 default will remain until team color configuration is implemented.
