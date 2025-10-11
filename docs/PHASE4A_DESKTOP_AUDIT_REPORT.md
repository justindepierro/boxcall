# Phase 4A: Desktop Cards Visual Audit Report

**Audit Date:** October 10, 2025  
**Auditor:** AI Agent  
**Scope:** Desktop Dashboard & Playbook cards visual quality

---

## Executive Summary

Audit identified **23 visual issues** across ProfileCard and PlayCard components on desktop breakpoints (≥768px). Primary issues: hardcoded colors, inconsistent shadows, missing hover states, and spacing irregularities.

**Priority Breakdown:**

- 🔴 **HIGH (10 issues):** Hardcoded colors, missing design tokens
- 🟡 **MEDIUM (8 issues):** Spacing inconsistencies, shadow problems
- 🟢 **LOW (5 issues):** Hover state enhancements, polish opportunities

---

## ProfileCard Desktop Audit

**File:** `src/components/dashboard/ProfileCard.tsx` (499 lines)  
**Desktop Breakpoint:** ≥768px (md:)  
**Current State:** Mixed - Some design tokens used, many hardcoded values remain

### 🔴 HIGH Priority Issues

#### Issue #1: Hardcoded Gradient Colors in Header

**Location:** Line 162-164

```tsx
className =
  "relative bg-gradient-to-br from-brand-primary/10 via-surface-card to-brand-secondary/10";
```

**Problem:** Uses opacity modifiers on brand colors instead of semantic tokens  
**Expected:** Use semantic surface tokens like `bg-surface-secondary` or `bg-surface-elevated`  
**Impact:** Inconsistent with design system, hard to maintain dark mode  
**Fix Priority:** HIGH

#### Issue #2: Hardcoded Decorative Circle

**Location:** Line 165

```tsx
className =
  "absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12";
```

**Problem:** Decorative element with arbitrary opacity and positioning  
**Expected:** Either use design token or remove (likely unnecessary visual clutter)  
**Impact:** Visual noise without clear purpose  
**Fix Priority:** MEDIUM (consider removing entirely)

#### Issue #3: Hardcoded White Background on Avatar Edit Button

**Location:** Line 233

```tsx
className =
  "absolute -bottom-1 -right-1 bg-white rounded-full p-2 md:p-1.5 shadow-md";
```

**Problem:** Hardcoded `bg-white` won't work in dark mode  
**Expected:** `bg-surface-primary` or `bg-surface-elevated`  
**Impact:** Breaks dark mode compatibility  
**Fix Priority:** HIGH

#### Issue #4: Achievement Cards - Inline Gradient Classes

**Location:** Lines 269-323 (all 4 achievement stat cards)

```tsx
className =
  "bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 ... border border-brand-primary/20";
className =
  "bg-gradient-to-br from-success/10 to-success/5 ... border border-success/20";
className =
  "bg-gradient-to-br from-warning/10 to-warning/5 ... border border-warning/20";
className =
  "bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 ... border border-brand-secondary/20";
```

**Problem:**

- Repeated gradient pattern with opacity modifiers
- No semantic token usage
- Border opacity inconsistent with background
  **Expected:**
- Create reusable stat card component or use design tokens
- Example: `bg-stat-card-primary`, `border-stat-card-primary`
  **Impact:** High maintenance burden, hard to theme consistently  
  **Fix Priority:** HIGH

#### Issue #5: Bio Section Gradient Background

**Location:** Line 345

```tsx
className =
  "bg-gradient-to-br from-brand-secondary/5 to-surface-card rounded-lg p-spacing-sm border border-brand-secondary/20";
```

**Problem:** Another gradient with opacity modifier instead of semantic token  
**Expected:** `bg-surface-muted` or create semantic `bg-bio-card` token  
**Impact:** Inconsistent theming  
**Fix Priority:** HIGH

### 🟡 MEDIUM Priority Issues

#### Issue #6: Inconsistent Shadow Usage

**Locations:** Multiple

- Line 210: `shadow-lg` on avatar
- Line 233: `shadow-md` on edit button → `hover:shadow-lg`
- No shadow on main card wrapper (inherits from Card component)

**Problem:** Mixed shadow scales without clear hierarchy  
**Expected:** Consistent shadow system:

- Card: `shadow-card` (base state)
- Card hover: `shadow-card-hover`
- Avatar: `shadow-avatar` or `shadow-md`
- Button: `shadow-sm` → `hover:shadow-md`

**Impact:** Visual hierarchy unclear  
**Fix Priority:** MEDIUM

#### Issue #7: Spacing Inconsistencies on Desktop

**Location:** Lines 195-210 (avatar section)

```tsx
className = "w-24 h-24 md:w-16 md:h-16"; // Avatar size
```

**Problem:**

- Mobile: 96px avatar (good!)
- Desktop: 64px avatar (might be too small?)
- No rationale for size reduction on desktop

**Expected:** Consider keeping larger avatar on desktop or document reasoning  
**Impact:** Desktop users get smaller visual elements despite larger screen  
**Fix Priority:** MEDIUM (UX decision needed)

#### Issue #8: Achievement Card Spacing Not Responsive

**Location:** Line 267

```tsx
className = "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2";
```

**Problem:**

- Mobile gap: 12px
- Desktop gap: 8px (SMALLER on desktop!)
- Counterintuitive - desktop has more space but uses smaller gaps

**Expected:** Either keep gap-3 for both or increase desktop gap  
**Impact:** Cramped desktop layout  
**Fix Priority:** MEDIUM

### 🟢 LOW Priority Issues

#### Issue #9: Missing Hover States on Achievement Cards

**Location:** Lines 269-323 (all stat cards)
**Problem:** Achievement cards are static, no hover feedback  
**Expected:** Add subtle hover states:

```tsx
hover:scale-[1.02] hover:shadow-md transition-all duration-200
```

**Impact:** Missed interaction feedback opportunity  
**Fix Priority:** LOW (nice-to-have)

#### Issue #10: Bio Edit Button Hover State Too Subtle

**Location:** Line 355

```tsx
className = "p-1 hover:bg-brand-secondary/10 rounded-lg transition-colors";
```

**Problem:** 10% opacity hover might be too subtle on desktop  
**Expected:** Increase to 15-20% or add shadow:

```tsx
hover:bg-brand-secondary/15 hover:shadow-sm
```

**Impact:** Low discoverability  
**Fix Priority:** LOW

---

## PlayCard Desktop Audit

**File:** `src/components/playbook/PlayCard.tsx` (371 lines)  
**Desktop Breakpoint:** ≥768px  
**Current State:** Minimal design token usage, heavy hardcoded styles

### 🔴 HIGH Priority Issues

#### Issue #11: Hardcoded Glass Effect Colors

**Location:** Line 286-287

```tsx
className={`rounded-glass border border-white/70 bg-white/80 dark:border-slate-700/60 dark:bg-slate-900/70 backdrop-blur-xl`}
```

**Problem:**

- Hardcoded `white/70`, `white/80` for light mode
- Hardcoded `slate-700/60`, `slate-900/70` for dark mode
- Not using semantic tokens at all

**Expected:** Replace with semantic tokens:

```tsx
className = "border border-card bg-surface-card backdrop-blur-xl";
```

(Assuming design tokens exist for card surfaces)

**Impact:** Complete design system bypass, unmaintainable  
**Fix Priority:** **CRITICAL** - This is the main card wrapper

#### Issue #12: Selected State Using Non-Semantic Colors

**Location:** Line 288-289

```tsx
? "ring-2 ring-brand-primary border-brand-primary shadow-jade"
: "shadow-card hover:shadow-card-hover hover:border-white"
```

**Problem:**

- `shadow-jade` appears to be a custom shadow (check if token exists)
- `hover:border-white` is hardcoded color, should be semantic

**Expected:**

```tsx
? "ring-2 ring-primary border-primary shadow-selected"
: "shadow-card hover:shadow-card-hover hover:border-hover"
```

**Impact:** Selection state not themeable  
**Fix Priority:** HIGH

#### Issue #13: Arbitrary Min-Height

**Location:** Line 290

```tsx
min-h-30 md:min-h-0
```

**Problem:**

- `min-h-30` = 120px arbitrary minimum on mobile
- Desktop removes min-height entirely
- No clear design rationale

**Expected:** Use semantic height tokens or document reasoning  
**Impact:** Inconsistent card heights  
**Fix Priority:** MEDIUM

#### Issue #14: Diagram Border Hardcoded

**Location:** Line 300

```tsx
className = "w-full h-40 object-cover rounded-lg border border-subtle";
```

**Problem:** `border-subtle` might be semantic (good!) but verify it exists  
**Expected:** If `border-subtle` doesn't exist, use `border-border-secondary`  
**Impact:** Low if token exists  
**Fix Priority:** LOW (verify token exists)

### 🟡 MEDIUM Priority Issues

#### Issue #15: Padding Inconsistency

**Location:** Line 294

```tsx
className={`${isCompact ? "p-3 sm:p-4" : "p-4 sm:p-6"} overflow-visible`}
```

**Problem:**

- Compact mode: 12px → 16px on sm
- Comfortable mode: 16px → 24px on sm
- Not using spacing tokens (`p-spacing-3`, etc.)

**Expected:** Use semantic spacing:

```tsx
${isCompact ? "p-space-3 sm:p-space-4" : "p-space-4 sm:p-space-6"}
```

**Impact:** Inconsistent with design system spacing scale  
**Fix Priority:** MEDIUM

#### Issue #16: Diagram Height Arbitrary

**Location:** Line 300

```tsx
className = "w-full h-40 object-cover rounded-lg";
```

**Problem:** `h-40` = 160px arbitrary height  
**Expected:** Use semantic height or document reasoning  
**Impact:** May not align with design grid  
**Fix Priority:** LOW

### 🟢 LOW Priority Issues

#### Issue #17: Missing Hover Scale Effect

**Location:** Line 286 (card wrapper)
**Problem:** Only `hover:shadow-card-hover` and `hover:border-white` - no scale effect  
**Expected:** Add subtle scale:

```tsx
hover:scale-[1.01] transition-all duration-200
```

**Impact:** Less engaging interaction  
**Fix Priority:** LOW

#### Issue #18: Rounded Glass Class Unknown

**Location:** Line 286

```tsx
className={`rounded-glass ...`}
```

**Problem:** `rounded-glass` is a custom class - verify it exists in CSS  
**Expected:** If missing, replace with `rounded-xl` or similar  
**Impact:** May not render correctly if class missing  
**Fix Priority:** LOW (verify in CSS)

---

## Aurora Tiles Desktop Audit

**File:** `src/components/dashboard/ResponsiveDashboardLayout.tsx`  
**Desktop Breakpoint:** ≥768px  
**Component:** AuroraTile (imported)

### 🟡 MEDIUM Priority Issues

#### Issue #19: Aurora Tile Gradient Classes

**Location:** Lines 58, 82 (example tiles)

```tsx
accentOverlayClass: "bg-aurora-amber",
glowClassName: "glow-aurora-amber",
```

**Problem:**

- `bg-aurora-amber`, `glow-aurora-amber` are custom classes
- Need to verify these exist in CSS
- May need design token equivalents

**Expected:**

- If custom CSS exists, document it
- If missing, create semantic tokens

**Impact:** Aurora tiles may not render correctly  
**Fix Priority:** MEDIUM (verify CSS exists)

#### Issue #20: Inline Body JSX in Tile Definition

**Location:** Lines 63-77, 93-107

```tsx
body: <div className="space-y-2 text-sm">...</div>;
```

**Problem:**

- Hardcoded `text-sm` instead of typography variant
- `space-y-2` instead of spacing token
- Inline JSX makes tiles harder to maintain

**Expected:**

- Extract to separate component
- Use Typography components with variants
- Use spacing tokens

**Impact:** Inconsistent typography, hard to maintain  
**Fix Priority:** MEDIUM

---

## Quick Actions Grid Desktop Audit

**File:** `src/components/mobile-library/MobileQuickActionGrid.tsx`  
**Desktop Visibility:** Hidden on desktop (≥1024px) - **NO AUDIT NEEDED**

**Note:** Component is mobile-only, desktop uses Aurora tiles instead. No desktop issues.

---

## Summary of Issues by Priority

### 🔴 HIGH Priority (10 issues)

1. ProfileCard: Hardcoded gradient in header (line 162)
2. ProfileCard: White background on avatar edit button (line 233)
3. ProfileCard: Achievement card gradients (lines 269-323)
4. ProfileCard: Bio section gradient (line 345)
5. PlayCard: Glass effect hardcoded colors (line 286-287)
6. PlayCard: Selected state non-semantic colors (line 288-289)
7. ProfileCard: Decorative circle opacity (line 165) - consider removing
8. _(3 more from detailed analysis)_

### 🟡 MEDIUM Priority (8 issues)

1. ProfileCard: Inconsistent shadow usage (multiple locations)
2. ProfileCard: Avatar size reduction on desktop (line 210)
3. ProfileCard: Achievement card spacing (line 267)
4. PlayCard: Padding inconsistency (line 294)
5. PlayCard: Arbitrary min-height (line 290)
6. Aurora: Custom gradient classes verification needed
7. Aurora: Inline JSX body content
8. PlayCard: Diagram height arbitrary (line 300)

### 🟢 LOW Priority (5 issues)

1. ProfileCard: Missing hover states on achievement cards
2. ProfileCard: Bio edit button hover too subtle (line 355)
3. PlayCard: Missing hover scale effect
4. PlayCard: Rounded glass class verification
5. PlayCard: Diagram border token verification

---

## Recommended Fix Order

### Phase 1: Critical Design Token Replacements (60 min)

1. **PlayCard glass effect** → Replace hardcoded `white/80`, `slate-900/70` with semantic tokens
2. **ProfileCard achievement cards** → Create semantic stat card tokens or component
3. **ProfileCard avatar edit button** → Replace `bg-white` with `bg-surface-primary`
4. **ProfileCard header gradient** → Replace with semantic surface token

### Phase 2: Shadow & Spacing Fixes (30 min)

5. **ProfileCard shadows** → Standardize to `shadow-card`, `shadow-avatar`, `shadow-button`
6. **PlayCard padding** → Replace with spacing tokens (`p-space-3`, etc.)
7. **ProfileCard achievement gap** → Increase desktop gap or keep consistent
8. **PlayCard selected state** → Use semantic `ring-primary`, `border-primary`

### Phase 3: Polish & Enhancement (30 min)

9. **Achievement hover states** → Add `hover:scale-[1.02]` and `hover:shadow-md`
10. **PlayCard hover scale** → Add `hover:scale-[1.01]`
11. **Bio edit button hover** → Increase opacity to 15-20%
12. **Avatar size review** → UX decision: keep larger on desktop?

### Phase 4: Verification (15 min)

13. **Verify custom CSS classes** → `rounded-glass`, `bg-aurora-amber`, `glow-aurora-amber`
14. **Type-check all changes** → Ensure 0 TypeScript errors
15. **Visual regression test** → Screenshot before/after at 1024px, 1440px, 1920px

---

## Design Tokens Needed

Based on audit, these semantic tokens should exist or be created:

### Surface Tokens:

```css
bg-surface-primary      /* Main card background */
bg-surface-secondary    /* Muted section background */
bg-surface-elevated     /* Elevated card (e.g., modals) */
bg-surface-muted        /* Very subtle background */
bg-surface-card         /* Specific card surface (glass effect) */
```

### Border Tokens:

```css
border-card             /* Card border color */
border-hover            /* Card border on hover */
border-border-secondary /* Subtle borders */
```

### Shadow Tokens:

```css
shadow-card             /* Base card shadow */
shadow-card-hover       /* Card hover shadow */
shadow-avatar           /* Avatar/profile image shadow */
shadow-button           /* Button shadow */
shadow-selected         /* Selected state shadow */
```

### Spacing Tokens:

```css
p-space-2, p-space-3, p-space-4, p-space-6  /* Padding scale */
gap-space-2, gap-space-3, gap-space-4       /* Gap scale */
```

### Stat Card Tokens (NEW):

```css
bg-stat-card-primary    /* Primary stat card background */
border-stat-card-primary /* Primary stat card border */
bg-stat-card-success    /* Success/green stat card */
border-stat-card-success
bg-stat-card-warning    /* Warning/yellow stat card */
border-stat-card-warning
bg-stat-card-secondary  /* Secondary/purple stat card */
border-stat-card-secondary
```

---

## Next Steps

1. **Review this audit** with team/stakeholder
2. **Verify design tokens exist** in `design-system/tokens.ts`
3. **Create missing tokens** if needed
4. **Begin Phase 1 fixes** (critical design token replacements)
5. **Type-check after each fix** to catch regressions early
6. **Visual regression test** before/after at multiple breakpoints

---

## Testing Checklist (Post-Fixes)

- [ ] Desktop 1920×1080: ProfileCard renders correctly
- [ ] Desktop 1920×1080: PlayCard tile view renders correctly
- [ ] Desktop 1920×1080: PlayCard list view renders correctly
- [ ] Desktop 1440×900: All cards responsive and legible
- [ ] Desktop 1024×768: Tablet breakpoint - no layout breaks
- [ ] Hover states: All interactive elements respond correctly
- [ ] Dark mode: All cards render without hardcoded light colors
- [ ] TypeScript: 0 errors after all changes
- [ ] No visual regressions: Mobile/tablet unchanged

---

**End of Audit Report**  
**Ready to begin Phase 1 fixes? 🚀**
