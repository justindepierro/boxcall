# Direction Field Save - Debug Guide

## Current Status

Added comprehensive debugging to trace the complete flow of direction field saves (f_dir, p_dir).

## How to Test

1. **Open the app**: Navigate to `http://localhost:5173/playbook`
2. **Open browser console**: Press `F12` or `Cmd+Option+I`
3. **Filter console**: Type "PlayCard" to see only relevant logs
4. **Edit a direction field**:
   - Click on "Direction" field under FORMATION or PLAY DETAILS
   - Select a value (e.g., "Right", "Left")
   - Watch the console output

## What to Look For in Console

### Expected Flow (If Working Correctly):

```
[PlayCard] 🔵 handleInlineSave START: { field: "f_dir", value: "Right", ... }
[PlayCard] 🟢 Set optimistic state: { field: "f_dir", oldValue: null, newValue: "Right" }
[PlayCard] 🟡 Adding field to savingFields: f_dir
[PlayCard] 🟠 Calling onSave prop
[PlayGrid] 🔷 handlePlaySave START: { playId: "...", updates: { f_dir: "Right" } }
[PlayGrid] 🔷 Mapped updates: { dbUpdates: { f_dir: "Right" } }
[PlayGrid] 🔷 Calling updatePlay...
[PlayGrid] 🟢 updatePlay completed successfully
[PlayCard] 🟢 onSave completed successfully
[PlayCard] 🟣 Removing field from savingFields: f_dir
[PlayCard] 🟣 savingFields after removal: []
[PlayCard] 🔵 handleInlineSave END

// Later, when parent updates play prop with new data from database:
[PlayCard] useEffect fired: {
  "savingFields.size": 0,
  "play === lastSyncedPlayRef.current": false,  // SHOULD BE FALSE!
  "play.f_dir": "Right",
  "optimisticPlay.f_dir": "Right"
}
[PlayCard] ⚠️ SYNCING - Play prop changed, updating optimistic state: {
  "old f_dir": null,
  "new f_dir": "Right"  // New value from database
}
```

### Problem Flow (If Still Broken):

```
[PlayCard] 🔵 handleInlineSave START: { field: "f_dir", value: "Right", ... }
[PlayCard] 🟢 Set optimistic state: { field: "f_dir", oldValue: null, newValue: "Right" }
[PlayCard] 🟡 Adding field to savingFields: f_dir
[PlayCard] 🟠 Calling onSave prop
[PlayGrid] 🔷 handlePlaySave START: { playId: "...", updates: { f_dir: "Right" } }
[PlayGrid] 🟢 updatePlay completed successfully
[PlayCard] 🟢 onSave completed successfully
[PlayCard] 🟣 Removing field from savingFields: f_dir
[PlayCard] 🟣 savingFields after removal: []
[PlayCard] 🔵 handleInlineSave END

// PROBLEM: useEffect fires immediately with stale play prop
[PlayCard] useEffect fired: {
  "savingFields.size": 0,
  "play === lastSyncedPlayRef.current": true,  // PROBLEM: Same reference!
  "play.f_dir": null,  // Still old value
  "optimisticPlay.f_dir": "Right"
}
[PlayCard] ✅ Skipping sync - same play object reference

// OR WORSE:
[PlayCard] useEffect fired: {
  "savingFields.size": 0,
  "play === lastSyncedPlayRef.current": false,  // Different reference but...
  "play.f_dir": null,  // STILL OLD VALUE!
  "optimisticPlay.f_dir": "Right"
}
[PlayCard] ⚠️ SYNCING - Play prop changed, updating optimistic state: {
  "old f_dir": null,
  "new f_dir": null  // Syncing with stale data!
}
```

## Key Diagnostic Points

### 1. Check if play prop updates after save

- After save completes, look for `useEffect fired` messages
- Check `"play.f_dir"` value - does it have the new value?
- If it's still `null` or old value, **the parent isn't updating the prop**

### 2. Check object reference equality

- Look at `"play === lastSyncedPlayRef.current"`
- Should be `false` when database returns new data
- If `true`, React isn't creating a new object reference

### 3. Check timing

- How many `useEffect fired` messages appear?
- Do they fire BEFORE or AFTER the parent gets database updates?
- The sync should happen AFTER `[PlayGrid] 🟢 updatePlay completed successfully`

## Possible Issues

### Issue 1: Parent Not Updating Prop

**Symptom**: `play.f_dir` stays `null` even after successful save
**Cause**: `updatePlay` in `useTeamsData` isn't updating local state properly
**Solution**: Check `useTeamsData.ts` `updatePlay` function

### Issue 2: React Not Creating New Object

**Symptom**: `play === lastSyncedPlayRef.current` is always `true`
**Cause**: Mutation instead of immutable updates in parent
**Solution**: Ensure `updatePlay` creates new object: `{ ...oldPlay, ...updates }`

### Issue 3: useEffect Fires Too Early

**Symptom**: useEffect runs before database update completes
**Cause**: Something else changing `play` or `savingFields`
**Solution**: Check what's triggering the useEffect

### Issue 4: Database Not Actually Saving

**Symptom**: Save appears successful but value doesn't persist
**Cause**: Database error, validation failure, or field name mismatch
**Solution**: Check Supabase logs, verify field names match schema

## Next Steps

1. **Paste console output** showing the complete flow when editing direction field
2. **Identify which pattern** matches (expected vs problem flow)
3. **Focus on specific issue**:
   - If prop not updating → investigate `useTeamsData`
   - If timing wrong → investigate parent re-render triggers
   - If database not saving → check Supabase and field mapping

## Files Changed

- `src/components/playbook/PlayCard.tsx`: Added emoji-coded debug logs
- `src/components/playbook/PlayGrid.tsx`: Added save flow logging
- Both files: Fixed useEffect dependency arrays to prevent sync loops
