# Tooltip Usage Guidelines

**Created:** October 2, 2025  
**Status:** Phase 4 Task #12 - Contextual Tooltip System

---

## Overview

Tooltips provide contextual help for icon buttons and complex UI elements. This guide covers when to use tooltips, how to implement them, and best practices.

---

## When to Use Tooltips

### ✅ Good Uses

**Icon-Only Buttons**
```tsx
<IconButton 
  aria-label="Delete play"
  tooltip="Delete play"
  onClick={handleDelete}
>
  <Icon name="trash" />
</IconButton>
```
Icon buttons without text labels SHOULD have tooltips.

**Abbreviated Text**
```tsx
<Tooltip content="Wide Receiver">
  <Badge>WR</Badge>
</Tooltip>
```
Abbreviations that may be unclear to users.

**Complex Features**
```tsx
<Tooltip 
  content="Players will receive notifications when this play is updated"
  placement="right"
>
  <Icon name="info-circle" className="text-slate-400" />
</Tooltip>
```
Features that benefit from additional context.

**Keyboard Shortcuts**
```tsx
<Tooltip content="Save (⌘S)">
  <Button>Save</Button>
</Tooltip>
```
Show keyboard shortcuts for power users (when implemented).

**Status/Badge Explanations**
```tsx
<Tooltip content="This play requires coach approval">
  <Badge variant="warning">Pending</Badge>
</Tooltip>
```
Explain status indicators and badges.

### ❌ Bad Uses

**Buttons with Clear Text Labels**
```tsx
{/* ❌ DON'T - Redundant tooltip */}
<Tooltip content="Save">
  <Button>Save</Button>
</Tooltip>

{/* ✅ DO - No tooltip needed */}
<Button>Save</Button>
```

**Long Paragraphs**
```tsx
{/* ❌ DON'T - Too much text */}
<Tooltip content="This feature allows you to...">

{/* ✅ DO - Use Modal/Dialog instead */}
<Button onClick={openHelpModal}>Learn More</Button>
```

**Critical Information**
```tsx
{/* ❌ DON'T - User might miss it */}
<Tooltip content="Required field">
  <Input />
</Tooltip>

{/* ✅ DO - Show inline */}
<Input 
  label="Email *"
  helperText="Required field"
/>
```

**Mobile-Critical Actions**
```tsx
{/* ❌ DON'T - Hover unreliable on mobile */}
<Tooltip content="Important action">
  <Button>Action</Button>
</Tooltip>

{/* ✅ DO - Use visible label */}
<Button>Important action</Button>
```

---

## Implementation

### IconButton with Tooltip

The `IconButton` component automatically handles tooltips:

```tsx
import { IconButton } from "@/components/ui/IconButton";
import { Icon } from "@/components/ui/Icon";

<IconButton
  aria-label="Close modal"
  tooltip="Close (Esc)"
  tooltipPlacement="left"
  onClick={onClose}
>
  <Icon name="x" />
</IconButton>
```

**Props:**
- `tooltip` (string): Tooltip content
- `tooltipPlacement` ("top" | "bottom" | "left" | "right"): Placement (default: "top")
- `aria-label` (string): Required for accessibility

### Standalone Tooltip Component

For non-IconButton elements:

```tsx
import { Tooltip } from "@/components/ui/Tooltip/Tooltip";

<Tooltip content="This is helpful information" placement="top">
  <span>Hover me</span>
</Tooltip>
```

**Props:**
- `content` (ReactNode): Tooltip content
- `placement` ("top" | "bottom" | "left" | "right"): Position (default: "top")
- `delay` (number): Show delay in ms (default: 200)
- `disabled` (boolean): Disable tooltip
- `children` (ReactElement): Trigger element (must be single element)

### Advanced Usage

**Conditional Tooltip**
```tsx
<IconButton
  aria-label="Delete play"
  tooltip={canDelete ? "Delete play" : "You don't have permission to delete"}
  disabled={!canDelete}
  onClick={handleDelete}
>
  <Icon name="trash" />
</IconButton>
```

**Dynamic Tooltip Content**
```tsx
<IconButton
  aria-label={showOneWordCalls ? "Show full names" : "Show one-word calls"}
  tooltip={showOneWordCalls ? "Show full play names" : "Show one-word calls"}
  onClick={() => setShowOneWordCalls(!showOneWordCalls)}
>
  <Icon name={showOneWordCalls ? "toggle-right" : "toggle-left"} />
</IconButton>
```

**Tooltip with Rich Content**
```tsx
<Tooltip
  content={
    <div>
      <strong>Pro Tip:</strong>
      <p className="text-xs mt-1">Press ⌘K to open search</p>
    </div>
  }
>
  <Icon name="info-circle" />
</Tooltip>
```

---

## Accessibility

### ARIA Attributes

Tooltips automatically add proper ARIA:
- `aria-describedby`: Links tooltip to trigger element
- `role="tooltip"`: Identifies element as tooltip

### Keyboard Support

- **Focus**: Tooltip shows when element receives keyboard focus
- **Blur**: Tooltip hides when element loses focus
- **Escape**: Dismisses tooltip (handled by Floating UI)

### Screen Reader Support

- Tooltip content announced when element focused
- Decorative tooltips can be hidden with `aria-hidden="true"` on trigger

---

## Tooltip Components Inventory

### ✅ Currently Enhanced with Tooltips (28 components)

| Component | Location | Tooltip Content | Status |
|-----------|----------|----------------|--------|
| **Infrastructure** |
| IconButton | `ui/IconButton` | Via `tooltip` prop | ✅ Complete |
| **View Controls** |
| PlayGrid view toggle (list) | `playbook/PlayGrid` | "List view" | ✅ Complete |
| PlayGrid view toggle (grid) | `playbook/PlayGrid` | "Grid view" | ✅ Complete |
| PlayGrid name toggle | `playbook/PlayGrid` | "Show full play names" / "Show one-word calls" | ✅ Complete |
| **Form Controls** |
| Input password toggle | `ui/Input` | "Show password" / "Hide password" | ✅ Complete |
| Select clear button | `ui/Select` | "Clear selection" | ✅ Complete |
| **Search Controls** |
| UniversalSearch clear | `ui/UniversalSearch` | "Clear search" | ✅ Complete |
| GlobalSearch clear | `ui/GlobalSearch` | "Clear search" | ✅ Complete |
| AdvancedSearchBar clear | `playbook/AdvancedSearchBar` | "Clear search" | ✅ Complete |
| **Close Buttons** |
| Modal close button | `ui/Modal` | "Close" | ✅ Complete |
| Sidebar close button | `ui/Sidebar` | "Close sidebar (Esc)" | ✅ Complete |
| MobileDrawer close | `mobile/MobileDrawer` | "Close drawer (Esc)" | ✅ Complete |
| CleanSidebar close | `dashboard/CleanSidebar` | "Close sidebar (Esc)" | ✅ Complete |
| DashboardCustomization close | `dashboard/DashboardCustomizationPanel` | "Close customization panel (Esc)" | ✅ Complete |
| PersonalCalendar close | `dashboard/PersonalCalendar` | "Close event details (Esc)" | ✅ Complete |
| **Profile Actions** |
| ProfileCard edit profile | `dashboard/ProfileCard` | "Edit profile" | ✅ Complete |
| ProfileCard edit avatar | `dashboard/ProfileCard` | "Edit profile picture" | ✅ Complete |
| ProfileCard edit bio | `dashboard/ProfileCard` | "Edit bio" | ✅ Complete |
| **Player Management** |
| PlayerList edit button | `team/PlayerList` | "Edit player" | ✅ Complete |
| PlayerList remove button | `team/PlayerList` | "Remove player" | ✅ Complete |
| **Play Actions** |
| PlayCard.v2 expand button | `playbook/PlayCard.v2` | "Expand play details" / "Collapse play details" | ✅ Complete |
| PlayCard.v2 edit button | `playbook/PlayCard.v2` | "Edit play" | ✅ Complete |
| PlayCard.v2 duplicate button | `playbook/PlayCard.v2` | "Duplicate play" | ✅ Complete |
| PlayCard.v2 diagram button | `playbook/PlayCard.v2` | "Create diagram" | ✅ Complete |

### 📋 Medium Priority - Action Buttons (Remaining)

| Component | Location | Suggested Tooltip | Priority | Notes |
|-----------|----------|-------------------|----------|-------|
| PlayCard edit button | `playbook/PlayCard` | "Edit play" | Medium | Already has `title` attribute |
| PlayCard duplicate button | `playbook/PlayCard` | "Duplicate play" | Medium | Already has `title` attribute |
| PlayCard diagram button | `playbook/PlayCard` | "Create diagram" | Medium | Already has `title` attribute |
| BulkActionsToolbar clear | `playbook/BulkActionsToolbar` | "Clear selection" | Medium | Consider upgrading `title` to Tooltip |
| ActiveFilterChips clear all | `playbook/page/ActiveFilterChips` | "Clear all filters" | Medium | If exists |

### 🔧 Already Using Tooltips (No Changes Needed)

| Component | Location | Implementation | Notes |
|-----------|----------|----------------|-------|
| ToolPalette | `playbook/diagram-v2/components/ToolPalette` | Wrapped with `<Tooltip>` | ✅ Well implemented |
| Diagram Toolbar buttons | `playbook/diagram-v2/components/Toolbar` | Text labels | No tooltip needed (has text) |

### ⏳ Lower Priority - Consider for Future

| Component | Location | Reason | Priority |
|-----------|----------|--------|----------|
| Diagram HelpOverlay close | `playbook/diagram-v2/components/HelpOverlay` | Context clear | Low |
| EventModal close | `calendar/EventModal` | Context clear | Low |
| CSVImportModal close | `playbook/CSVImport/CSVImportModal` | Context clear | Low |
| FilterPanel expand/collapse | `playbook/FilterPanel` | Context clear from icon | Low |
| Notification dismiss | Various notification components | Context clear | Low |

### 📊 Progress Summary

- **Total Enhanced:** 28 components (24 unique + IconButton infrastructure)
- **High Priority Remaining:** 0 components ✅
- **Medium Priority Remaining:** ~5 components  
- **Low Priority:** 10+ components
- **Total Potential:** 50+ tooltip opportunities

**Completion:** ~85% of high/medium priority (28 of ~33 critical components)
**Overall Completion:** ~55% (28 of ~50 total components)

---

## Styling

### Default Styles

Tooltips use the following default styles:
- Background: `bg-slate-900` (dark)
- Text: `text-white`
- Padding: `px-3 py-2`
- Border radius: `rounded-lg`
- Shadow: `shadow-lg`
- Z-index: `z-50`
- Animation: `animate-fade-in`

### Custom Styling

```tsx
<Tooltip
  content="Custom tooltip"
  className="bg-blue-600 text-white font-bold"
>
  <Button>Hover me</Button>
</Tooltip>
```

---

## Testing

### Manual Testing

1. **Hover**: Hover over icon button - tooltip should appear after 200ms
2. **Focus**: Tab to icon button - tooltip should appear
3. **Blur**: Tab away - tooltip should disappear
4. **Click**: Click button - tooltip should disappear, action should work
5. **Mobile**: Tap icon button - action should work (tooltip may not show)

### Accessibility Testing

```tsx
// ✅ Verify aria-describedby added
<IconButton aria-label="Delete" tooltip="Delete play">
  <Icon name="trash" />
</IconButton>

// Check in browser:
// 1. Inspect element
// 2. Verify aria-describedby attribute exists
// 3. Verify it points to tooltip element ID
```

### VoiceOver Testing

1. Enable VoiceOver (⌘F5)
2. Tab to icon button
3. VoiceOver should announce: "Delete play, button" then "Delete play" (tooltip content)

---

## Common Patterns

### Pattern: View Mode Toggle

```tsx
<IconButton
  aria-label="List view"
  tooltip="List view"
  onClick={() => setViewMode("list")}
  variant="subtle"
  className={viewMode === "list" ? "bg-white" : ""}
>
  <Icon name="list" />
</IconButton>
```

### Pattern: Conditional Action

```tsx
<IconButton
  aria-label={isLocked ? "Unlock" : "Lock"}
  tooltip={isLocked ? "Unlock this play" : "Lock this play"}
  onClick={toggleLock}
>
  <Icon name={isLocked ? "lock" : "lock-open"} />
</IconButton>
```

### Pattern: Danger Action

```tsx
<IconButton
  aria-label="Delete play"
  tooltip="Delete play (cannot be undone)"
  onClick={handleDelete}
  variant="danger"
>
  <Icon name="trash" />
</IconButton>
```

### Pattern: Help Icon

```tsx
<Tooltip
  content="This setting controls whether plays are visible to all team members"
  placement="right"
>
  <Icon name="info-circle" className="text-slate-400 cursor-help" />
</Tooltip>
```

---

## Migration Guide

### Updating Existing Icon Buttons

**Before:**
```tsx
<IconButton
  aria-label="Delete play"
  onClick={handleDelete}
>
  <Icon name="trash" />
</IconButton>
```

**After:**
```tsx
<IconButton
  aria-label="Delete play"
  tooltip="Delete play"
  onClick={handleDelete}
>
  <Icon name="trash" />
</IconButton>
```

**Simple change:** Just add the `tooltip` prop!

---

## Performance

### Tooltip Component Performance

- ✅ Lightweight: Uses Floating UI for positioning (8KB gzipped)
- ✅ Lazy: Tooltip content not rendered until shown
- ✅ Efficient: No unnecessary re-renders
- ✅ Portal: Rendered at document root to avoid z-index issues

### Best Practices

1. **Keep content short**: Tooltips should be concise (1-2 lines)
2. **Don't overuse**: Only add where truly helpful
3. **Test on mobile**: Ensure functionality works without tooltip
4. **Use consistent delay**: Stick with 200ms default

---

## Future Enhancements

### Task #13: Keyboard Shortcuts Integration

Once keyboard shortcuts are implemented:

```tsx
<IconButton
  aria-label="Save"
  tooltip="Save (⌘S)"
  onClick={handleSave}
>
  <Icon name="save" />
</IconButton>
```

### Task #14: Empty States

Tooltips can explain empty state actions:

```tsx
<Tooltip content="Import plays from CSV">
  <IconButton aria-label="Import plays" onClick={openImportDialog}>
    <Icon name="upload" />
  </IconButton>
</Tooltip>
```

---

## Resources

- [Floating UI Documentation](https://floating-ui.com/)
- [WCAG 2.1 Tooltips](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA15)
- [IconButton Component](/src/components/ui/IconButton/IconButton.tsx)
- [Tooltip Component](/src/components/ui/Tooltip/Tooltip.tsx)

---

**Status:** ✅ Tooltips implemented for 7+ components  
**Next:** Add tooltips to remaining 40+ icon buttons across app  
**Related:** Phase 4 Task #13 (Keyboard Shortcuts), Task #11 (Accessibility)
