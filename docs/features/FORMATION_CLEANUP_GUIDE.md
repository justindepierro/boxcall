# Formation Data Cleanup Guide

## The Problem

Your database has **duplicate formations** with the same name:

```
✗ Trips (direction: null, no opposite)
✓ Trips (direction: "right", opposite: "Twins Left")

✗ Twins (direction: null, no opposite)
✓ Twins (direction: "left", opposite: "Trips Right")
```

**Why this happened:**
- Old formations were created without direction tracking
- New formations have proper left/right direction and linking
- Both exist in the database, causing confusion

---

## Quick Fix (Recommended)

### Option 1: Interactive Cleanup Tool

**Easiest and safest:**

```bash
node scripts/cleanup-formations-interactive.js
```

This will:
1. Ask for your playbook ID
2. Show you what will be deleted
3. Confirm before making changes
4. Delete only formations with `direction: null`
5. Keep properly linked formations

**Example session:**
```
🧹 Formation Cleanup Tool
═══════════════════════════════════════════

Enter your Playbook ID: 291675df-b531-4754-b359-4bec6867542d

🔍 Analyzing formations...

✅ Found 4 formations

📊 Formation Breakdown:
   • 2 with proper direction (left/right)
   • 2 with no direction (null)

─────────────────────────────────────────────
🗑️  Formations with null direction:
─────────────────────────────────────────────
   • Trips - ✅ Has proper version
     ID: 693964e1-8084...
     Usage: 0 plays

   • Twins - ✅ Has proper version
     ID: ea6f5ac5-a316...
     Usage: 0 plays

❓ Delete 2 formations with null direction? (yes/no): yes

✅ Success!
Deleted 2 formations
Remaining: 2 formations
```

---

### Option 2: Advanced Cleanup Script

**For more control:**

```bash
# Dry run (shows what would be deleted without deleting)
node scripts/cleanup-duplicate-formations.js \
  --playbook-id=YOUR_ID \
  --dry-run

# Actually delete
node scripts/cleanup-duplicate-formations.js \
  --playbook-id=YOUR_ID

# Delete and update play references
node scripts/cleanup-duplicate-formations.js \
  --playbook-id=YOUR_ID \
  --update-plays
```

**Options:**
- `--playbook-id` (required) - Your playbook ID
- `--dry-run` - Preview changes without making them
- `--update-plays` - Update play references (use with caution)

---

## Manual Fix Using Bulk Operations

**Use the new bulk operations UI you just built:**

1. Open your app: http://localhost:5173
2. Go to Formation Builder
3. You'll see formations with checkboxes
4. Select the 2 formations with no direction arrows
5. Click "Delete" in the bulk action toolbar
6. Confirm deletion
7. Done! ✅

**Time: 30 seconds**

---

## After Cleanup

### Verify the Fix

```bash
# Check remaining formations
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
  const { data } = await supabase
    .from('formations')
    .select('name, direction, opposite_formation_id')
    .eq('playbook_id', 'YOUR_PLAYBOOK_ID');
  
  console.table(data);
})();
"
```

### Expected Result

After cleanup, you should have:

```json
[
  {
    "name": "Trips",
    "direction": "right",
    "opposite_formation_id": "c6f762ff-39cc-4abb-b690-56283a732a77"
  },
  {
    "name": "Twins",
    "direction": "left",
    "opposite_formation_id": "072f42d5-288c-49b2-9152-028b4901dcb6"
  }
]
```

✅ **Perfect!** Two formations, properly linked.

---

## Troubleshooting

### "Error: Cannot find module '@supabase/supabase-js'"

Install it:
```bash
npm install @supabase/supabase-js
```

### "Error: VITE_SUPABASE_URL is undefined"

Make sure you have a `.env` file with:
```
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

### "Warning: Formations have usage_count > 0"

Some plays reference these formations. Options:
1. **Safe**: Delete anyway (plays use formation NAME, not ID, so they'll still work)
2. **Manual**: Update plays to reference the proper formation IDs first
3. **Cancel**: Keep the duplicates for now

---

## Prevention

**To prevent this in the future:**

1. ✅ Always use the Formation Builder to create formations
2. ✅ Always set direction when creating formations
3. ✅ Use "Create Opposite" to link left/right pairs
4. ✅ Use the bulk operations to manage formations efficiently

The new bulk operations system helps prevent this by:
- Making it easy to set directions in bulk
- Auto-creating opposites when needed
- Providing clear visual feedback

---

## What You Have Now

After cleanup, you have:

1. ✅ **Clean database** - No duplicate formations
2. ✅ **Proper linking** - Left/right pairs properly connected
3. ✅ **Bulk operations** - UI to manage formations efficiently
4. ✅ **Scripts** - Tools to fix issues if they happen again

---

## Summary

**Fastest fix:**
```bash
node scripts/cleanup-formations-interactive.js
```

**Or use bulk operations in the app:**
1. Select duplicates (30 sec)
2. Delete (1 click)
3. Done! ✅

**Result:**
- 4 formations → 2 formations
- All properly linked
- No more duplicates
- Ready to use bulk operations! 🚀

---

## Need Help?

The scripts are safe and show you exactly what they'll do before making changes. Run them with --dry-run first to preview!
