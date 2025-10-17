# View Switching Issue - Debugging Guide

## 🐛 Problem

User reports random view switching when:

- Expanding tiles in grid view
- Expanding cards in list view
- Sometimes just randomly switching between views

## 🔍 Debugging Added (Oct 12, 2025)

### Console Logs to Watch For

#### 1. **View Mode Changes**

```
[PlayGrid] setViewMode called: {
  newMode: "grid" or "list",
  previousMode: current mode,
  manual: true/false (true = user clicked, false = auto-switching),
  hasManualOverride: true/false,
  stackTrace: where the call came from
}
```

**What to look for:**

- If `manual: false` appears when you're clicking buttons → media query is interfering
- Check the `stackTrace` to see what triggered the change
- If `previousMode === newMode` → unnecessary re-render

#### 2. **Expansion State Changes**

```
[PlayGrid] expandedPlayId changed: {
  expandedPlayId: "play-id" or null,
  viewMode: "grid" or "list",
  timestamp: ISO timestamp
}
```

**What to look for:**

- Does viewMode change unexpectedly when expandedPlayId changes?
- Are multiple expansions happening in rapid succession?

#### 3. **Expansion Toggle Calls**

```
[PlayGrid] handleToggleExpand called: {
  playId: "play-id",
  currentExpandedId: current expanded play or null,
  willExpand: true/false,
  currentViewMode: "grid" or "list"
}
```

**What to look for:**

- Does `currentViewMode` change between toggle calls?
- Are there multiple toggles when you only clicked once?

#### 4. **Media Query Auto-Switching**

```
[PlayGrid] Auto-switching view mode based on screen size: {
  matches: true/false,
  newMode: "grid" or "list",
  screenWidth: pixel width
}
```

**What to look for:**

- Does this appear when you're NOT resizing the window?
- Is it happening during expansion/collapse?

#### 5. **Manual Override Skip**

```
[PlayGrid] Skipping auto view mode - user has manual override
```

**What to look for:**

- This should appear AFTER you manually click a view mode button
- If this doesn't appear when you expect it → manual override not being saved

## 🛠️ Fixes Applied

### 1. **Event Propagation Stops**

- ✅ Added `stopPropagation()` and `preventDefault()` to Details/Collapse button
- ✅ Added same to List/Grid view toggle buttons
- ✅ Updated `handleToggleExpand` in PlayCard to handle events properly

### 2. **Render Optimization**

- ✅ Only call `setViewModeState(mode)` if mode is actually different
- ✅ Prevents unnecessary re-renders and side effects

### 3. **Stack Traces**

- ✅ Every `setViewMode` call now includes a stack trace
- ✅ Shows the call path: which component/handler triggered the change

## 🧪 Testing Steps

### Test 1: Grid View Expansion

1. Open browser console (F12)
2. Navigate to Playbook
3. Switch to Grid view
4. Click "Details" on any tile
5. **Expected logs:**
   ```
   [PlayGrid] handleToggleExpand called: { willExpand: true, currentViewMode: "grid" }
   [PlayGrid] expandedPlayId changed: { viewMode: "grid" }
   ```
6. **Watch for:** No `setViewMode` calls should appear
7. Click "Collapse"
8. **Expected:** Same pattern, no view switching

### Test 2: List View Expansion

1. Switch to List view
2. Click expand arrow on any play
3. **Expected logs:**
   ```
   [PlayGrid] handleToggleExpand called: { currentViewMode: "list" }
   [PlayGrid] expandedPlayId changed: { viewMode: "list" }
   ```
4. **Watch for:** viewMode should stay "list"

### Test 3: View Mode Toggle

1. Click Grid view button
2. **Expected logs:**
   ```
   [PlayGrid] setViewMode called: { newMode: "grid", manual: true, stackTrace: ... }
   ```
3. Click List view button
4. **Expected:** Same pattern with `manual: true`

### Test 4: Rapid Interactions

1. Quickly expand/collapse multiple tiles
2. **Watch for:**
   - No unexpected `setViewMode` calls
   - `expandedPlayId` changes correctly
   - No view mode switches

### Test 5: Screen Resize

1. With browser console open, resize browser window
2. Cross the 768px breakpoint
3. **Expected (if NO manual override):**
   ```
   [PlayGrid] Media query changed: true/false
   [PlayGrid] Auto-switching view mode...
   ```
4. **Expected (AFTER manual click):**
   ```
   [PlayGrid] Skipping auto view mode - user has manual override
   ```

## 📊 What Each Log Tells Us

| Log Message                             | What It Means                 | When It Should Appear                         |
| --------------------------------------- | ----------------------------- | --------------------------------------------- |
| `setViewMode called: { manual: true }`  | User clicked view toggle      | When clicking List/Grid buttons               |
| `setViewMode called: { manual: false }` | Auto-switching triggered      | ONLY on screen resize (if no manual override) |
| `handleToggleExpand called`             | User clicked Details/Collapse | When clicking expansion buttons               |
| `expandedPlayId changed`                | Expansion state updated       | After expansion/collapse                      |
| `Skipping auto view mode`               | Manual override is active     | After first manual view toggle                |
| Stack trace points to event handler     | Event bubbling issue          | Shouldn't happen with our fixes               |
| Stack trace points to media query       | Resize triggered change       | OK if window actually resized                 |

## 🚨 Red Flags to Report

If you see any of these, let me know immediately:

1. **View mode changes when you click expansion buttons**

   ```
   [PlayGrid] setViewMode called: { manual: false }  // During expansion
   ```

2. **Multiple rapid setViewMode calls**

   ```
   [PlayGrid] setViewMode called...
   [PlayGrid] setViewMode called...  // < 100ms apart
   ```

3. **Media query triggering without window resize**

   ```
   [PlayGrid] Media query changed: true
   // But you didn't resize the window
   ```

4. **View mode in expansion logs differs from current view**

   ```
   [PlayGrid] handleToggleExpand: { currentViewMode: "grid" }
   [PlayGrid] expandedPlayId changed: { viewMode: "list" }  // ⚠️ Changed!
   ```

5. **Manual override not persisting**
   - You click Grid button
   - Resize window slightly
   - View mode auto-switches (should be skipped)

## 🎯 Next Steps

1. **Capture full console output** when issue occurs
2. **Note exact sequence** of actions that triggers the problem
3. **Check stack traces** to identify the culprit
4. **Report back** with logs - I can identify the root cause from the patterns

## 💡 Quick Test

Run this in console to see current state:

```javascript
console.log(
  "Current View Mode:",
  document
    .querySelector('[aria-label="Grid view"]')
    ?.classList.contains("bg-white")
    ? "grid"
    : "list"
);
```

This will help confirm what the UI thinks the current view is.
