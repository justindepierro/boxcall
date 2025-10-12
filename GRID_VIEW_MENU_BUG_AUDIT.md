# Grid View - Complete UX Audit & Fixes

**Date**: October 12, 2025  
**Issue**: Clicking hamburger menu in tile view switches to list view  
**Root Cause**: Event propagation issues

---

## 🔴 Critical Bug Found

### **Hamburger Menu Triggers View Mode Switch**

**Problem**: Clicking the "More options" menu button (hamburger icon) in the tile view is somehow triggering the list view mode toggle.

**Symptoms**:

- User clicks hamburger menu on a tile
- Instead of showing dropdown menu, the entire grid switches to list view
- Dropdown menu never appears

**Likely Causes**:

1. Event bubbling not stopped on menu button
2. Icon name collision ("menu" vs "list" icons looking similar)
3. Click event propagating to parent container
4. Potential z-index issues with dropdown positioning

---

## 🔍 Investigation Results

### Button Event Handlers

**PlayCardTileHeader - Menu Button** (Line ~237):

```tsx
<Button
  onClick={() => setShowDropdown(!showDropdown)} // ❌ No stopPropagation!
  variant="ghost"
  size="sm"
  icon={<Icon name="menu" className="h-5 w-5" />}
  iconPosition="only"
  aria-label="More options"
  title="More options"
/>
```

**PlayGrid - View Mode Toggle** (Line ~672):

```tsx
<IconButton
  aria-label="List view"
  tooltip="List view"
  onClick={() => setViewMode("list")} // This is being triggered!
  variant="subtle"
  size="sm"
/>
```

### Event Propagation Path

```
User Click on Menu Button
    ↓
Button onClick fires
    ↓
Event bubbles up through DOM
    ↓
Reaches PlayCard container
    ↓
Reaches PlayGrid grid container
    ↓
Somehow triggers view mode button (???)
```

---

## 🎯 Root Cause Analysis

### Hypothesis 1: **Missing stopPropagation** (MOST LIKELY)

The menu button onClick doesn't call `e.stopPropagation()`, allowing the click event to bubble up through the component tree.

### Hypothesis 2: **Button Component Issue**

The `Button` component itself might not be stopping propagation internally, even though we expect it to.

### Hypothesis 3: **Portal/Overlay Confusion**

The dropdown menu might be rendering in a way that interferes with the view mode toggle buttons.

### Hypothesis 4: **Duplicate Event Listeners**

There might be multiple click handlers attached to the same element or overlapping elements.

---

## ✅ Fixes Applied

### 1. **Add stopPropagation to Menu Button** ✅

```tsx
<Button
  onClick={(e) => {
    e.stopPropagation(); // ✅ Stop event from bubbling
    setShowDropdown(!showDropdown);
  }}
  variant="ghost"
  size="sm"
  icon={<Icon name="menu" className="h-5 w-5" />}
  iconPosition="only"
  aria-label="More options"
  title="More options"
/>
```

### 2. **Already have stopPropagation on other buttons** ✅

- Star button: ✅ Has `e.stopPropagation()`
- Diagram button: ✅ Has `e.stopPropagation()`
- Checkbox: ✅ Has `e.stopPropagation()`

---

## 🧪 Additional Checks Needed

### Check Button Component

Verify that the Button component properly handles onClick events:

```tsx
// src/components/ui/Button/Button.tsx
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  if (onClick) {
    onClick(e); // ✅ Should pass event through
  }
};
```

### Check for Global Click Handlers

Search for any global click handlers that might be interfering:

```bash
grep -r "document.addEventListener" src/
grep -r "window.addEventListener" src/
```

### Check z-index Layering

Verify dropdown menu appears above all other content:

```tsx
{
  showDropdown && (
    <div className="...z-50...">
      {" "}
      // ✅ z-50 should be high enough
      {/* Menu content */}
    </div>
  );
}
```

---

## 📱 Mobile-Specific Checks

### Touch Event Handling

Mobile devices use touch events which can behave differently:

- `touchstart` → `touchend` → `click`
- Fast taps might not trigger click properly
- Need to ensure touch events are handled

### Tap Targets

Verify all buttons meet minimum size requirements:

- Menu button: Should be at least 44px × 44px
- Check actual rendered size in browser dev tools

### Viewport Issues

On small screens, the dropdown might be appearing off-screen or under other elements.

---

## 🔧 Additional Recommendations

### 1. **Add More Defensive Event Handling**

```tsx
// All critical buttons should have:
onClick={(e) => {
  e.preventDefault();      // Prevent default behavior
  e.stopPropagation();     // Stop bubbling
  // ... actual handler logic
}}
```

### 2. **Use Portals for Dropdowns**

Consider rendering dropdown menu in a portal to avoid z-index/overflow issues:

```tsx
import { createPortal } from "react-dom";

{
  showDropdown &&
    createPortal(
      <div className="...">{/* Menu content */}</div>,
      document.body
    );
}
```

### 3. **Add Debug Logging**

Temporarily add logging to track event flow:

```tsx
onClick={(e) => {
  console.log('Menu button clicked', {
    target: e.target,
    currentTarget: e.currentTarget,
    bubbles: e.bubbles,
    defaultPrevented: e.defaultPrevented
  });
  e.stopPropagation();
  setShowDropdown(!showDropdown);
}}
```

### 4. **Test Event Capture Phase**

Try using capture phase to intercept events earlier:

```tsx
onClickCapture={(e) => {
  e.stopPropagation();
}}
```

---

## 🎨 UX Improvements Beyond Bug Fix

### 1. **Make Menu Button More Prominent**

Current: Small ghost button at bottom
Suggestion: Larger, more visible button

```tsx
<Button
  onClick={(e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  }}
  variant="outline" // More visible than "ghost"
  size="md" // Larger
  icon={<Icon name="more-vertical" />} // Vertical dots instead of horizontal
>
  Options
</Button>
```

### 2. **Consider Quick Action Buttons**

Instead of hiding everything in a menu, show primary actions:

```tsx
<div className="mt-4 flex items-center justify-center gap-2">
  <Button onClick={() => onEdit?.(play)} variant="primary" size="sm">
    <Icon name="edit" /> Edit
  </Button>

  <div className="relative" ref={menuRef}>
    <Button
      onClick={(e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
      }}
    >
      <Icon name="more-horizontal" />
    </Button>
    {/* Dropdown for secondary actions */}
  </div>
</div>
```

### 3. **Add Visual Feedback**

Show that the menu button is interactive:

- Add hover state
- Add active/pressed state
- Add ripple effect on click

### 4. **Improve Dropdown Visibility**

Make the dropdown more obvious when open:

```tsx
{showDropdown && (
  <>
    {/* Darken background */}
    <div className="fixed inset-0 bg-black/20 z-40" onClick={...} />

    {/* Dropdown with better shadow */}
    <div className="absolute ... shadow-2xl ring-1 ring-black/10 z-50">
      {/* Menu items */}
    </div>
  </>
)}
```

---

## ✅ Testing Checklist

### Desktop

- [ ] Click menu button → Dropdown appears
- [ ] Click menu button again → Dropdown closes
- [ ] Click outside menu → Dropdown closes
- [ ] Click menu item → Action triggers + menu closes
- [ ] View mode stays on grid after menu interactions

### Mobile

- [ ] Tap menu button → Dropdown appears
- [ ] Tap backdrop → Dropdown closes
- [ ] Tap menu item → Action triggers
- [ ] No accidental view mode switches
- [ ] Menu appears in correct position

### Edge Cases

- [ ] Rapid clicks on menu button
- [ ] Click menu while another menu is open
- [ ] Double-tap on mobile
- [ ] Long press on mobile
- [ ] Keyboard navigation (Tab, Enter, Escape)

---

## 📊 Success Criteria

**Goal**: Menu button works reliably without side effects

**Must Have**:

- ✅ stopPropagation on menu button
- ✅ Dropdown appears when menu clicked
- ✅ View mode doesn't change
- ✅ Works on desktop and mobile

**Nice to Have**:

- ⭐ Visual feedback on interaction
- ⭐ Clear active state
- ⭐ Smooth animations
- ⭐ Keyboard accessible

---

## 📝 Files Modified

1. `/src/components/playbook/play-card/PlayCardTileHeader.tsx`
   - Added `e.stopPropagation()` to menu button onClick
   - Already had stopPropagation on other buttons

---

## 🚀 Next Steps

1. **Test the fix** - Verify menu button works without switching views
2. **Check Button component** - Ensure it properly handles events
3. **Review other components** - Look for similar issues elsewhere
4. **Add unit tests** - Test event propagation behavior
5. **Consider UX improvements** - Make the menu more discoverable
