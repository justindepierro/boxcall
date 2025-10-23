# Quick Start: Design System v2.0 Cleanup

**Ready to start?** Here are the immediate next steps to achieve 100% token coverage.

---

## 🎯 IMMEDIATE ACTIONS (Today)

### Quick Win #1: AppIconTile Padding (5 minutes)

**File**: `src/components/ui/AppIconTile.tsx`

**Current:**

```tsx
<div style={{ padding: "8px" }}>
```

**Fix:**

```tsx
<div className="p-2">
```

**Why**: Using inline styles when Tailwind has `p-2` (8px).

---

### Quick Win #2: Tooltip Inline Styles (30 minutes)

**File**: `src/components/ui/Tooltip/Tooltip.tsx`

**Current:**

```tsx
padding: "8px 12px",
fontSize: "12px",
```

**Fix:**

```tsx
className = "py-2 px-3 text-xs";
```

**File**: `src/components/ui/Tooltip/SimpleTooltip.tsx`

**Current:**

```tsx
marginBottom: "8px",
padding: "8px 12px",
fontSize: "12px",
```

**Fix:**

```tsx
className = "mb-2 py-2 px-3 text-xs";
```

---

### Quick Win #3: CSS Token References (1 hour)

**File**: `src/styles/generated-tokens.css`

**Problem**: Semantic tokens duplicate hex values instead of referencing base tokens.

**Example Fix:**

```css
/* BEFORE - Duplicate hex values */
:root {
  --color-gray-200: #e5e7eb;
  --semantic-border: #e5e7eb; /* ❌ Duplicate! */
}

/* AFTER - Reference base tokens */
:root {
  --color-gray-200: #e5e7eb;
  --semantic-border: var(--color-gray-200); /* ✅ Reference! */
}
```

**Tokens to fix (~20 tokens):**

```css
/* Borders */
--semantic-border: var(--color-gray-200);

/* Links */
--semantic-link-color: var(--color-blue-600);
--semantic-link-hover-color: var(--color-blue-700);
--semantic-link-visited-color: var(--color-purple-600);

/* Highlights */
--semantic-highlight-color: var(--color-amber-400);
--semantic-selection-color: var(--color-cyan-400);
--semantic-selection-border: var(--color-amber-400);

/* Diagram */
--semantic-diagram-route-color: var(--color-emerald-500);
--semantic-diagram-annotation-color: var(--color-gray-900);
--semantic-diagram-guide-color: var(--color-green-500);
--semantic-diagram-grid-color: var(--color-gray-200);
--semantic-diagram-field-background: var(--color-gray-50);
--semantic-diagram-field-border: var(--color-emerald-700);
--semantic-diagram-minimap-border: var(--color-amber-400);
--semantic-diagram-minimap-background: var(--color-white);

/* Borders (dividers) */
--semantic-border-divider-color: var(--color-gray-50);
--semantic-border-divider-medium-color: var(--color-gray-100);
--semantic-border-divider-strong-color: var(--color-gray-200);
--semantic-border-card-color: var(--color-gray-100);
```

**Benefits:**

- Single source of truth for colors
- Easier to update color scales
- Better maintainability
- Reduces CSS file size (slightly)

---

### Quick Win #4: Animation CSS Variables (30 minutes)

**File**: `src/styles/animations.css`

**Current:**

```css
background: rgba(255, 255, 255, 0.9);
border-color: rgba(255, 255, 255, 0.3);
```

**Fix:**

First, add RGB variables to `generated-tokens.css`:

```css
:root {
  --color-white: #ffffff;
  --color-white-rgb: 255, 255, 255; /* Add RGB version */
}
```

Then update `animations.css`:

```css
background: rgb(var(--color-white-rgb) / 0.9);
border-color: rgb(var(--color-white-rgb) / 0.3);
```

**Benefits:**

- Tokens can be themed (light/dark)
- Consistent opacity values
- Easier to maintain

---

## 🛠️ EXECUTION PLAN

### Phase 1: Inline Styles (Day 1 - Morning, 2-3 hours)

**Steps:**

1. ✅ Fix AppIconTile padding (5 min)
2. ✅ Fix Tooltip inline styles (30 min)
3. ✅ Fix SimpleTooltip inline styles (30 min)
4. ✅ Audit remaining 115 inline styles (1 hour)
   - Categorize: Dynamic (keep) vs Static (fix)
   - Create list of files to update
5. ✅ Run type check: `npm run type-check`
6. ✅ Run lint: `npm run lint`
7. ✅ Test affected components in browser

**Commands:**

```bash
# Find all inline styles
grep -r "style={{" src/ --include="*.tsx" -A 2 -B 2 > /tmp/inline-styles.txt

# Review the file
code /tmp/inline-styles.txt
```

---

### Phase 2: CSS Token References (Day 1 - Afternoon, 1-2 hours)

**Steps:**

1. ✅ Open `src/styles/generated-tokens.css`
2. ✅ Find all semantic tokens with hex values
3. ✅ Replace with var() references to base tokens
4. ✅ Test in browser (check if styles still work)
5. ✅ Test dark mode compatibility
6. ✅ Run build: `npm run build`

**Script to help:**

```bash
# Find hex colors in generated-tokens.css that could use var()
grep -E "semantic.*: #[0-9a-f]{6}" src/styles/generated-tokens.css
```

---

### Phase 3: Animation CSS (Day 1 - Evening, 30 min)

**Steps:**

1. ✅ Add RGB variables to `generated-tokens.css`
2. ✅ Update `animations.css` rgba() values
3. ✅ Test animations in browser
4. ✅ Check ripple effects work
5. ✅ Check loading animations work

---

### Phase 4: Commit & Document (Day 1 - End, 15 min)

**Commit message:**

```
refactor(tokens): Eliminate inline styles and use CSS variable references

- Replace inline styles in Tooltip/SimpleTooltip with Tailwind classes
- Replace AppIconTile inline padding with p-2
- Update generated-tokens.css semantic tokens to reference base tokens
- Convert animations.css rgba() to CSS variables with opacity
- Result: Improved maintainability and consistency

Breaking Changes: None
```

---

## 📋 VALIDATION CHECKLIST

After each phase, verify:

### Functionality

- [ ] All tooltips still render correctly
- [ ] AppIconTile padding looks the same
- [ ] Animations play correctly
- [ ] No visual regressions

### Code Quality

- [ ] `npm run type-check` passes
- [ ] `npm run lint` shows 0 errors
- [ ] `npm run build` succeeds
- [ ] No console errors in browser

### Testing

- [ ] Light mode works
- [ ] Dark mode works
- [ ] Responsive breakpoints work
- [ ] Interactive elements work (hover, focus, active)

---

## 🚀 NEXT STEPS (Day 2+)

After completing Day 1 quick wins, you can choose:

### Option A: Continue Cleanup (Recommended)

**Day 2-3**: Audit remaining 115 inline styles

- Focus on static values (convert to classes)
- Document dynamic values (keep as-is with explanation)
- Create utility classes for complex patterns

### Option B: Build Layout Tokens

**Day 2-4**: Create systematic layout token system

- Define container width tokens
- Create grid/flex pattern library
- Standardize content area sizing

### Option C: Build Animation Tokens

**Day 2-3**: Create animation token system

- Define duration scale (instant → slower)
- Define easing functions (spring, bounce)
- Create transition presets

---

## 💡 PRO TIPS

### 1. Use Git Strategically

Create branches for each priority:

```bash
git checkout -b feat/cleanup-inline-styles
git checkout -b feat/css-token-references
git checkout -b feat/animation-css-variables
```

### 2. Test Incrementally

Don't wait until the end to test. After each file:

```bash
npm run type-check
npm run lint
# Open browser and check component
```

### 3. Document as You Go

Add comments to explain intentional patterns:

```tsx
// Inline style needed for dynamic ripple effect
<div style={{ width: `${size * 2}px` }}>
```

### 4. Create Codemods for Repetitive Changes

If you find the same pattern in 10+ files, write a script:

```bash
# Example: Replace padding: "8px" with p-2
find src/ -name "*.tsx" -exec sed -i '' 's/style={{ padding: "8px" }}/className="p-2"/g' {} \;
```

### 5. Take Before/After Screenshots

Document visual changes:

```bash
# Before fix
open http://localhost:5173/storybook/?path=/story/ui-tooltip--default

# After fix
# Take screenshot, compare
```

---

## 📊 EXPECTED IMPACT

### After Day 1:

- ✅ 5-10 inline styles eliminated
- ✅ 20+ CSS tokens using var() references
- ✅ 2-3 animation colors tokenized
- ✅ 1-2 hour time investment
- ✅ 0 breaking changes
- ✅ Improved maintainability

### After Week 1 (Full Priority 1):

- ✅ 121 inline styles audited
- ✅ 50+ static inline styles eliminated
- ✅ All CSS tokens using var() references
- ✅ All animation colors tokenized
- ✅ 8-10 hour time investment
- ✅ 100% CSS token coverage achieved
- ✅ Foundation for v2.0 features

---

## 🎯 SUCCESS METRICS

Track your progress:

```markdown
## Inline Styles Progress

- [x] AppIconTile (1/121)
- [x] Tooltip (2/121)
- [x] SimpleTooltip (3/121)
- [ ] Remaining static styles (0/50)
- [ ] Remaining dynamic styles (documented)

## CSS Token References

- [ ] Semantic borders (0/3)
- [ ] Semantic links (0/3)
- [ ] Semantic highlights (0/3)
- [ ] Diagram tokens (0/8)
- [ ] Border dividers (0/3)

## Animation CSS

- [ ] Background rgba (0/2)
- [ ] Border rgba (0/2)

Total Progress: 3/121 inline styles (2.5%)
```

---

## 🆘 TROUBLESHOOTING

### Issue: Inline style removal breaks layout

**Solution**: Component may rely on precise pixel values. Options:

1. Create Tailwind arbitrary value: `p-[8px]` (not ideal)
2. Add to tailwind.config.js spacing scale
3. Document as intentional inline style with comment

### Issue: CSS var() reference not working

**Solution**: Ensure base token is defined before semantic token:

```css
/* Base first */
--color-gray-200: #e5e7eb;

/* Semantic references base */
--semantic-border: var(--color-gray-200);
```

### Issue: Animation looks different after tokenization

**Solution**: Check opacity values match:

```css
/* Before */
rgba(255, 255, 255, 0.9)  /* 90% opacity */

/* After */
rgb(var(--color-white-rgb) / 0.9)  /* Same 90% opacity */
```

---

**Ready to start?** Begin with Quick Win #1 (AppIconTile) - it's a 5-minute confidence builder! 🚀
