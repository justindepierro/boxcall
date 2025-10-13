# Field Save Debugging Guide

## Issue

User reports that personnel field (and possibly other fields) aren't saving to the database after the recent changes.

## Current Save Flow

### 1. User edits field in PlayCard

```
InlineEditField → handleInlineSave (PlayCard) → onSave prop → handlePlaySave (PlayGrid) → updatePlay (useTeamsData) → Supabase
```

### 2. Data Transformation Chain

**PlayCard.handleInlineSave:**

```typescript
handleInlineSave(field: 'personnel', value: 'Spread')
  ↓
setOptimisticPlay({ ...prev, personnel: 'Spread' })
  ↓
onSave(play.id, { personnel: 'Spread' })
```

**PlayGrid.handlePlaySave:**

```typescript
receives: updates = { personnel: 'Spread' }
  ↓
maps to: dbUpdates = { personnel: 'Spread' }
  ↓
updatePlay(playId, { personnel: 'Spread' })
```

**useTeamsData.updatePlay:**

```typescript
receives: updates = { personnel: 'Spread' }
  ↓
supabase.from('plays').update({ personnel: 'Spread' })
  ↓
database updated
  ↓
setPlays(updated local state)
```

## Debugging Steps

### Step 1: Check Browser Console

Look for these log messages when saving:

```
[PlayCard] 🔵 handleInlineSave START: { field: 'personnel', value: 'Spread', ... }
[PlayCard] 🟢 Set optimistic state: { field: 'personnel', oldValue: '11 Personnel', newValue: 'Spread' }
[PlayCard] 🟠 Calling onSave prop
[PlayGrid] 🔷 handlePlaySave START: { playId: '...', updates: { personnel: 'Spread' } }
[PlayGrid] 🔷 Mapped updates: { dbUpdates: { personnel: 'Spread' } }
[useTeamsData] Updating play: { playId: '...', updates: { personnel: 'Spread' } }
[useTeamsData] Database returned: { personnel: 'Spread', ... }
[PlayCard] 🟢 onSave completed successfully
```

### Step 2: Check for Errors

Look for red 🔴 error messages:

```
[PlayCard] 🔴 Failed to save personnel, reverting: <error>
[PlayGrid] 🔴 Failed to save play: <error>
[useTeamsData] Error updating play: <error>
```

### Step 3: Verify Database

After saving, check if the value is actually in the database:

1. Open browser console
2. Run:

```javascript
const { data } = await (await fetch("/api/supabase")).supabase
  .from("plays")
  .select("id, personnel")
  .eq("id", "YOUR_PLAY_ID")
  .single();
console.log("Database value:", data.personnel);
```

## Common Issues

### Issue 1: Optimistic Update Works, Database Doesn't Save

**Symptoms:**

- Field shows new value immediately
- After page refresh, old value returns

**Causes:**

- Supabase update failing silently
- Type mismatch in database
- RLS policy blocking update
- Network error

**Debug:**
Check console for `[useTeamsData] Error updating play:`

### Issue 2: Field Reverts Immediately

**Symptoms:**

- Field changes, then immediately reverts
- No success message

**Causes:**

- onSave throwing error
- PlayCard error handler reverting
- optimisticPlay getting overwritten

**Debug:**
Check console for `[PlayCard] 🔴 Failed to save`

### Issue 3: Dropdown Closes, Value Doesn't Change

**Symptoms:**

- Select from dropdown
- Dropdown closes
- Field shows old value

**Causes:**

- handleSuggestionSelect not calling handleSave
- Auto-save timeout not working
- onBlur interfering

**Debug:**
Check if `handleInlineSave` is being called at all

### Issue 4: Specific Fields Not Saving

**Symptoms:**

- Some fields save (e.g., play_name works)
- Other fields don't save (e.g., personnel doesn't)

**Causes:**

- Field not mapped in handlePlaySave
- Database column doesn't exist
- Type mismatch (TEXT vs INTEGER)

**Debug:**
Check `[PlayGrid] 🔷 Mapped updates:` log

## Field Mapping Verification

### All Editable Fields (from handlePlaySave):

```typescript
✅ formation
✅ play_name
✅ one_word_play
✅ p_type
✅ personnel        ← Your issue
✅ f_type
✅ f_dir            ← Also mentioned
✅ protection
✅ p_dir            ← Also mentioned
✅ r_str
✅ p_str
✅ pref_down
✅ pref_dis
✅ pref_hash
✅ pref_cov
✅ pref_front
✅ ftag1
✅ ftag2
✅ p_tag1
✅ p_tag2
✅ back_align
✅ shift
✅ motion
✅ key_player1
✅ key_player2
✅ check_into
✅ notes
```

All fields are properly mapped! ✅

## Database Schema Verification

### plays table columns:

```sql
✅ personnel TEXT
✅ f_dir TEXT
✅ p_dir TEXT
```

All columns exist! ✅

## Possible Root Causes

### 1. Supabase RLS Policy

The update might be blocked by Row Level Security.

**Test:**

```sql
-- Check if user has UPDATE permission
SELECT * FROM plays WHERE id = 'YOUR_PLAY_ID';
-- If you can SELECT but not UPDATE, it's an RLS issue
```

### 2. Stale Play Reference

The `play` object in handleInlineSave dependency might be stale.

**Check:**
Look for `[PlayCard] 🔵 handleInlineSave START:` and verify `playId` is correct

### 3. Race Condition

Multiple saves happening simultaneously, last one wins.

**Check:**
Look for multiple `[PlayCard] 🟡 Adding field to savingFields:` without corresponding removals

### 4. Network/Supabase Error

Supabase API call failing.

**Check:**
Open Network tab, look for failed requests to Supabase

## Quick Fix to Try

### Add more aggressive logging:

**In PlayCard.tsx, after line 291:**

```typescript
const handleInlineSave = useCallback(
  async (field: keyof PlayType, value: string | number) => {
    console.log("🚨 SAVE DEBUG:", {
      field,
      value,
      playId: play.id,
      playbookId: play.playbook_id,
      hasOnSave: !!onSave,
      typeof onSave
    });

    // ... rest of function
```

### Force re-fetch after save:

**In PlayGrid.tsx, after updatePlay:**

```typescript
await updatePlay(playId, dbUpdates);

// Force refetch to ensure sync
const { data: refreshedPlay } = await supabase
  .from("plays")
  .select("*")
  .eq("id", playId)
  .single();

console.log("🔄 Refreshed play from DB:", refreshedPlay);
```

## Next Steps for User

1. **Open browser console** (F12 or Cmd+Option+I)
2. **Try to save a field** (e.g., change personnel)
3. **Look for the log messages** listed above
4. **Take a screenshot** of any errors
5. **Report back** with what you see

This will tell us exactly where in the chain the save is failing.
