# Quick Start: Assign Personnel to Formations

## ⚡ TL;DR

You **already have** the feature to assign personnel groupings to formations! Just need to apply one database migration.

## 🚀 Quick Setup (5 minutes)

### Step 1: Apply Database Migration

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add personnel_packages column to formations table
ALTER TABLE formations 
  ADD COLUMN IF NOT EXISTS personnel_packages UUID[] DEFAULT ARRAY[]::UUID[];

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_formations_personnel_packages 
  ON formations USING GIN(personnel_packages);

-- Add documentation
COMMENT ON COLUMN formations.personnel_packages IS 
  'Array of personnel_configuration.id values that can run this formation';

-- Verify it worked
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'formations' 
  AND column_name = 'personnel_packages';
```

6. Click **Run** (or press Cmd+Enter)
7. You should see: 1 row returned with `personnel_packages | ARRAY | YES`

**Option B: Via Supabase CLI**

```bash
cd /Users/justindepierro/Documents/boxcall

# Copy the standalone migration
cat database/migrations/20251012_add_personnel_packages_standalone.sql

# Open Supabase SQL Editor and paste the contents above
# Then run it
```

### Step 2: Use the Feature! 🎉

1. **Open your app** (refresh browser if already open)
2. Click **Formation Builder** button
3. The **Edit Details** tab opens automatically
4. **Select a formation** from dropdown
5. **Click personnel packages** to toggle (11 Personnel, 12 Personnel, etc.)
6. **Click Save Formation**

Done! ✅

## 🎯 What You Can Do Now

### Assign Multiple Personnel to One Formation

Example: "Trips" formation can run with both 11 and 12 personnel

```
Formation: Trips
Personnel: [11 Personnel ✓, 12 Personnel ✓]
Category: Spread
Tags: trips, compressed
```

### Link Formations (Personnel Auto-Copies)

1. Edit Details tab → Assign personnel to "Trips"
2. Link Formations tab → Link "Trips" left/right
3. Personnel automatically copies to both variants!

### Filter by Personnel (Coming Soon)

- "Show me all formations for 11 Personnel"
- "Which formations support 21 Personnel?"

## 📸 Visual Guide

### Edit Details Tab

```
╔══════════════════════════════════════════════════╗
║ Formation Manager                                ║
╠═══════════════╦══════════════════════════════════╣
║ Edit Details  │ Link Formations │ Draw Formation║  ← Tabs
╠═══════════════╩══════════════════════════════════╣
║                                                  ║
║ Select Formation:                                ║
║ [▼ Trips (Left)                             ]    ║
║                                                  ║
║ Personnel Packages:                              ║
║ ┌────────────┐ ┌────────────┐ ┌────────────┐   ║
║ │✓ 11        │ │✓ 12        │ │  21        │   ║ ← Click to toggle
║ │ Personnel  │ │ Personnel  │ │ Personnel  │   ║
║ └────────────┘ └────────────┘ └────────────┘   ║
║                                                  ║
║ ✓ 2 personnel packages selected                 ║
║                                                  ║
║ Formation Category:                              ║
║ [▼ Spread                                   ]    ║
║                                                  ║
║ Tags:                                            ║
║ [twins, compressed                          ]    ║
║                                                  ║
║ Description:                                     ║
║ [Three receivers bunched to one side       ]    ║
║ [                                           ]    ║
║                                                  ║
║              [💾 Save Formation]                 ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

## 🔍 Verify It's Working

### Check in Database

1. Go to Supabase Dashboard → **Table Editor**
2. Open **formations** table
3. Find your formation (e.g., "Trips")
4. Look at **personnel_packages** column
5. Should see: `{uuid1, uuid2}` (array of IDs)

### Check in Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Select a formation in Edit Details
4. You'll see:

```
📝 Formation selected: {
  id: "abc-123",
  name: "Trips",
  personnel_packages: ["uuid1", "uuid2"]  ← Array of personnel IDs
}
```

## ❓ Troubleshooting

### "No personnel configurations found"

**Fix**: Create personnel packages first:
1. Go to Playbook Settings
2. Click Personnel Builder
3. Create "11 Personnel", "12 Personnel", etc.

### "No formations found"

**Fix**: Formations are created from plays:
1. Create some plays with formation names
2. Formations will appear in dropdown

### Personnel not saving

**Fix**: Check console for errors:
```javascript
// Look for:
❌ Failed to save formation: [error details]
```

Common causes:
- Migration not applied
- RLS policy blocking updates
- Network error

## 📚 Full Documentation

See `PERSONNEL_ASSIGNMENT_GUIDE.md` for:
- Complete architecture details
- Database schema
- TypeScript types
- Advanced use cases
- Component breakdown

## ✅ Success Checklist

- [ ] SQL migration applied successfully
- [ ] Personnel configurations created
- [ ] Formation selected in Edit Details tab
- [ ] Personnel packages toggle with checkmarks
- [ ] Save button persists to database
- [ ] Browser console shows no errors
- [ ] Database shows personnel_packages array

## 🎊 That's It!

You now have the ability to assign personnel groupings to formations. This will help you:

1. **Organize** - Tag formations with compatible personnel
2. **Filter** - Find formations by personnel package
3. **Reuse** - Link formations and personnel copies automatically

---

**Created**: October 12, 2025  
**Status**: ✅ Feature Ready (Migration Pending)
