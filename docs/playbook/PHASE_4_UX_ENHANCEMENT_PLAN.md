# Phase 4: UX Enhancement & Polish

**Estimated Time:** 12 hours  
**Focus:** User experience, accessibility, and interaction refinement  
**Goal:** Create an intuitive, accessible, and delightful user experience

---

## 📋 Tasks Overview

| #   | Task                              | Est. Time | Priority | Status     |
| --- | --------------------------------- | --------- | -------- | ---------- |
| 11  | Enhanced Accessibility (ARIA)     | 3h        | High     | 🔄 Next    |
| 12  | Contextual Tooltip System         | 2h        | High     | ⏳ Pending |
| 13  | Keyboard Navigation Polish        | 2h        | High     | ⏳ Pending |
| 14  | Empty State Illustrations         | 2h        | Medium   | ⏳ Pending |
| 15  | Bulk Operations UI                | 3h        | Medium   | ⏳ Pending |

---

## Task #11: Enhanced Accessibility (ARIA)

**Current Issue:**

- Missing ARIA labels on interactive elements
- Insufficient focus management in modals/dialogs
- Screen reader navigation unclear
- Keyboard focus indicators inconsistent
- Missing landmark roles

**Goal:**
Achieve WCAG 2.1 AA compliance with excellent screen reader support

### Subtasks:

#### 11.1 Audit Current Accessibility

- [ ] Run automated accessibility scan (axe-core, Lighthouse)
- [ ] Manual keyboard navigation test
- [ ] Screen reader testing (VoiceOver/NVDA)
- [ ] Document all accessibility violations
- [ ] Create priority list based on severity

**Priority Issues to Check:**
- Form controls without labels
- Buttons without accessible names
- Missing focus indicators
- Improper heading hierarchy
- Modal focus traps
- Dynamic content without ARIA live regions

#### 11.2 ARIA Labels & Roles

**Components to Enhance:**

```typescript
// IconButton.tsx - Add aria-label
<button
  aria-label={ariaLabel || title}
  aria-describedby={description ? `${id}-desc` : undefined}
  {...props}
>
  <Icon name={icon} aria-hidden="true" />
</button>

// Modal.tsx - Add proper ARIA roles
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby={`${id}-title`}
  aria-describedby={`${id}-description`}
>
  <h2 id={`${id}-title`}>{title}</h2>
  <div id={`${id}-description`}>{children}</div>
</div>

// Navigation - Add landmark roles
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/playbook" aria-current="page">Playbook</a></li>
  </ul>
</nav>

// Toast notifications - Add live region
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {message}
</div>
```

**Components to Update:**
- [ ] IconButton - aria-label, aria-describedby
- [ ] Button - aria-busy, aria-disabled states
- [ ] Modal/Dialog - role, aria-modal, aria-labelledby
- [ ] Dropdown - aria-haspopup, aria-expanded
- [ ] Tabs - aria-selected, aria-controls
- [ ] Form fields - aria-invalid, aria-describedby
- [ ] Toast - aria-live regions
- [ ] Navigation - aria-current, aria-label

#### 11.3 Focus Management

**Focus Trap Implementation:**

```typescript
// useFocusTrap.ts - New hook
import { useEffect, useRef } from "react";

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element on mount
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    return () => container.removeEventListener("keydown", handleTabKey);
  }, [isActive]);

  return containerRef;
}
```

**Components to Update:**
- [ ] Modal - useFocusTrap, restore focus on close
- [ ] Dropdown - Focus first item when opened
- [ ] Dialog - Focus primary action button
- [ ] Sidebar - Focus close button when opened

#### 11.4 Focus Indicators

**Create Consistent Focus Styles:**

```css
/* In generated-tokens.css */
:root {
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-color: var(--aurora-500);
}

/* Global focus styles */
:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Glass component focus */
.glass-card:focus-within {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

**Tailwind Config:**

```javascript
// Add focus utilities
theme: {
  extend: {
    ringWidth: {
      'focus': 'var(--focus-ring-width)',
    },
    ringOffsetWidth: {
      'focus': 'var(--focus-ring-offset)',
    },
    ringColor: {
      'focus': 'var(--focus-ring-color)',
    },
  },
}
```

#### 11.5 Screen Reader Enhancements

**Skip Links:**

```typescript
// SkipLinks.tsx - New component
export function SkipLinks() {
  return (
    <div className="sr-only focus:not-sr-only">
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
    </div>
  );
}
```

**Visually Hidden Text:**

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Components to Add Screen Reader Text:**
- [ ] IconButton - Add sr-only label when no text
- [ ] LoadingSpinner - Add "Loading..." text
- [ ] Icon - Add aria-label or aria-hidden
- [ ] Badge counts - Add descriptive text
- [ ] Status indicators - Add status text

**Deliverables:**

- ✅ Automated accessibility scan report
- ✅ ARIA labels on all interactive elements
- ✅ Focus trap in modals/dialogs
- ✅ Consistent focus indicators
- ✅ Screen reader testing passed
- ✅ Skip links implemented
- ✅ Accessibility documentation

---

## Task #12: Contextual Tooltip System

**Current Issue:**

- No tooltips for icon-only buttons
- Missing help text for complex features
- Inconsistent tooltip styling
- No keyboard access to tooltips

**Goal:**
Unified tooltip system for contextual help throughout the app

### Subtasks:

#### 12.1 Create Tooltip Component

```typescript
// components/ui/Tooltip/Tooltip.tsx
import { useState, useRef, useId } from "react";
import { usePopper } from "react-popper";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  placement = "top",
  delay = 200,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number>();
  const tooltipId = useId();

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: "offset", options: { offset: [0, 8] } },
      { name: "preventOverflow", options: { padding: 8 } },
    ],
  });

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <>
      {cloneElement(children, {
        ref: setReferenceElement,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
        "aria-describedby": isVisible ? tooltipId : undefined,
      })}
      {isVisible && (
        <div
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          id={tooltipId}
          role="tooltip"
          className="z-50 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg shadow-lg animate-fade-in"
        >
          {content}
          <div className="tooltip-arrow" data-popper-arrow />
        </div>
      )}
    </>
  );
}
```

#### 12.2 Tooltip Styles

```css
/* In generated-tokens.css */
:root {
  --tooltip-bg: var(--slate-900);
  --tooltip-text: var(--white);
  --tooltip-shadow: var(--shadow-lg);
  --tooltip-radius: var(--radius-lg);
  --tooltip-padding-x: var(--space-3);
  --tooltip-padding-y: var(--space-2);
}

.tooltip-arrow {
  width: 8px;
  height: 8px;
  background: var(--tooltip-bg);
  transform: rotate(45deg);
}

[data-popper-placement^="top"] .tooltip-arrow {
  bottom: -4px;
}

[data-popper-placement^="bottom"] .tooltip-arrow {
  top: -4px;
}

[data-popper-placement^="left"] .tooltip-arrow {
  right: -4px;
}

[data-popper-placement^="right"] .tooltip-arrow {
  left: -4px;
}
```

#### 12.3 Integrate Tooltips

**High-Priority Components:**

- [ ] IconButton - All icon-only buttons get tooltips
- [ ] Toolbar actions - Tooltips for all action buttons
- [ ] Badge indicators - Explain badge meanings
- [ ] Complex form fields - Add help text tooltips
- [ ] Status indicators - Explain status meanings
- [ ] Navigation icons - Label nav items
- [ ] Keyboard shortcuts - Show shortcut hints

**Example Integrations:**

```typescript
// IconButton with tooltip
<Tooltip content="Delete play">
  <IconButton icon="trash" variant="ghost" aria-label="Delete play" />
</Tooltip>

// Complex feature with help tooltip
<Tooltip
  content="Players will receive notifications when this play is updated"
  placement="right"
>
  <Icon name="info-circle" className="text-slate-400" />
</Tooltip>

// Keyboard shortcut hint
<Tooltip content="Save (⌘S)">
  <Button>Save</Button>
</Tooltip>
```

#### 12.4 Tooltip Guidelines

**When to Use Tooltips:**

✅ **Good Uses:**
- Icon-only buttons without text labels
- Abbreviated text that needs expansion
- Keyboard shortcuts for power users
- Help text for complex features
- Status/badge explanations

❌ **Bad Uses:**
- Buttons with clear text labels (redundant)
- Long paragraphs of text (use help dialog instead)
- Critical information (should be visible always)
- Mobile devices (unreliable hover states)

**Deliverables:**

- ✅ Tooltip component created
- ✅ Keyboard accessible (focus triggers tooltip)
- ✅ Popper.js integration for smart positioning
- ✅ 50+ tooltips added across app
- ✅ Mobile-friendly (tap to show on touch devices)
- ✅ Tooltip usage guidelines

---

## Task #13: Keyboard Navigation Polish

**Current Issue:**

- Inconsistent keyboard shortcuts
- No keyboard shortcuts documentation
- Missing keyboard access to some features
- Tab order not logical
- No visual keyboard hints

**Goal:**
Complete keyboard navigation support with discoverable shortcuts

### Subtasks:

#### 13.1 Define Keyboard Shortcuts

**Global Shortcuts:**

| Shortcut    | Action                | Context |
| ----------- | --------------------- | ------- |
| `⌘K` / `^K` | Open command palette  | Global  |
| `⌘S` / `^S` | Save current form     | Forms   |
| `/`         | Focus search          | Global  |
| `Esc`       | Close modal/dropdown  | Modals  |
| `?`         | Show keyboard help    | Global  |
| `⌘N` / `^N` | New play/item         | Context |
| `⌘E` / `^E` | Edit current item     | Context |
| `⌘D` / `^D` | Delete current item   | Context |

**Navigation Shortcuts:**

| Shortcut | Action             |
| -------- | ------------------ |
| `g h`    | Go to home         |
| `g p`    | Go to playbook     |
| `g r`    | Go to roster       |
| `g a`    | Go to analytics    |
| `g s`    | Go to settings     |

**List Navigation:**

| Shortcut | Action                |
| -------- | --------------------- |
| `↑` `↓`  | Navigate list items   |
| `Enter`  | Select/open item      |
| `Space`  | Toggle selection      |
| `⌘A`     | Select all            |
| `⌘⇧A`    | Deselect all          |

#### 13.2 useKeyboardShortcut Hook

```typescript
// hooks/useKeyboardShortcut.ts
import { useEffect } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: (e: KeyboardEvent) => void;
  description?: string;
  disabled?: boolean;
}

export function useKeyboardShortcut({
  key,
  ctrl = false,
  meta = false,
  shift = false,
  alt = false,
  callback,
  disabled = false,
}: ShortcutConfig) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const matchesModifiers =
        e.ctrlKey === ctrl &&
        e.metaKey === meta &&
        e.shiftKey === shift &&
        e.altKey === alt;

      if (e.key.toLowerCase() === key.toLowerCase() && matchesModifiers) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [key, ctrl, meta, shift, alt, callback, disabled]);
}
```

#### 13.3 Keyboard Shortcuts Manager

```typescript
// components/KeyboardShortcutsDialog.tsx
import { Dialog } from "./ui/Dialog";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], description: "Open command palette", category: "General" },
  { keys: ["⌘", "S"], description: "Save", category: "General" },
  { keys: ["/"], description: "Focus search", category: "General" },
  { keys: ["?"], description: "Show this help", category: "General" },
  // ... more shortcuts
];

export function KeyboardShortcutsDialog({ isOpen, onClose }: Props) {
  const categories = [...new Set(SHORTCUTS.map((s) => s.category))];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {category}
            </h3>
            <div className="space-y-2">
              {SHORTCUTS.filter((s) => s.category === category).map((shortcut) => (
                <div key={shortcut.description} className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    {shortcut.description}
                  </span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
```

#### 13.4 Implement Shortcuts

**Components to Update:**

- [ ] PlaybookPage - ⌘N for new play
- [ ] PlayCard - Enter to open, Space to select
- [ ] Modal forms - ⌘S to save
- [ ] Search - / to focus
- [ ] Navigation - g+h/p/r/a/s shortcuts
- [ ] Command palette - ⌘K to open
- [ ] Global - ? for shortcuts help

**Example Implementation:**

```typescript
// PlaybookPage.tsx
function PlaybookPage() {
  const navigate = useNavigate();

  // ⌘N to create new play
  useKeyboardShortcut({
    key: "n",
    meta: true,
    callback: () => navigate("/playbook/new"),
    description: "Create new play",
  });

  // / to focus search
  useKeyboardShortcut({
    key: "/",
    callback: () => {
      document.getElementById("search-input")?.focus();
    },
    description: "Focus search",
  });

  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

#### 13.5 Tab Order Optimization

**Guidelines:**

1. **Logical Flow:** Tab order should follow visual layout (top→bottom, left→right)
2. **Skip Repetitive Elements:** Use skip links for long navigation
3. **Modal Focus Management:** First focusable element gets focus
4. **Return Focus:** Restore focus when modal closes

**Components to Review:**

- [ ] Forms - Ensure logical tab order
- [ ] Cards - Tab through actions efficiently
- [ ] Tables - Keyboard navigation between cells
- [ ] Modals - Proper focus trap and restoration

**Deliverables:**

- ✅ 20+ keyboard shortcuts implemented
- ✅ useKeyboardShortcut hook created
- ✅ Keyboard shortcuts dialog with help
- ✅ Visual keyboard hints (kbd elements)
- ✅ Logical tab order throughout
- ✅ Keyboard navigation documentation

---

## Task #14: Empty State Illustrations

**Current Issue:**

- Plain text empty states lack visual interest
- No guidance on what to do next
- Inconsistent empty state messaging
- Missing illustrations

**Goal:**
Engaging empty states with illustrations, clear messaging, and CTAs

### Subtasks:

#### 14.1 Design Empty State System

**Empty State Component:**

```typescript
// components/ui/EmptyState/EmptyState.tsx
interface EmptyStateProps {
  illustration: "no-plays" | "no-players" | "no-results" | "error" | "maintenance";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Illustration */}
      <div className="mb-6 w-64 h-64">
        <EmptyStateIllustration type={illustration} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>

      {/* Actions */}
      <div className="flex gap-3">
        {action && (
          <Button onClick={action.onClick} leftIcon={action.icon}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
```

#### 14.2 Create Illustrations

**Illustration Options:**

1. **Use Existing Library:**
   - [unDraw](https://undraw.co/) - Customizable, MIT licensed
   - [Humaaans](https://www.humaaans.com/) - Mix-and-match people
   - [Storyset](https://storyset.com/) - Animated illustrations

2. **Create Simple SVG Icons:**
   - Abstract shapes that represent the concept
   - Match Aurora design system colors
   - Animated with CSS transitions

**Empty State Types Needed:**

- [ ] No plays in playbook - Football/clipboard illustration
- [ ] No players on roster - Team/group illustration
- [ ] No search results - Magnifying glass illustration
- [ ] Error state - Warning/error illustration
- [ ] Offline/maintenance - Construction illustration
- [ ] No analytics data - Chart/graph illustration
- [ ] Permission denied - Lock illustration

#### 14.3 Empty State Messaging

**Messaging Guidelines:**

✅ **Good Empty States:**
- **Specific:** "No plays in your playbook yet"
- **Helpful:** "Create your first play to get started"
- **Action-oriented:** Clear CTA button

❌ **Bad Empty States:**
- **Vague:** "No data"
- **Technical:** "Query returned 0 results"
- **Dead-end:** No suggestion on what to do

**Empty State Template:**

```typescript
<EmptyState
  illustration="no-plays"
  title="No plays yet"
  description="Your playbook is empty. Create your first play to start building your game strategy."
  action={{
    label: "Create First Play",
    onClick: () => navigate("/playbook/new"),
    icon: "plus",
  }}
  secondaryAction={{
    label: "Import Sample Plays",
    onClick: () => setShowImportDialog(true),
  }}
/>
```

#### 14.4 Update Components

**Components to Add Empty States:**

- [ ] PlaybookPage - No plays
- [ ] RosterPage - No players
- [ ] AnalyticsDashboard - No data
- [ ] Search results - No matches
- [ ] TeamBulletin - No posts
- [ ] ActivityFeed - No activity
- [ ] TagsList - No tags
- [ ] PlayCategories - No categories

**Example Implementation:**

```typescript
// PlaybookPage.tsx
function PlaybookPage() {
  const { plays, isLoading } = usePlays();

  if (isLoading) return <PlaybookSkeleton />;

  if (plays.length === 0) {
    return (
      <EmptyState
        illustration="no-plays"
        title="No plays in your playbook"
        description="Start building your game strategy by creating your first play. You can also import sample plays to get started quickly."
        action={{
          label: "Create Play",
          onClick: () => navigate("/playbook/new"),
          icon: "plus",
        }}
        secondaryAction={{
          label: "Import Samples",
          onClick: () => setShowImportDialog(true),
        }}
      />
    );
  }

  return <PlaybookGrid plays={plays} />;
}
```

**Deliverables:**

- ✅ EmptyState component created
- ✅ 8+ illustrations added (unDraw or custom)
- ✅ Empty states in all key sections
- ✅ Clear messaging with helpful CTAs
- ✅ Consistent visual style
- ✅ Empty state guidelines documented

---

## Task #15: Bulk Operations UI

**Current Issue:**

- No multi-select for plays/players
- Can't bulk delete/tag/move items
- Tedious one-at-a-time operations
- No bulk action feedback

**Goal:**
Efficient bulk operations with clear selection and feedback

### Subtasks:

#### 15.1 Multi-Select Component

```typescript
// components/ui/SelectableCard/SelectableCard.tsx
interface SelectableCardProps {
  id: string;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  children: React.ReactNode;
}

export function SelectableCard({
  id,
  selected,
  onSelect,
  children,
}: SelectableCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border-2 transition-all cursor-pointer",
        selected
          ? "border-aurora-500 ring-2 ring-aurora-200 bg-aurora-50"
          : "border-transparent hover:border-slate-200"
      )}
      onClick={() => onSelect(id, !selected)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-3 right-3 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(id, e.target.checked);
          }}
          className="h-5 w-5 rounded border-slate-300 text-aurora-600 focus:ring-aurora-500"
          aria-label={`Select item ${id}`}
        />
      </div>

      {/* Card content */}
      {children}
    </div>
  );
}
```

#### 15.2 Bulk Actions Toolbar

```typescript
// components/ui/BulkActionsToolbar/BulkActionsToolbar.tsx
interface BulkAction {
  id: string;
  label: string;
  icon: IconName;
  variant?: "default" | "danger";
  onClick: (selectedIds: string[]) => void;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  actions,
  onSelectAll,
  onClearSelection,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-card px-4 py-3 rounded-full shadow-xl animate-slide-up">
        <div className="flex items-center gap-4">
          {/* Selection count */}
          <div className="text-sm font-medium text-slate-700">
            {selectedCount} selected
          </div>

          {/* Select all / Clear */}
          <div className="flex gap-2">
            {selectedCount < totalCount && (
              <Button size="sm" variant="ghost" onClick={onSelectAll}>
                Select All ({totalCount})
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClearSelection}>
              Clear
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Actions */}
          <div className="flex gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant === "danger" ? "danger" : "default"}
                leftIcon={action.icon}
                onClick={() => action.onClick(selectedIds)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 15.3 useMultiSelect Hook

```typescript
// hooks/useMultiSelect.ts
import { useState, useCallback } from "react";

export function useMultiSelect<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectRange = useCallback(
    (startId: string, endId: string) => {
      const startIndex = items.findIndex((item) => item.id === startId);
      const endIndex = items.findIndex((item) => item.id === endId);

      if (startIndex === -1 || endIndex === -1) return;

      const [start, end] = [startIndex, endIndex].sort((a, b) => a - b);
      const rangeIds = items.slice(start, end + 1).map((item) => item.id);

      setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
    },
    [items]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isSelected,
    toggleSelect,
    selectAll,
    clearSelection,
    selectRange,
  };
}
```

#### 15.4 Implement Bulk Operations

**Playbook Bulk Operations:**

```typescript
// PlaybookPage.tsx
function PlaybookPage() {
  const { plays } = usePlays();
  const {
    selectedIds,
    selectedCount,
    isSelected,
    toggleSelect,
    selectAll,
    clearSelection,
  } = useMultiSelect(plays);

  const bulkActions: BulkAction[] = [
    {
      id: "tag",
      label: "Add Tags",
      icon: "tag",
      onClick: (ids) => setShowBulkTagDialog(true),
    },
    {
      id: "move",
      label: "Move to Category",
      icon: "folder",
      onClick: (ids) => setShowMoveCategoryDialog(true),
    },
    {
      id: "export",
      label: "Export",
      icon: "download",
      onClick: (ids) => handleBulkExport(ids),
    },
    {
      id: "delete",
      label: "Delete",
      icon: "trash",
      variant: "danger",
      onClick: (ids) => handleBulkDelete(ids),
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {plays.map((play) => (
          <SelectableCard
            key={play.id}
            id={play.id}
            selected={isSelected(play.id)}
            onSelect={toggleSelect}
          >
            <PlayCard play={play} />
          </SelectableCard>
        ))}
      </div>

      <BulkActionsToolbar
        selectedCount={selectedCount}
        totalCount={plays.length}
        actions={bulkActions}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
```

**Roster Bulk Operations:**

- [ ] Bulk add players to teams
- [ ] Bulk update player positions
- [ ] Bulk export player data
- [ ] Bulk delete players

**Bulk Operation Features:**

- [ ] Multi-select with checkboxes
- [ ] Shift+Click for range selection
- [ ] ⌘+A to select all
- [ ] Floating action toolbar
- [ ] Bulk operation confirmation dialogs
- [ ] Progress indicators for long operations
- [ ] Undo functionality for bulk deletes

#### 15.5 Bulk Operation Feedback

**Progress Dialog:**

```typescript
// components/BulkOperationProgress.tsx
interface BulkOperationProgressProps {
  operation: string;
  processed: number;
  total: number;
  onCancel?: () => void;
}

export function BulkOperationProgress({
  operation,
  processed,
  total,
  onCancel,
}: BulkOperationProgressProps) {
  const percentage = (processed / total) * 100;

  return (
    <Dialog isOpen={true} onClose={() => {}} title={operation}>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Processing {processed} of {total}...
          </span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-aurora-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        )}
      </div>
    </Dialog>
  );
}
```

**Deliverables:**

- ✅ Multi-select system implemented
- ✅ Bulk actions toolbar component
- ✅ useMultiSelect hook created
- ✅ Playbook bulk operations (tag, move, export, delete)
- ✅ Roster bulk operations (add to team, update, export, delete)
- ✅ Bulk operation progress indicators
- ✅ Confirmation dialogs for destructive actions
- ✅ Keyboard shortcuts (⌘A, Shift+Click range select)

---

## 📊 Success Metrics

| Metric                     | Target         | Measurement                 |
| -------------------------- | -------------- | --------------------------- |
| Accessibility Score        | 95+ (Lighthouse) | Automated audit           |
| Keyboard Shortcuts         | 20+ shortcuts  | Feature count               |
| Tooltips Added             | 50+ tooltips   | Component scan              |
| Empty States               | 100% coverage  | Page audit                  |
| Bulk Operations            | 2+ sections    | Feature implementation      |
| ARIA Labels                | 100% interactive | Accessibility scan        |
| Focus Management           | All modals     | Manual test                 |
| Screen Reader Pass         | VoiceOver/NVDA | Manual test                 |

---

## 🎨 UX Principles

1. **Discoverability** - Features are easy to find and understand
2. **Efficiency** - Common tasks are fast (keyboard shortcuts, bulk operations)
3. **Feedback** - Clear feedback for all actions (loading, success, errors)
4. **Forgiveness** - Easy to undo mistakes, confirm destructive actions
5. **Accessibility** - Usable by everyone (keyboard, screen reader, focus)

---

## 📝 Documentation Deliverables

- [ ] Accessibility Testing Report
- [ ] Keyboard Shortcuts Reference
- [ ] Tooltip Usage Guidelines
- [ ] Empty State Design Patterns
- [ ] Bulk Operations User Guide
- [ ] ARIA Implementation Guide
- [ ] Focus Management Best Practices

---

## 🚀 Next Steps After Phase 4

**Phase 5 - Performance Optimization** (8 hours):

- Virtual scrolling for large lists
- Image optimization and lazy loading
- Bundle size optimization
- Database query optimization
- Caching strategy implementation
- Web vitals monitoring

**Phase 6 - Advanced Features** (15 hours):

- Real-time collaboration (play editing)
- Advanced analytics dashboards
- Video integration
- Export/import improvements
- Mobile app enhancements
- Offline support

---

**Ready to start Task #11: Enhanced Accessibility?** ♿️
