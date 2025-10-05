# Visual Inspection Checklist

Use this checklist when reviewing each page in your browser at http://localhost:5173

## Page Review Template

For each page, check these items:

### 🎨 Visual Design

- [ ] Uses Aurora background or appropriate alternative
- [ ] PageLayout wrapper present with title/subtitle
- [ ] Consistent card styling (GlassCard or Card component)
- [ ] Proper spacing between sections (uses spacing tokens)
- [ ] No visual glitches or overflow issues
- [ ] Colors match design system (jade/navy primary colors)

### 📱 Responsive Design

- [ ] Mobile (375px): Layout doesn't break
- [ ] Tablet (768px): Proper grid adjustments
- [ ] Desktop (1024px+): Optimal content width
- [ ] Touch targets minimum 44px
- [ ] No horizontal scrolling

### ♿ Accessibility

- [ ] Focus indicators visible on all interactive elements
- [ ] Heading hierarchy correct (h1 → h2 → h3)
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Form labels present and associated
- [ ] Keyboard navigation works

### 🎯 Component Usage

- [ ] Uses Button component (not raw `<button>`)
- [ ] Uses Card component (not custom divs)
- [ ] Uses Typography component for text
- [ ] Uses Icon component for icons
- [ ] Modal/Toast patterns consistent

### 🔍 Token Compliance

- [ ] No hardcoded hex colors visible in DevTools
- [ ] No arbitrary Tailwind classes (e.g., `text-[1.5rem]`)
- [ ] No inline styles except for dynamic values
- [ ] Spacing uses 8px grid (multiples of 4px/8px)

### 🌗 Dark Mode

- [ ] Toggle dark mode - no broken colors
- [ ] Text remains readable
- [ ] Shadows and borders visible
- [ ] Images/logos adapt appropriately

---

## Pages to Review (Priority Order)

### High Priority - Need Full Review

1. [ ] **ProfilePage** (`/profile`)
   - Personal info display
   - Edit functionality
   - Avatar/photo upload
   - Team affiliations

2. [ ] **TeamSettings** (`/team/:id/settings`)
   - Settings forms
   - Team configuration
   - Permission management

3. [ ] **PracticePlanner** (`/practice-planner`)
   - Complex interactions
   - Drag & drop
   - Time blocks
   - Modal workflows

4. [ ] **AnalyticsPage** (`/analytics`)
   - Charts and graphs
   - Data visualization colors
   - Filter panels
   - Export functionality

5. [ ] **GamePlansPage** (`/game-plans`)
   - Game plan cards
   - Workflow states
   - Quick actions
   - List/grid views

### Medium Priority - Quick Check

6. [ ] **TeamBulletin** (`/team/:id/bulletin`)
   - Post cards
   - Comment threads
   - Reactions
   - Social features

7. [ ] **AwardsPage** (`/awards`)
   - Achievement cards
   - Badge displays
   - Trophy shelf
   - Stats displays

8. [ ] **CoachManagementPage** (`/coaches`)
   - Coach list table
   - Role assignments
   - Add/edit forms

9. [ ] **PlayerDashboardPage** (`/player/dashboard`)
   - Player-specific view
   - Stats widgets
   - Schedule
   - Assignments

### Low Priority - Spot Check

10. [ ] **CreateTeam** (`/create-team`)
    - Multi-step form
    - Validation states
    - Progress indicator

11. [ ] **AchievementAdminPage** (`/admin/achievements`)
    - Admin tooling
    - Data tables
    - Bulk actions

---

## Quick Reference: Common Issues & Fixes

### Issue: Text is too small on mobile

```tsx
// ❌ DON'T
<p className="text-xs">

// ✅ DO
<Typography variant="body-sm" className="md:text-xs">
```

### Issue: Spacing inconsistent

```tsx
// ❌ DON'T
<div className="mb-5 mt-7">

// ✅ DO
<div className="space-y-4"> {/* or mb-4, mt-6 (multiples of 4) */}
```

### Issue: Button not using component

```tsx
// ❌ DON'T
<button className="bg-jade-500 px-4 py-2 rounded">

// ✅ DO
<Button variant="primary" size="md">
```

### Issue: Card not using semantic tokens

```tsx
// ❌ DON'T
<div className="bg-white shadow-lg rounded-lg p-6">

// ✅ DO
<Card className="p-card-padding">
```

### Issue: Custom colors instead of semantic

```tsx
// ❌ DON'T
<div className="bg-[#FFFFFF] text-[#000000]">

// ✅ DO
<div className="bg-surface-base text-text-primary">
```

---

## Review Process

### Step 1: Desktop Review (10 min per page)

1. Open page in browser
2. Check layout and spacing
3. Test interactions (buttons, forms, modals)
4. Toggle dark mode
5. Document issues

### Step 2: Responsive Review (5 min per page)

1. Open DevTools
2. Toggle device toolbar
3. Test at 375px (mobile)
4. Test at 768px (tablet)
5. Test at 1440px (desktop)

### Step 3: Accessibility Review (5 min per page)

1. Tab through all interactive elements
2. Check focus indicators
3. Run Lighthouse audit
4. Check color contrast in DevTools

### Step 4: Code Review (5 min per page)

1. Open component file
2. Search for: `style={{`, `className.*\[`, `#[0-9A-F]{6}`
3. Check for semantic token usage
4. Note refactoring opportunities

---

## Taking Notes

Use this template for each page:

```markdown
## [Page Name] - [Route]

### Status: [✅ Excellent | 🟡 Good | ⚠️ Needs Work | 🔴 Major Issues]

**Visual Design**: [Notes]
**Responsive**: [Notes]
**Accessibility**: [Notes]
**Token Usage**: [Notes]
**Dark Mode**: [Notes]

### Issues Found:

1. [Issue description] - Priority: [High|Medium|Low]
2. ...

### Recommendations:

- [Recommendation 1]
- [Recommendation 2]

### Screenshots:

- Desktop: [Link or embed]
- Mobile: [Link or embed]
```

---

## Tools to Use

1. **Chrome DevTools**
   - Device toolbar for responsive testing
   - Color contrast checker
   - Lighthouse audit
   - Accessibility tree

2. **Browser Extensions**
   - axe DevTools
   - WAVE
   - React DevTools

3. **Commands**
   ```bash
   npm run dev        # Start dev server
   npm run type-check # Check TypeScript
   npm run lint       # Check linting
   ```

---

## When You Find Issues

### Minor Issues (e.g., spacing, text size)

✏️ Fix immediately in the same session

### Medium Issues (e.g., missing tokens, large components)

📝 Document and schedule for this week

### Major Issues (e.g., broken functionality, accessibility blockers)

🚨 Stop and fix before continuing review

---

## Completion Criteria

A page is "complete" when:

- ✅ All checklist items pass
- ✅ No high-priority issues remain
- ✅ Dark mode works correctly
- ✅ Responsive on all breakpoints
- ✅ Uses semantic tokens consistently
- ✅ No console errors/warnings
- ✅ Lighthouse score > 90

---

Happy reviewing! 🎨✨
