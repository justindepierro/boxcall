# Personnel Not Showing Debug Guide

## Issue
Only seeing "11 Personnel" instead of Blue, Green, Black personnel configurations.

## Debug Steps

### Step 1: Check Browser Console

1. **Open DevTools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Refresh the page**
4. **Open Formation Manager** → Edit Details tab
5. **Look for these log messages**:

```javascript
// Should see:
👥 [FormationBuilderPanel] Personnel configurations: {
  count: X,  // ← Should be 3+ if you have Blue, Green, Black
  personnel: [
    { id: "uuid", name: "11 Personnel", description: "...", playersCount: 5 },
    { id: "uuid", name: "Blue", description: "...", playersCount: 5 },
    { id: "uuid", name: "Green", description: "...", playersCount: 5 },
    { id: "uuid", name: "Black", description: "...", playersCount: 5 }
  ]
}
```

### Step 2: Check What's Rendered

After selecting a formation, look for:

```javascript
🎨 [FormationBuilderPanel] Rendering personnel buttons: {
  availableCount: X,
  personnel: [...],  // ← Should list all your personnel
  selectedIds: [...]
}
```

### Step 3: Verify Database

Run this in **Supabase SQL Editor**:

```sql
-- Check personnel configurations in your playbook
SELECT 
  pc.id,
  pc.name,
  pc.description,
  pc.playbook_id,
  COUNT(pp.id) as player_count
FROM personnel_configurations pc
LEFT JOIN personnel_players pp ON pp.config_id = pc.id
WHERE pc.playbook_id = (
  SELECT id FROM playbooks LIMIT 1  -- Replace with your playbook_id
)
GROUP BY pc.id, pc.name, pc.description, pc.playbook_id
ORDER BY pc.name;
```

**Expected Results:**
```
id                 | name            | description          | player_count
-------------------|-----------------|---------------------|-------------
uuid-1             | 11 Personnel    | 1 RB, 1 TE, 3 WR    | 5
uuid-2             | Black           | Description...      | 5
uuid-3             | Blue            | Description...      | 5
uuid-4             | Green           | Description...      | 5
```

## Common Issues

### Issue 1: Personnel Not in Database

**Symptom**: SQL query returns only "11 Personnel"

**Solution**: Create your Blue, Green, Black personnel via:
1. Playbook Settings → Personnel Builder
2. Or SQL:

```sql
-- Example: Create Blue personnel
INSERT INTO personnel_configurations (playbook_id, name, description)
VALUES (
  'your-playbook-id',
  'Blue',
  '3 WR, 1 TE, 1 RB - Blue package'
)
RETURNING id;

-- Then add players to it
-- (Use personnel builder UI instead - easier!)
```

### Issue 2: Wrong Playbook ID

**Symptom**: Console shows `personnelCount: 0` or only shows default "11 Personnel"

**Solution**: 
1. Check which playbook you're viewing
2. Verify personnel are created for THAT playbook
3. Personnel are playbook-specific!

```sql
-- Find your current playbook
SELECT id, name FROM playbooks 
WHERE id = 'the-id-shown-in-your-url-or-console';

-- Check personnel for that specific playbook
SELECT * FROM personnel_configurations
WHERE playbook_id = 'your-playbook-id-here';
```

### Issue 3: Caching Issue

**Symptom**: Database shows personnel but UI doesn't

**Solution**:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Close and reopen Formation Manager modal

### Issue 4: Console Shows Multiple Personnel but UI Shows Only One

**Symptom**: 
```javascript
// Console shows:
count: 4  // ← Multiple personnel loaded

// But UI only shows "11 Personnel"
```

**Solution**: There might be a rendering issue. Check:
1. Do you see the console log `🎨 Rendering personnel buttons:`?
2. What does `availableCount` show?
3. Is the `map()` function being called?

If console shows data but UI doesn't render, it could be:
- CSS hiding buttons (check inspector)
- React not re-rendering
- State not updating

## Quick Tests

### Test 1: Force Re-fetch

```typescript
// In browser console, run:
localStorage.clear();
location.reload();
```

### Test 2: Check Component State

```typescript
// In browser console (after opening Formation Manager):
// React DevTools → Find FormationBuilderPanel component
// Check state.availablePersonnel
```

### Test 3: Manual API Call

```typescript
// In browser console:
const { data } = await supabase
  .from('personnel_configurations')
  .select('*')
  .eq('playbook_id', 'YOUR_PLAYBOOK_ID');
  
console.log('Personnel from API:', data);
```

## What to Share

If the issue persists, share these in console:

1. **Personnel load log**:
   ```
   👥 [FormationBuilderPanel] Personnel configurations: {...}
   ```

2. **Render log**:
   ```
   🎨 [FormationBuilderPanel] Rendering personnel buttons: {...}
   ```

3. **SQL query result** from Step 3

4. **Screenshot** of the UI

## Next Steps

After refreshing and checking console:

- ✅ **If console shows multiple personnel** → Rendering issue, check React DevTools
- ✅ **If console shows only "11 Personnel"** → Database issue, need to create Blue/Green/Black
- ✅ **If console shows 0 personnel** → Playbook ID mismatch or no personnel created

---

**Updated**: October 12, 2025  
**Added**: Enhanced logging for debugging
