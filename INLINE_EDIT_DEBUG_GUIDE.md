# Inline Edit Field - Debug Guide

## Issue

Play fields (Protection, Tags, Code, etc.) only accepting 1-2 characters when editing.

## Debug Logs to Watch

### 1. Starting Edit Mode

```
[InlineEditField] 🖱️ Starting edit mode:
  currentValue: ""
  willSetEditValue: ""
```

- Shows when you click a field to edit
- `currentValue` is what the field currently displays

### 2. Typing Characters

```
[InlineEditField] ⌨️ Input changed:
  oldValue: "d"
  newValue: "do"
  valueLength: 2
```

- Fires on every keystroke
- Shows old → new value
- **If this stops firing, keyboard input is blocked**

### 3. Value Prop Changes (Parent Re-render)

```
[InlineEditField] 🔄 Value prop changed, updating editValue:
  oldEditValue: "do"
  newValue: ""
  isEditing: true
```

- Fires when parent component passes new value prop
- **If this happens while typing, parent is resetting your input!**
- `isEditing: true` means you're still in edit mode but value got reset

### 4. Blur Event (Losing Focus)

```
[InlineEditField] 👁️ handleBlur triggered:
  currentValue: "d"
  relatedTarget: null
  isEditing: true

[InlineEditField] ⏰ Blur will trigger save in 200ms...
```

- Fires when input loses focus
- Triggers auto-save after 200ms
- **If blur fires unexpectedly, something is stealing focus**

### 5. Save Triggered

```
[InlineEditField] 💾 handleSave called, editValue: "d"
[InlineEditField] 💾 Normalized value: "d"
[InlineEditField] ✅ Validation passed, saving...
[InlineEditField] 🚪 Exiting edit mode (setIsEditing false)
[InlineEditField] 📡 Calling onSave with: "d"
```

- Shows what value is being saved
- **After this, you exit edit mode!**

### 6. PlayCard State Management

```
[PlayCard] 🔵 handleInlineSave START: { field: "protection", value: "d" }
[PlayCard] 🟢 Set optimistic state: { field: "protection", newValue: "d" }
[PlayCard] 🟡 Adding field to savingFields: protection
[PlayCard] 🟠 Calling onSave prop
```

- Shows PlayCard receiving the save
- Sets optimistic state immediately

### 7. Save Completion

```
[PlayCard] 🟢 onSave completed successfully
[PlayCard] 🟣 Removing field from savingFields: protection
[PlayCard] 🟣 savingFields after removal: []
```

- Save finished
- Field removed from `savingFields` set

### 8. Database Refresh & Sync Check

```
[PlayCard] Play prop received/changed: { ... }
[PlayCard] useEffect fired: { ... }
[PlayCard] Time since last save: 150
[PlayCard] ⏸️ Skipping sync - either saving or recent save
```

OR

```
[PlayCard] Time since last save: 600
[PlayCard] ✅ Syncing optimisticPlay with new play prop
```

- Shows if sync was skipped (< 500ms grace period) or allowed
- **If "Syncing..." appears too soon, grace period didn't work!**

## Expected Flow (Working Correctly)

1. Click field → "🖱️ Starting edit mode"
2. Type "d" → "⌨️ Input changed: newValue: 'd'"
3. Type "o" → "⌨️ Input changed: newValue: 'do'"
4. Type "n" → "⌨️ Input changed: newValue: 'don'"
5. Click elsewhere → "👁️ handleBlur triggered"
6. 200ms later → "💾 handleSave called, editValue: 'don'"
7. Save completes → "🟣 savingFields after removal: []"
8. Database refreshes → "⏸️ Skipping sync - recent save" (< 500ms)
9. After 500ms, next refresh → "✅ Syncing optimisticPlay"

## Bug Scenario (1 Character Only)

1. Click field → "🖱️ Starting edit mode"
2. Type "d" → "⌨️ Input changed: newValue: 'd'"
3. **IMMEDIATE BLUR** → "👁️ handleBlur triggered"
4. 200ms later → "💾 handleSave called, editValue: 'd'"
5. Save completes → "🟣 savingFields after removal: []"
6. Database refreshes (fast!) → "✅ Syncing optimisticPlay" ❌ **Too soon!**
7. "🔄 Value prop changed, updating editValue: newValue: ''" ❌ **Reset to empty!**
8. Try to type "o" → Can't, no longer in edit mode

## What to Look For

### Problem 1: Unexpected Blur

If you see blur immediately after typing ONE character, something is stealing focus:

- Check if any UI element is appearing/disappearing
- Check if parent component is re-rendering
- Check if validation is showing errors

### Problem 2: Value Reset While Editing

If you see this while `isEditing: true`:

```
[InlineEditField] 🔄 Value prop changed, updating editValue:
  newValue: ""  ← EMPTY!
  isEditing: true  ← BUT STILL EDITING!
```

The parent is passing a new value prop and overwriting your typing.

### Problem 3: Sync Too Soon

If you see this pattern:

```
[PlayCard] 🟣 savingFields after removal: []
[PlayCard] Time since last save: 50  ← Less than 500!
[PlayCard] ✅ Syncing optimisticPlay  ← Should be skipped!
```

The grace period check isn't working.

## Testing Steps

1. **Open DevTools Console** (F12 → Console tab)
2. **Filter logs**: Type `InlineEditField` or `PlayCard` in filter box
3. **Clear console** (trash icon)
4. **Click Protection field**
5. **Type slowly**: "d" ... pause ... "o" ... pause ... "n"
6. **Watch for**:
   - Each keystroke shows "⌨️ Input changed"
   - No unexpected "👁️ handleBlur" between keystrokes
   - No "🔄 Value prop changed" while editing
7. **Click away or press Enter**
8. **Verify**:
   - "💾 handleSave called, editValue: 'don'" (full value)
   - "⏸️ Skipping sync" appears for ~500ms
   - Eventually "✅ Syncing optimisticPlay" after grace period

## Current Fix

The fix implements a **500ms grace period** after saves:

- When a field finishes saving, we track the timestamp
- For the next 500ms, we ignore database refresh syncs
- This prevents the database refresh from overwriting the optimistic value
- After 500ms, normal syncing resumes

## File: PlayCard.tsx Lines 131, 327, 167-192

- `lastSaveTimeRef` tracks when saves complete
- `finally` block sets `lastSaveTimeRef.current = Date.now()`
- `useEffect` checks `timeSinceLastSave > 500` before syncing
