# Roster Page Button Debugging Guide

**Date**: October 15, 2025  
**Issue**: Buttons on RosterPage not opening modals  
**Status**: 🔍 Debugging Added

---

## Debug Logging Added

I've added comprehensive console logging to help diagnose the button click issue.

### What Was Added

#### 1. Button Click Logging (Lines 447-461)

```tsx
<Button
  onClick={() => {
    console.log("[RosterPage] Add Player button clicked");
    setShowAddModal(true);
  }}
>
  Add Player
</Button>

<Button
  onClick={() => {
    console.log("[RosterPage] Import CSV button clicked");
    setShowImportModal(true);
  }}
>
  Import CSV
</Button>
```

#### 2. Modal State Logging (Lines 93-101)

```tsx
useEffect(() => {
  console.log("[RosterPage] Modal states:", {
    showAddModal,
    showEditModal,
    showImportModal,
    showDeleteDialog,
  });
}, [showAddModal, showEditModal, showImportModal, showDeleteDialog]);
```

---

## How to Diagnose

### Step 1: Open Browser Console

1. Open your browser (Chrome/Firefox/Safari)
2. Navigate to `/roster` page
3. Open Developer Tools (F12 or Cmd+Option+I on Mac)
4. Go to Console tab

### Step 2: Check Initial State

You should see:

```
[RosterPage] Modal states: {
  showAddModal: false,
  showEditModal: false,
  showImportModal: false,
  showDeleteDialog: false
}
```

### Step 3: Click "Add Player" Button

**Expected Behavior**:

```
[RosterPage] Add Player button clicked
[RosterPage] Modal states: {
  showAddModal: true,  ← Should change to true
  showEditModal: false,
  showImportModal: false,
  showDeleteDialog: false
}
```

**If you DON'T see the click log**:

- ❌ Button click handler not firing
- Possible causes:
  - Something blocking clicks (z-index issue)
  - Event listener not attached
  - React not rendering the component

**If you see click log BUT modal state stays false**:

- ❌ State update not working
- Possible causes:
  - React state batching issue
  - Component re-rendering preventing state update
  - Conflicting setState calls

**If modal state becomes true BUT nothing appears**:

- ❌ Modal component not rendering
- Possible causes:
  - Modal component broken
  - CSS display: none hiding it
  - Portal target element missing

### Step 4: Check Edit/Delete Buttons

Try clicking on the Edit and Delete buttons on a player card:

```
Expected: [RosterPage] Modal states: { showEditModal: true, ... }
Expected: [RosterPage] Modal states: { showDeleteDialog: true, ... }
```

---

## Possible Issues & Solutions

### Issue 1: No Click Logs Appearing

**Problem**: Buttons not responding to clicks at all

**Solutions**:

1. Check if there's an overlay blocking clicks:
   - Inspect the button in Dev Tools
   - Look for elements with higher z-index
   - Check for `pointer-events: none` CSS

2. Verify Button component is working:

   ```tsx
   // Try a simple test button
   <button onClick={() => console.log("TEST")}>Test</button>
   ```

3. Check for JavaScript errors in console

### Issue 2: Click Logs Appear, State Doesn't Change

**Problem**: Button clicks fire but modal state stays false

**Solutions**:

1. Check if there's a conflicting useEffect resetting state
2. Verify no other code is calling `setShowAddModal(false)` immediately
3. Try adding a delay:
   ```tsx
   onClick={() => {
     console.log("Clicking...");
     setTimeout(() => setShowAddModal(true), 0);
   }}
   ```

### Issue 3: State Changes, Modal Doesn't Appear

**Problem**: `showAddModal` becomes true but modal not visible

**Solutions**:

1. Check Modal component is rendering:

   ```tsx
   {
     showAddModal && <div>MODAL SHOULD BE HERE</div>;
   }
   ```

2. Inspect Modal in React DevTools:
   - Is it in the DOM?
   - What are its props?
   - Is it hidden by CSS?

3. Check for portal issues (if Modal uses React Portal):
   - Does portal target exist?
   - Is it rendered before Modal?

### Issue 4: Modal Appears But Closes Immediately

**Problem**: Modal flashes then disappears

**Solutions**:

1. Check `onClose` handler:

   ```tsx
   onClose={() => {
     console.log("Modal closing!");
     setShowAddModal(false);
   }}
   ```

2. Look for auto-closing logic in Modal component
3. Check if form submission is triggering close

---

## Quick Test Commands

### Test in Browser Console

```javascript
// Check if React is working
console.log(document.querySelector('[data-testid="add-player-button"]'));

// Force state change (if you can access React instance)
// This requires React DevTools
```

---

## Next Steps After Diagnosis

### If Buttons Work

1. ✅ Remove debug console.log statements
2. ✅ Continue with Phase 2 Task 2 (Bulk Delete)

### If Buttons Don't Work

Depending on what you find in console:

1. **No click logs** → Fix button event handlers or blocking elements
2. **Click logs, no state change** → Fix state management issue
3. **State changes, no modal** → Fix Modal component rendering
4. **Modal appears then closes** → Fix auto-close logic

---

## Related Files

- **RosterPage.tsx** (lines 447-461): Button onClick handlers
- **RosterPage.tsx** (lines 93-101): Modal state logging
- **RosterPage.tsx** (lines 740-920): Add Modal component
- **RosterPage.tsx** (lines 941-1120): Edit Modal component
- **Modal.tsx**: Check Modal component implementation

---

## Contact Info for Further Help

If debugging doesn't reveal the issue, check:

1. Browser console for errors (red text)
2. React DevTools for component state
3. Network tab for API errors (if relevant)
4. Element inspector for CSS issues

**After running the page with these debug logs, copy the console output and we can diagnose the exact issue together!** 🔍
