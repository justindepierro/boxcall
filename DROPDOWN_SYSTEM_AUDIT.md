# Dropdown System Audit Report 🔍

**Date**: October 15, 2025  
**Purpose**: Comprehensive audit of all dropdown/popover/menu implementations  
**Status**: ⚠️ **ISSUES FOUND** - Multiple inconsistent patterns

---

## 🚨 CRITICAL FINDINGS

### **Problem #1: Inconsistent Z-Index Strategy**

**Current Z-Index Values Found:**
- `z-10` - FuzzySearchInput, ReactionButton, CommentSection, Breadcrumb, InlineEditField
- `z-50` - Dropdown.tsx, PlayerControls, Sidebar
- `z-[60]` - AppHeader, UnifiedSettingsPanel
- `z-[70]` - UserMenu, ConfettiBurst
- `z-[100]` - DiagramEditor modals
- `z-[110]` - PlaybookSelector
- `z-[9999]` - GlobalSearch, DevPanel

**Issue**: No standardized z-index scale, leading to overlapping conflicts.

---

### **Problem #2: Inconsistent Blur/Close Timing**

**Different Patterns Found:**

```tsx
// Pattern A: 150ms delay (GlobalSearch)
setTimeout(() => setIsOpen(false), 150);

// Pattern B: 200ms delay (FuzzySearchInput)
setTimeout(() => onShowSuggestionsChange(false), 200);

// Pattern C: No delay (Some components)
setIsOpen(false);
```

**Issue**: Different timings cause race conditions - sometimes clicks register, sometimes they don't.

---

### **Problem #3: Multiple Dropdown Implementations**

**Found 3+ different dropdown patterns:**

1. **`Dropdown.tsx`** - Compound component with Trigger/Content/Item
2. **`Select.tsx`** - Full-featured select with search
3. **`GlobalSearch`** - Custom dropdown with results
4. **Inline patterns** - 10+ components with their own dropdown logic

**Issue**: No single source of truth, bugs fixed in one place don't propagate.

---

### **Problem #4: Positioning Inconsistencies**

**Different Positioning Approaches:**

```tsx
// Absolute with top-full (most common)
className="absolute top-full left-0 right-0 mt-1"

// Fixed with calculations
className="fixed ..." 
style={{ top: buttonRect.bottom, left: buttonRect.left }}

// Absolute with no positioning logic
className="absolute" // ❌ Missing position!
```

**Issue**: Some dropdowns appear off-screen or behind other elements.

---

### **Problem #5: Click-Outside Logic Variations**

**4 Different Patterns:**

```tsx
// Pattern A: useEffect with mousedown
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [isOpen]);

// Pattern B: onBlur with setTimeout
onBlur={() => setTimeout(() => setIsOpen(false), 200)}

// Pattern C: onMouseLeave
onMouseLeave={() => setIsOpen(false)}

// Pattern D: None (relies on parent)
```

**Issue**: Different approaches lead to different UX - some don't close properly.

---

## 📊 COMPLETE INVENTORY

### Components With Dropdowns

| Component | Location | Z-Index | Close Method | Issues |
|-----------|----------|---------|--------------|--------|
| **GlobalSearch** | `ui/GlobalSearch.tsx` | `z-[9999]` | onBlur + 150ms | Too high z-index |
| **Dropdown** | `ui/Dropdown.tsx` | `z-50` | Click outside | ✅ Good |
| **Select** | `ui/Select/Select.tsx` | `z-50` | Click outside | ✅ Good |
| **UserMenu** | `auth/UserMenu.tsx` | `z-[70]` | Click outside | ✅ Good |
| **FuzzySearchInput** | `playbook/AddNewPlayModal/...` | `z-10` | onBlur + 200ms | z-index too low |
| **ReactionButton** | `social/ReactionButton.tsx` | `z-10` | onMouseLeave | z-index too low |
| **CommentSection** | `social/CommentSection.tsx` | `z-10` | Click outside | z-index too low |
| **InlineEditField** | `ui/InlineEditField.tsx` | `z-50` | onBlur | ✅ Good |
| **PlayerControls** | `playbook/diagram-editor/...` | `z-50` | Click outside | ✅ Good |
| **Breadcrumb** | `ui/Breadcrumb/Breadcrumb.tsx` | `z-10` | Click outside | z-index too low |
| **PlaybookSelector** | `playbook/PlaybookSelector.tsx` | `z-[110]` | Click outside | Too high z-index |

---

## 🎯 ROOT CAUSES

### Why Dropdowns Keep Breaking

1. **No Standard Component** - Everyone implements their own
2. **No Z-Index Scale** - Random values lead to conflicts
3. **Timing Race Conditions** - onBlur fires before onClick
4. **Portal vs Non-Portal** - Some render in place, some use portals
5. **No Documentation** - No guide on how to implement dropdowns correctly

---

## 🏗️ RECOMMENDED Z-INDEX SCALE

**Standardized Z-Index System:**

```typescript
export const Z_INDEX_SCALE = {
  base: 0,
  dropdown: 50,        // ✅ All dropdowns should use this
  header: 60,          // AppHeader
  overlay: 70,         // Modals backdrop
  modal: 80,           // Modal content
  notification: 90,    // Toasts/alerts
  tooltip: 100,        // Tooltips (always on top)
  dev: 9999,          // Dev tools only
} as const;
```

---

## ✅ RECOMMENDED SOLUTION

### Create One Universal Dropdown Hook

```typescript
/**
 * useDropdown - Universal dropdown hook
 * Handles all dropdown logic consistently
 */
export function useDropdown(options?: {
  closeOnClick?: boolean;
  closeDelay?: number;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  // Consistent click-outside logic
  useEffect(() => {
    if (!isOpen || !options?.closeOnOutsideClick) return;

    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        contentRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    // Use timeout to avoid race condition with onClick
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, options?.closeOnOutsideClick]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !options?.closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, options?.closeOnEscape]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    triggerRef,
    contentRef,
  };
}
```

---

## 🛠️ REFACTORING PLAN

### Phase 1: Create Standard Components ✅

1. ✅ Create `useDropdown` hook
2. ✅ Create `DropdownMenu` compound component
3. ✅ Create Z-index constants file
4. ✅ Document dropdown best practices

### Phase 2: Migrate Components (Priority Order)

**High Priority (User-Facing):**
1. GlobalSearch - Fix z-index conflict
2. FuzzySearchInput - Fix timing issue
3. PlaybookSelector - Fix z-index too high
4. UserMenu - Standardize (mostly working)

**Medium Priority:**
5. ReactionButton - Fix z-index
6. CommentSection - Fix z-index
7. Breadcrumb - Fix z-index

**Low Priority:**
8. InlineEditField - Already good, just standardize
9. PlayerControls - Already good

### Phase 3: Documentation

1. Create "Dropdown Implementation Guide"
2. Add Storybook examples
3. Create migration guide for existing dropdowns

---

## 🎯 IMMEDIATE FIXES

### Fix #1: GlobalSearch Z-Index

**Current:**
```tsx
className="... z-[9999]"
```

**Should Be:**
```tsx
className="... z-50"  // Standard dropdown z-index
```

### Fix #2: Standardize Close Delay

**All dropdowns should use:**
```tsx
const DROPDOWN_CLOSE_DELAY = 150; // ms

setTimeout(() => setIsOpen(false), DROPDOWN_CLOSE_DELAY);
```

### Fix #3: Click-Outside Pattern

**Always use this pattern:**
```tsx
useEffect(() => {
  if (!isOpen) return;

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (
      triggerRef.current?.contains(target) ||
      contentRef.current?.contains(target)
    ) {
      return; // Click was inside
    }
    setIsOpen(false);
  };

  // Delay to avoid race with click handler
  const timer = setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
  }, 0);

  return () => {
    clearTimeout(timer);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen]);
```

---

## 📝 BEST PRACTICES GOING FORWARD

### ✅ DO:

1. **Use `useDropdown` hook** for all new dropdowns
2. **Use standard z-index** from constants (`Z_INDEX.dropdown`)
3. **Use 150ms close delay** for onBlur events
4. **Test keyboard navigation** (Tab, Escape, Arrow keys)
5. **Test click-outside** closing
6. **Test on mobile** (touch events)
7. **Add aria-* attributes** for accessibility

### ❌ DON'T:

1. **Don't use custom z-index values** - use constants
2. **Don't implement your own click-outside** - use hook
3. **Don't use onMouseLeave** for closing - unreliable
4. **Don't forget the close delay** - causes race conditions
5. **Don't render without a portal** for modals - positioning issues
6. **Don't forget Escape key handler**
7. **Don't test only on desktop** - mobile is different

---

## 🎓 LEARNING: Why Dropdowns Are Hard

### Common Pitfalls

1. **Timing Issues**: onClick fires before onBlur completes
2. **Z-Index Conflicts**: Dropdown appears behind other elements
3. **Portal Confusion**: When to use portals vs relative positioning
4. **Touch Events**: Mobile requires different handling
5. **Focus Management**: Keyboard users need proper focus flow
6. **Scroll Positioning**: Dropdown position updates on scroll
7. **Resize Handling**: Dropdown repositions on window resize

### The Solution

**Use a battle-tested library OR create ONE hook that handles all edge cases.**

We chose: **Create one `useDropdown` hook** + standardize patterns.

---

## 📈 SUCCESS METRICS

After refactoring, we should see:

- ✅ Zero z-index conflicts
- ✅ Consistent close timing (no race conditions)
- ✅ All dropdowns close on Escape
- ✅ All dropdowns close on click-outside
- ✅ Proper keyboard navigation
- ✅ Mobile-friendly touch handling
- ✅ Accessibility compliance (ARIA labels)

---

## 🚀 NEXT STEPS

1. **Create `useDropdown` hook** (30 min)
2. **Create z-index constants** (10 min)
3. **Fix GlobalSearch z-index** (5 min) ← **START HERE**
4. **Document dropdown best practices** (1 hour)
5. **Migrate high-priority components** (2 hours)

---

## 📚 RESOURCES

- [Radix UI Dropdown](https://www.radix-ui.com/docs/primitives/components/dropdown-menu) - Best practices
- [Headless UI Menu](https://headlessui.com/react/menu) - Reference implementation
- [Reach UI Menu Button](https://reach.tech/menu-button) - Accessibility patterns

---

**Summary**: We have **11+ dropdown implementations** with **inconsistent patterns**. Main issues are z-index conflicts and timing race conditions. Solution: Create one standard `useDropdown` hook and z-index scale.

**Priority**: Fix GlobalSearch first (user-facing), then standardize others.
