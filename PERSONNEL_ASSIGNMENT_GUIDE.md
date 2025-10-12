# Personnel Assignment to Formations - User Guide

## Overview

You can now assign personnel groupings (created in the Personnel Builder) to your formations in the Formation Builder's **Edit Details** tab. This allows you to specify which personnel packages (e.g., "11 Personnel", "12 Personnel") can run each formation.

## Features Already Implemented ✅

1. **Edit Details Tab** - First tab in Formation Manager
2. **Multi-Select Personnel** - Assign multiple personnel packages to one formation
3. **Visual Feedback** - Checkmarks show selected personnel
4. **Automatic Linking** - Personnel packages copy to linked formations
5. **Database Storage** - Saved as UUID array in `formations.personnel_packages`

## Step-by-Step Guide

### Step 1: Apply Database Migration

Before using this feature, you need to apply the database migration:

```bash
cd /Users/justindepierro/Documents/boxcall

# Apply the migration to your Supabase database
npx supabase db push
```

Or manually apply via Supabase Dashboard:
1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Copy contents of `supabase/migrations/20251012000000_add_personnel_packages_to_formations.sql`
5. Paste and click **Run**

### Step 2: Create Personnel Configurations (if not done)

1. Open your app
2. Go to **Playbook Settings** or **Personnel Builder**
3. Create personnel configurations:
   - **11 Personnel**: 1 RB, 1 TE, 3 WR
   - **12 Personnel**: 1 RB, 2 TE, 2 WR
   - **21 Personnel**: 2 RB, 1 TE, 2 WR
   - etc.

### Step 3: Assign Personnel to Formations

1. Click the **Formation Builder** button (hero button in playbook)
2. The **Edit Details** tab opens by default
3. Select a formation from the dropdown
4. Click personnel packages to toggle selection:
   - ✓ Selected packages show checkmark
   - Badge shows: "✓ 2 personnel packages selected"
5. Optionally set **Formation Category** (Spread, Pro, Power, etc.)
6. Optionally add **Tags** (comma-separated: "twins, compressed")
7. Optionally add **Description**
8. Click **Save Formation**

### Step 4: Link Formations (Optional)

If you want to create left/right variants:

1. Switch to **Link Formations** tab
2. Select base formation (e.g., "Trips")
3. Select variant formation (e.g., "Trips" again for same-formation linking)
4. Click **Link Formations**
5. **Personnel packages automatically copy to linked formations!**

## How It Works

### Data Flow

```
Personnel Builder
    ↓ (creates)
Personnel Configurations (11 Personnel, 12 Personnel, etc.)
    ↓ (assigned to)
Formation via Edit Details Tab
    ↓ (stores as)
formations.personnel_packages = [uuid1, uuid2, ...]
```

### Database Schema

```sql
CREATE TABLE formations (
  id UUID PRIMARY KEY,
  playbook_id UUID REFERENCES playbooks(id),
  name TEXT NOT NULL,
  
  -- NEW COLUMN ✨
  personnel_packages UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Other columns...
  category TEXT,
  tags TEXT[],
  description TEXT,
  direction TEXT,
  player_positions JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### TypeScript Types

```typescript
// Formation type with personnel packages
interface Formation {
  id: string;
  playbook_id: string;
  name: string;
  
  // Personnel integration
  personnel_packages: string[];  // Array of personnel_configuration IDs
  
  // Other properties...
  category: FormationCategory | null;
  tags: string[];
  description: string | null;
  direction: FormationDirection;
}
```

## Use Cases

### 1. Tag Formation with Multiple Personnel

"Trips" formation can run with both 11 and 12 personnel:

```
Formation: Trips
Personnel Packages: [11 Personnel, 12 Personnel]
Category: Spread
Tags: trips, compressed
```

### 2. Filter Plays by Personnel

Later, you can filter:
- "Show me all formations that can run 11 Personnel"
- "Which formations support 21 Personnel?"

### 3. Automatic Linking

When you link formations:

```typescript
Base Formation (Trips)
  personnel_packages: [11, 12]
  ↓ (linked to)
Left Variant (Trips Left)
  personnel_packages: [11, 12]  // ← Automatically copied!
  ↓ (and)
Right Variant (Trips Right)
  personnel_packages: [11, 12]  // ← Automatically copied!
```

## Components Involved

### FormationBuilderPanel

**File**: `src/components/formations/FormationBuilderPanel.tsx`

**Features**:
- Formation dropdown selector
- Multi-select personnel pills
- Category dropdown
- Tags input
- Description textarea
- Save button

### FormationBuilderModal

**File**: `src/components/playbook/FormationBuilderModal/FormationBuilderModal.tsx`

**Tabs**:
1. **Edit Details** (⚙️) - Personnel assignment (default tab)
2. **Link Formations** (🔗) - Create left/right variants
3. **Draw Formation** (✏️) - Canvas builder (coming soon)

## Verification

### Check Database

```sql
-- See formations with personnel assigned
SELECT 
  id,
  name,
  direction,
  personnel_packages,
  category,
  tags
FROM formations
WHERE playbook_id = 'your-playbook-id';
```

### Check Browser Console

When selecting a formation in Edit Details tab:

```
📝 Formation selected: { 
  id: "uuid", 
  name: "Trips", 
  personnel_packages: ["uuid1", "uuid2"] 
}
```

## Troubleshooting

### "No personnel configurations found"

**Solution**: Create personnel packages first in Personnel Builder

### "No formations found"

**Solution**: Formations are auto-created from plays. Create plays with formation names first.

### Personnel not saving

1. Check browser console for errors
2. Verify migration was applied: `SELECT * FROM information_schema.columns WHERE table_name = 'formations' AND column_name = 'personnel_packages'`
3. Check Supabase RLS policies allow updates to formations table

### Migration failed

If `npx supabase db push` fails:
1. Check your Supabase connection in `.env` or `supabase/config.toml`
2. Manually run SQL via Supabase Dashboard
3. Verify you have admin access to the database

## Next Steps

1. ✅ Apply migration
2. ✅ Create personnel configurations
3. ✅ Assign personnel to formations
4. ✅ Test linking formations
5. 🔜 Use personnel to filter plays
6. 🔜 Display personnel badges on play cards

## Files Modified

### Created
- `supabase/migrations/20251012000000_add_personnel_packages_to_formations.sql` (NEW)

### Existing (Already Implemented)
- `src/components/formations/FormationBuilderPanel.tsx` (✅ Complete)
- `src/components/playbook/FormationBuilderModal/FormationBuilderModal.tsx` (✅ Complete)
- `src/types/formation.ts` (✅ personnel_packages field exists)
- `src/services/formationService.ts` (✅ updateFormation supports personnel_packages)

## Success Criteria

✅ Migration applied without errors  
✅ Edit Details tab shows personnel multi-select  
✅ Clicking personnel toggles selection (checkmark appears)  
✅ Save button persists personnel to database  
✅ Linking formations copies personnel packages  
✅ Database query shows personnel_packages array populated  

---

**Last Updated**: October 12, 2025  
**Status**: ✅ Feature Complete - Migration Pending
