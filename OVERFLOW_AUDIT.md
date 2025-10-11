# Overflow Clipping Audit - October 11, 2025

## Problem Statement
User reports badges and shadows still clipped despite adding `overflow-visible` to:
- Card component (base styles)
- PlayGrid container
- PlayCard wrapper
- PlayCardTileHeader
- AppIconTile

## CSS Load Order Analysis

From `index.css`:
```
1. overflow-prevention.css (line 24) - Sets .card { overflow: visible; }
2. component-utilities.css (line 36) - Defines .card { ... } WITHOUT overflow property
```

**ISSUE**: `component-utilities.css` loads AFTER `overflow-prevention.css`, so the `overflow: visible` rule is preserved (later rules don't override unless they explicitly set the property).

## Discovered Issues

### 1. Global Button Overflow Hidden
**File**: `overflow-prevention.css` line 5
```css
button {
  overflow: hidden;
}
```
**Impact**: ALL buttons have `overflow: hidden`, which clips any child content that extends beyond button bounds.

### 2. Flex Container Overflow Rules
**File**: `overflow-prevention.css` lines 28-31
```css
.flex.items-center > span:not(.icon),
.flex.items-center > div:not(.icon):last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
```
**Impact**: Any flex container with items-center class clips text content.

### 3. Card Heading Overflow
**File**: `overflow-prevention.css` lines 40-55
```css
.card h1, .card h2, .card h3, .card h4, .card h5, .card h6 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
```
**Impact**: All headings inside cards are clipped.

### 4. Massive Number of overflow: hidden Rules
**Found**: 46 instances of `overflow: hidden` across CSS files
**Files affected**:
- mobile-typography.css: 3 instances
- overflow-prevention.css: 17 instances
- typography-utilities.css: 6 instances  
- team-dashboard.css: 20 instances

## Component Hierarchy Check

```
PlaybookPage
└── div.lg:col-span-3.overflow-visible
    └── Card variant="glass" size="lg"  (has overflow-visible in TSX)
        └── PlayGrid
            └── DragDropContext
                └── Droppable
                    └── div.grid.gap-10.py-8.px-4.overflow-visible
                        └── Draggable
                            └── div.w-full.overflow-visible
                                └── PlayCard (has overflow-visible on wrapper)
                                    └── div.p-4.overflow-visible
                                        └── PlayCardTileHeader
                                            └── Confidence badges (absolute positioning)
```

## Potential Root Causes

### Theory 1: Tailwind Rounded Corners
`rounded-xl` class on Card/PlayCard might implicitly add `overflow: hidden` in browser rendering to clip content to border radius.

### Theory 2: CSS Specificity War
Multiple CSS files defining overflow properties in conflicting ways. Inline `overflow-visible` from Tailwind classes may be overridden by more specific CSS selectors.

### Theory 3: Backdrop-blur Clipping
Card glass variant uses `backdrop-blur-md` which might create a new stacking context that clips overflow content.

### Theory 4: Transform/Translate Clipping
PlayCard has `hover:scale-[1.02] hover:-translate-y-1` which creates a transform that might establish a containing block for absolutely positioned children.

### Theory 5: Shadow Rendering Issue
Browser may be clipping shadows at element boundaries due to insufficient padding or negative margins.

## Next Steps

1. **Inspect in DevTools**: Check computed styles on Card, PlayCard, and PlayCardTileHeader
2. **Test without backdrop-blur**: Remove `backdrop-blur-md` from Card glass variant temporarily
3. **Test without transforms**: Remove hover scale/translate from PlayCard
4. **Test without rounded corners**: Temporarily remove `rounded-xl` to see if that's the culprit
5. **Add explicit padding**: Increase py-8 on grid to py-12 or py-16 to accommodate overflowing badges
6. **Check z-index stacking**: Verify badges have sufficient z-index to render above parent containers

## Diagnostic Commands

```bash
# Check all overflow rules in CSS
grep -r "overflow:" src/styles/ --include="*.css"

# Check all rounded classes with overflow
grep -r "rounded.*overflow" src/ --include="*.tsx" --include="*.css"

# Find all backdrop-blur usage
grep -r "backdrop-blur" src/ --include="*.tsx" --include="*.css"
```

## Questions for User

1. Can you open browser DevTools and inspect the green "borders" element?
2. What does the computed styles panel show for `overflow` property on that element and its parents?
3. If you right-click and "Inspect Element" on the clipped badge, what is the HTML structure shown?
4. Does the badge have a class like `absolute -top-3 -right-3`?
5. What is the containing element (parent div) of the badge?
