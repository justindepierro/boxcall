# Visual QA Checklist - Post Token Migration

**Date**: January 29, 2025  
**Purpose**: Verify design token fixes render correctly in browser  
**Status**: 🟡 READY FOR USER TESTING

## Critical Fix Applied

✅ **Runtime Injection Fixed**: `useColorTheme.ts` now uses `--color-*` prefix instead of `--semantic-*`

This single fix unlocks all previous CSS improvements (350+ replacements across codebase).

## Testing Steps

### 1. Hard Refresh Browser

**CRITICAL**: Must clear cached styles

- **Mac**: `Cmd + Shift + R`
- **Windows**: `Ctrl + Shift + R`

### 2. Dashboard Page (`/dashboard`)

#### Background Colors

- [ ] Main container: Light gray `#f8fafc` (not black)
- [ ] Cards: White `#ffffff` with visible shadows
- [ ] No color flashing or FOUC (Flash of Unstyled Content)

#### Stat Cards (Top Row)

- [ ] **Jade Card** (User Profile):
  - Gradient icon background: Light jade `#f0fdf7` to jade `#d1fae5`
  - Badge: Vibrant jade `#00A86B` background
  - Number badge: White text on jade-500
- [ ] **Orange Card** (Team Activity):
  - Gradient icon background: Light orange to peachy orange
  - Badge: Vibrant orange `#FF6B35` background
  - "3 new posts" text: Orange-600
- [ ] **Purple Card** (Playbook):
  - Gradient icon background: Light purple to lavender
  - Badge: Vibrant purple `#8B5CF6` background
  - Play count number: Purple-600

#### Card Shadows

- [ ] Default cards: Medium shadow (visible but subtle)
- [ ] Hover state: Deeper shadow (transforms on mouse over)
- [ ] No flat/borderless appearance

#### Text Readability

- [ ] Primary text: Navy `#334155` (dark, high contrast)
- [ ] Secondary text: Gray `#64748b` (readable, not too light)
- [ ] No white-on-white or invisible text

#### Quick Actions (4 Buttons)

- [ ] Buttons have `bg-secondary` light gray background
- [ ] Icons visible with proper colors
- [ ] Hover state: Slightly darker gray

#### Getting Started Card

- [ ] White background
- [ ] Checkmarks: Green for complete, gray for incomplete
- [ ] Progress bar: Jade-500 fill

### 3. Roster Page (`/roster`)

#### Badge Colors

- [ ] Jersey numbers: Jade-500 background `#00A86B`
- [ ] Position badges: Blue info background
- [ ] Grade level: Gray muted background
- [ ] Active status: Green achievement background

#### Icon Colors

- [ ] Primary icons: Jade-500
- [ ] Success icons: Green-500
- [ ] Selected checkmarks: Jade-500

#### Hover States

- [ ] Jersey badges darken on hover (jade-600)
- [ ] Filter chips have hover background change

### 4. Breadcrumb Navigation (Any Page)

#### Text Colors

- [ ] Current page: Navy `#334155` (primary)
- [ ] Clickable links: Gray `#64748b` (secondary)
- [ ] Hover state: Navy (primary)
- [ ] Separators: Gray (secondary)

### 5. Global Elements

#### Typography

- [ ] Headings: Dark navy, high contrast
- [ ] Body text: Navy, readable on white
- [ ] Muted text: Gray, still readable

#### Interactive States

- [ ] Buttons: White text on jade/orange/purple backgrounds
- [ ] Hover: Darker shade of base color
- [ ] Focus rings: Visible on keyboard navigation

## Expected Results

### ✅ Pass Criteria

- All gradients render correctly (no plain backgrounds)
- Badges use vibrant brand colors (jade-500, orange-500, purple-500)
- Text has high contrast (navy on white)
- Shadows add depth to cards
- No inline `style="--semantic-*"` in DevTools

### ❌ Fail Criteria

- Gradients missing (plain white/gray backgrounds)
- Colors look washed out or too light
- Black background on Dashboard
- White-on-white or invisible text
- DevTools show `--semantic-*` in inline styles

## DevTools Verification

### Check Computed Styles

1. Right-click Dashboard container → Inspect
2. Open "Computed" tab
3. Search for `background-color`
4. **Expected**: `rgb(248, 250, 252)` or `#f8fafc`
5. **NOT**: `rgb(0, 0, 0)` or black values

### Check CSS Variables

1. Inspect `<html>` element
2. Look at "Styles" → `element.style`
3. **Expected**: `--color-jade-500: #00A86B` (or similar `--color-*` variables)
4. **NOT**: `--semantic-primary: #00A86B` (old naming)

### Check Tailwind Classes

1. Inspect gradient icon container
2. Look for classes: `from-jade-50`, `to-jade-100`
3. **Expected**: Both classes present in class list
4. **Expected**: Computed gradient visible in Computed styles

## Debugging Common Issues

### Issue: Gradients Still Not Showing

**Possible Causes**:

1. Browser cache not cleared → Hard refresh (`Cmd+Shift+R`)
2. Tailwind not generating gradient utilities → Check `tailwind.config.js` safelist
3. CSS variables not resolving → Verify `design-tokens-unified.css` loaded

**Fix**:

```bash
# Restart dev server
npm run dev

# Clear browser cache completely (DevTools → Application → Clear Storage)
```

### Issue: Colors Look Washed Out

**Possible Causes**:

1. Wrong color scale used (e.g., jade-100 instead of jade-500)
2. Opacity applied unintentionally (e.g., `bg-jade-500/50`)

**Fix**: Check component code for correct color scale numbers

### Issue: Text Invisible or Low Contrast

**Possible Causes**:

1. Text color matches background color
2. Wrong semantic token used (e.g., `text-secondary` on `bg-secondary`)

**Fix**: Verify text-primary on light backgrounds, text-white on dark backgrounds

## Success Screenshot Comparison

### Before Fix

- Black background
- No gradients visible
- Washed out colors
- Low contrast text

### After Fix (Expected)

- White/light gray backgrounds
- Vibrant jade/orange/purple gradients on icon containers
- High contrast navy text
- Clear shadows on cards
- Professional, polished appearance

## Next Steps After Verification

### If Tests Pass ✅

1. Document visual patterns for other pages
2. Apply same gradient/badge patterns to:
   - Playbook page
   - Team Bulletin
   - Game Plans
3. Build `/style-guide` reference page

### If Tests Fail ❌

1. Share screenshot of what you see
2. Provide DevTools "Computed" tab for affected element
3. Check browser console for errors
4. Verify dev server shows HMR updates without errors

## Notes

- **Hard refresh is mandatory** - Vite caches aggressively
- **Check mobile view** - Responsive design should maintain colors/shadows
- **Test theme switching** - If teams have custom colors, verify they still work
- **Check dark mode** - If implemented, ensure it uses correct tokens

---

**Ready for testing!** Please hard refresh and check Dashboard page first. 🚀
