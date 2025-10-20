# 📱 Mobile Development Guide

**Version:** 2.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Production Ready

---

## 🎯 Overview

This guide provides the **single source of truth** for mobile development in BoxCall. Follow these patterns for consistent, professional mobile experiences.

### Quick Reference

| Need           | Solution                                          | Example                                              |
| -------------- | ------------------------------------------------- | ---------------------------------------------------- |
| **Styling**    | Use Tailwind breakpoints                          | `className="p-4 sm:p-6 md:p-8"`                      |
| **Logic**      | Use `useIsMobile()` hook                          | `const isMobile = useIsMobile();`                    |
| **Components** | Import from `mobile/`                             | `import { MobileSection } from 'components/mobile';` |
| **Breakpoint** | Mobile: < 768px, Tablet: 768px+, Desktop: 1024px+ | Aligned with Tailwind                                |

---

## 📐 Breakpoints (Updated Oct 2025)

### Standard Breakpoints

```typescript
Mobile:     0px - 767px    (default, no prefix)
Tablet:   768px - 1023px   (sm:)
Desktop: 1024px - 1279px   (md:)
Large:   1280px - 1439px   (lg:)
XL:      1440px - 1919px   (xl:)
4K:      1920px+           (2xl:)
```

### Why 768px?

✅ **Industry Standard:** Most apps use 768px as mobile/tablet cutoff  
✅ **Device Coverage:** Covers all phones in portrait mode  
✅ **iPad Friendly:** iPads in portrait (768px) treated as tablet  
✅ **Aligned:** Tailwind `sm:` matches `useIsMobile()` hook

**Devices:**

- Mobile: iPhone, Android phones, small tablets in portrait
- Tablet: iPad, Android tablets, large phones in landscape
- Desktop: Laptops, desktops, monitors

---

## 🎨 When to Use What

### Use Tailwind Breakpoints (95% of cases)

**For:** Styling, layout, spacing, fonts, visibility

```tsx
// ✅ GOOD: CSS-first responsive design
<div className="p-4 sm:p-6 md:p-8">
  <h1 className="text-base sm:text-sm">Title</h1>
  <div className="flex-col sm:flex-row">
    <button className="w-full sm:w-auto">Action</button>
  </div>
</div>
```

**Benefits:**

- ✅ No JavaScript overhead
- ✅ SSR-friendly (no hydration issues)
- ✅ Easier to read
- ✅ Better performance

### Use Mobile Hooks (5% of cases)

**For:** Business logic, conditional rendering, data fetching, performance

```tsx
// ✅ GOOD: Hook for complex logic
import { useIsMobile } from 'hooks/useBreakpoint';

const MyComponent = () => {
  const isMobile = useIsMobile();

  // Complex logic based on mobile
  const itemsToShow = isMobile ? 4 : 10;
  const enableVirtualScrolling = isMobile && items.length > 100;

  // Conditional feature rendering
  if (isMobile && isLowPowerMode) {
    return <SimplifiedView />;
  }

  return (
    <div className="p-4 sm:p-6"> {/* Still use Tailwind for styling */}
      {items.slice(0, itemsToShow).map(...)}
    </div>
  );
};
```

**Good use cases:**

- Progressive loading (show 4 items on mobile, 10 on desktop)
- Feature flags (disable animations on mobile)
- API decisions (fetch less data on mobile)
- Performance optimizations (virtual scrolling)
- Complex conditional rendering

**Bad use cases (use Tailwind instead):**

```tsx
// ❌ BAD: Hook for simple styling
const isMobile = useIsMobile();
<div className={isMobile ? "p-4" : "p-6"}>

// ✅ GOOD: Tailwind for styling
<div className="p-4 sm:p-6">
```

---

## 🧩 Component Organization

### Directory Structure

```
src/components/mobile/
├── index.ts              # Main exports (use this!)
├── core/                 # Navigation & layout
│   ├── MobileBottomNavigation.tsx
│   └── MobileDrawer.tsx
└── ui/                   # Reusable UI components
    ├── MobileCTACard.tsx
    ├── MobileCard.tsx
    ├── MobileSection.tsx
    ├── MobilePageHeader.tsx
    ├── MobileQuickActions.tsx
    ├── MobileQuickActionGrid.tsx
    ├── MobileListItem.tsx
    ├── MobileHeroStatsCard.tsx
    └── MobileEventCard.tsx
```

### Import Patterns

```tsx
// ✅ GOOD: Import from main index
import {
  MobileSection,
  MobileCTACard,
  MobileQuickActions,
} from "components/mobile";

// ❌ BAD: Don't import from subdirectories
import { MobileSection } from "components/mobile/ui/MobileSection";
```

### When to Use Mobile Components

**Use mobile/core for:**

- Bottom navigation bars
- Side drawers
- Mobile-specific navigation

**Use mobile/ui for:**

- Cards with mobile-optimized spacing
- Sections with mobile-friendly layouts
- Lists with swipe actions
- Quick action grids
- Hero cards with stats

**Don't use mobile components for:**

- Simple padding changes (use Tailwind: `p-4 sm:p-6`)
- Font size changes (use Tailwind: `text-base sm:text-sm`)
- Layout changes (use Tailwind: `flex-col sm:flex-row`)
- Visibility toggles (use Tailwind: `hidden sm:block`)

---

## 📏 Touch Targets

### Apple Human Interface Guidelines

**Minimum:** 44pt × 44pt (44px × 44px)  
**Recommended:** 48px × 48px for primary actions

### Implementation

```tsx
// ✅ GOOD: Use useMobileButtonProps hook
import { useMobileButtonProps } from "hooks/useMobileButtonProps";

const MyComponent = () => {
  const primaryButtonSize = useMobileButtonProps("md", true).size; // 48px on mobile
  const secondaryButtonSize = useMobileButtonProps("md", false).size; // 44px on mobile

  return (
    <>
      <Button size={primaryButtonSize}>Primary Action</Button>
      <Button size={secondaryButtonSize}>Secondary</Button>
    </>
  );
};
```

**Button Sizes:**

- `sm`: 36px (too small for mobile ❌)
- `md`: 40px (desktop default)
- `lg`: 44px (mobile secondary ✅)
- `xl`: 48px (mobile primary ✅)

---

## 📝 Form Inputs

### iOS Auto-Zoom Prevention

**Problem:** iOS Safari auto-zooms when focusing on inputs with font < 16px

**Solution:** Use 16px font on mobile inputs

```tsx
// ✅ GOOD: 16px font on mobile
<input className={`
  w-full border rounded-lg
  ${isMobile
    ? "px-5 py-4 text-base" // Mobile: 48px height, 16px font
    : "px-3 py-2 text-sm"   // Desktop: normal
  }
`} />

// ✅ BETTER: Use Tailwind only
<input className="
  w-full border rounded-lg
  px-5 py-4 text-base       // Mobile (default)
  sm:px-3 sm:py-2 sm:text-sm // Tablet/desktop
" />
```

**Key Points:**

- ✅ **16px font** prevents iOS zoom
- ✅ **48px height** easy to tap
- ✅ **Generous padding** (20px horizontal)

---

## 🎯 Common Patterns

### Pattern 1: Mobile-First Layout

```tsx
// Mobile: Vertical stack, Tablet+: Horizontal
<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-1/2">Left</div>
  <div className="w-full sm:w-1/2">Right</div>
</div>
```

### Pattern 2: Full-Width Buttons on Mobile

```tsx
// Mobile: Full width, Tablet+: Auto width
<Button className="w-full sm:w-auto">Action</Button>
```

### Pattern 3: Progressive Disclosure

```tsx
// Show limited items on mobile
const isMobile = useIsMobile();
const itemsToShow = isMobile ? 4 : 10;

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {items.slice(0, itemsToShow).map(...)}
</div>

{isMobile && items.length > 4 && (
  <Button onClick={showMore}>Show More</Button>
)}
```

### Pattern 4: Conditional Features

```tsx
const isMobile = useIsMobile();

// Feature flag based on mobile
const enableAnimations = !isMobile || !isLowPowerMode;

// API decision
const pageSize = isMobile ? 20 : 50;

// Component selection
return isMobile ? <MobileView /> : <DesktopView />;
```

### Pattern 5: Sticky Elements

```tsx
// Sticky search bar on mobile
<div
  className="
  sticky top-0 z-10
  bg-white/95 backdrop-blur-md
  px-4 py-3
"
>
  <SearchInput />
</div>
```

---

## 🎨 Design Tokens

### Spacing

```tsx
// Mobile-optimized spacing
<div className="
  p-4 sm:p-6 md:p-8        // Padding: 16px → 24px → 32px
  gap-4 sm:gap-6 md:gap-8  // Gap: 16px → 24px → 32px
">
```

### Typography

```tsx
// Mobile: Larger fonts for readability
<h1 className="text-xl sm:text-lg md:text-xl">Title</h1>
<p className="text-base sm:text-sm">Body text</p>

// Never go below 14px on mobile (accessibility)
```

### Grid Columns

```tsx
// Progressive grid density
<div className="
  grid
  grid-cols-1           // Mobile: 1 column
  sm:grid-cols-2        // Tablet: 2 columns
  md:grid-cols-3        // Desktop: 3 columns
  lg:grid-cols-4        // Large: 4 columns
  xl:grid-cols-5        // XL: 5 columns
  gap-4
">
```

---

## 🚫 Anti-Patterns (Don't Do This)

### ❌ Manual window.innerWidth Checks

```tsx
// ❌ BAD: Manual mobile check
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

// ✅ GOOD: Use hook
const isMobile = useIsMobile();
```

### ❌ Mixing Breakpoints

```tsx
// ❌ BAD: Hook and Tailwind use different breakpoints
const isMobile = useIsMobile(); // < 768px
<div className={isMobile ? "grid-cols-1" : ""}>
  <div className="sm:grid-cols-2"> {/* sm: was 640px, now 768px ✅ */}</div>
</div>;

// ✅ GOOD: Now aligned! (since we updated Tailwind config)
// isMobile and sm: both use 768px ✅
```

### ❌ Hooks for Simple Styling

```tsx
// ❌ BAD: Hook for padding
const isMobile = useIsMobile();
<div className={isMobile ? "p-4" : "p-6"}>

// ✅ GOOD: Tailwind for padding
<div className="p-4 sm:p-6">
```

### ❌ Separate Mobile Components

```tsx
// ❌ BAD: Duplicate components for mobile/desktop
const MobileCard = () => <div className="p-4">...</div>;
const DesktopCard = () => <div className="p-6">...</div>;

// ✅ GOOD: Single component with responsive classes
const Card = () => <div className="p-4 sm:p-6">...</div>;
```

---

## 🧪 Testing Mobile

### Browser DevTools

```bash
# Chrome DevTools
1. Open DevTools (Cmd+Option+I)
2. Click device toolbar (Cmd+Shift+M)
3. Test various devices:
   - iPhone SE (375px) - Small mobile
   - iPhone 14 (390px) - Standard mobile
   - iPad (768px) - Tablet
   - Desktop (1024px+)
```

### Real Device Testing

**Mobile (< 768px):**

- iPhone SE (375px) - Smallest modern iPhone
- iPhone 12/13/14 (390px) - Standard
- iPhone 14 Pro Max (430px) - Largest

**Tablet (768px - 1023px):**

- iPad (768px portrait, 1024px landscape)
- iPad Pro (834px portrait)
- Android tablets

**Checklist:**

- [ ] Touch targets ≥ 44px
- [ ] Inputs ≥ 16px font (no iOS zoom)
- [ ] No horizontal scroll
- [ ] Content readable without zoom
- [ ] Buttons easy to tap
- [ ] Forms easy to fill
- [ ] No layout breaks

---

## 📚 Code Examples

### Example 1: Mobile-First Card

```tsx
import { useIsMobile } from "hooks/useBreakpoint";

const PlayCard = ({ play }) => {
  const isMobile = useIsMobile();

  // Use hook for logic
  const shouldShowExpandedContent = isMobile && play.description.length > 100;

  return (
    <div
      className="
      p-5 sm:p-4 md:p-6       // Tailwind for styling
      text-base sm:text-sm    // Larger text on mobile
      border rounded-lg
    "
    >
      <h3 className="text-base sm:text-sm font-semibold">{play.name}</h3>

      {/* Hook for conditional rendering */}
      {shouldShowExpandedContent ? (
        <ExpandedDescription text={play.description} />
      ) : (
        <p className="text-sm">{play.description}</p>
      )}

      <div
        className="
        flex flex-col sm:flex-row  // Stack on mobile
        gap-2 sm:gap-3             // Smaller gap on mobile
        mt-4
      "
      >
        <Button className="w-full sm:w-auto">View</Button>
        <Button className="w-full sm:w-auto">Edit</Button>
      </div>
    </div>
  );
};
```

### Example 2: Mobile PlaybookPage

```tsx
import { useIsMobile } from "hooks/useBreakpoint";
import {
  MobileSection,
  MobileCTACard,
  MobileQuickActions,
} from "components/mobile";

const PlaybookPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {isMobile ? (
        // Mobile: Use mobile components
        <>
          <MobileSection spacing="comfortable">
            <MobileCTACard
              title="Add New Play"
              description="Create a new play"
              onClick={handleAddPlay}
            />
          </MobileSection>

          <MobileQuickActions
            actions={[
              { icon: "plus", label: "New", onClick: handleNew },
              { icon: "filter", label: "Filter", onClick: handleFilter },
            ]}
          />
        </>
      ) : (
        // Desktop: Traditional layout
        <div className="grid grid-cols-4 gap-6">
          <aside className="col-span-1">
            <SidebarFilters />
          </aside>
          <main className="col-span-3">
            <PlayGrid />
          </main>
        </div>
      )}

      {/* Grid works on all sizes with Tailwind */}
      <div
        className="
        grid 
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3
        gap-4 sm:gap-6
        mt-6
      "
      >
        {plays.map((play) => (
          <PlayCard key={play.id} play={play} />
        ))}
      </div>
    </div>
  );
};
```

### Example 3: Mobile Form

```tsx
const AddPlayModal = () => {
  const isMobile = useIsMobile();
  const primaryButtonSize = useMobileButtonProps("md", true).size;
  const secondaryButtonSize = useMobileButtonProps("md", false).size;

  return (
    <Modal fullScreen={isMobile}>
      {" "}
      {/* Full screen on mobile */}
      <form>
        {/* Inputs with 16px font on mobile (prevents iOS zoom) */}
        <Input
          label="Play Name"
          className={`
            w-full border rounded-lg
            ${
              isMobile
                ? "px-5 py-4 text-base" // 48px, 16px
                : "px-3 py-2 text-sm" // Normal
            }
          `}
        />

        {/* Full-width buttons on mobile */}
        <div
          className={`
          flex justify-end gap-3
          ${isMobile ? "flex-col" : "flex-row"}
        `}
        >
          <Button
            size={secondaryButtonSize}
            className={isMobile ? "w-full" : ""}
          >
            Cancel
          </Button>
          <Button size={primaryButtonSize} className={isMobile ? "w-full" : ""}>
            Create Play
          </Button>
        </div>
      </form>
    </Modal>
  );
};
```

---

## 🎓 Quick Decision Tree

```
Need to make something responsive?
│
├─ Is it STYLING? (padding, margins, fonts, layout)
│  └─ ✅ Use Tailwind breakpoints
│     Example: className="p-4 sm:p-6 md:p-8"
│
├─ Is it BUSINESS LOGIC? (data fetching, feature flags)
│  └─ ✅ Use useIsMobile() hook
│     Example: const pageSize = isMobile ? 20 : 50;
│
├─ Is it COMPLEX MOBILE UI? (bottom nav, swipe actions)
│  └─ ✅ Use mobile components
│     Example: import { MobileSection } from 'components/mobile';
│
└─ Is it SIMPLE CONDITIONAL RENDERING?
   ├─ Can it be done with Tailwind? (hidden sm:block)
   │  └─ ✅ Use Tailwind
   └─ Too complex for Tailwind?
      └─ ✅ Use useIsMobile() hook
```

---

## 📖 Further Reading

### Internal Docs

- `MOBILE_ARCHITECTURE_AUDIT.md` - Complete architecture audit
- `MOBILE_ARCHITECTURE_MIGRATION_PHASE1.md` - Migration details
- `MOBILE_PLAYBOOK_REDESIGN_PLAN.md` - Long-term mobile plan
- `tailwind.config.js` - Breakpoint configuration

### External Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Mobile](https://material.io/design/layout/responsive-layout-grid.html)
- [Josh Comeau: CSS vs JS](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/)

---

## 🚀 Summary

### The Golden Rules

1. **CSS First:** Use Tailwind for 95% of responsive styling
2. **Hooks for Logic:** Use `useIsMobile()` only for business logic
3. **768px Standard:** Mobile < 768px, Tablet 768px+, Desktop 1024px+
4. **Touch Targets:** Minimum 44px, 48px for primary actions
5. **16px Inputs:** Prevent iOS auto-zoom with 16px font
6. **Single Source:** One breakpoint system (Tailwind aligned with hooks)

### Quick Import Cheat Sheet

```tsx
// Hooks
import { useIsMobile, useIsTablet, useIsDesktop } from "hooks/useBreakpoint";
import { useMobileButtonProps } from "hooks/useMobileButtonProps";

// Components
import {
  MobileSection,
  MobileCTACard,
  MobileQuickActions,
  MobileBottomNavigation,
} from "components/mobile";
```

---

**Questions?** Check the audit docs or ask in #engineering-mobile 🚀

**Status:** ✅ Production Ready  
**Version:** 2.0 (Post-Migration)
