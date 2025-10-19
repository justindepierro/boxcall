# Play Type Migration - Manual Instructions

**Date:** October 17, 2025  
**Purpose:** Remove CHECK constraint to allow custom play types

## How to Apply Migration

### Option 1: Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Navigate to: **SQL Editor**

2. **Copy Migration SQL**
   - Open file: `database/migrations/20251017_expand_play_types.sql`
   - Copy ALL contents

3. **Run Migration**
   - Paste into SQL Editor
   - Click **Run**
   - Wait for "Success" message

4. **Verify**
   - Run this query to check current play types:
   ```sql
   SELECT DISTINCT p_type, COUNT(*) as count
   FROM plays
   WHERE p_type IS NOT NULL
   GROUP BY p_type
   ORDER BY count DESC;
   ```

### Option 2: psql Command Line

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# Run migration
\i database/migrations/20251017_expand_play_types.sql
```

## What This Does

### Before Migration

- ❌ **Limited to 4 types only:** Pass, Run, RPO, Play Action
- ❌ Cannot add custom types like "Screen", "Bootleg", "QB Sneak"
- ❌ Database CHECK constraint blocks anything else

### After Migration

- ✅ **Unlimited custom types:** Coaches can create any play type
- ✅ **Still validated:** 1-50 characters, no special symbols
- ✅ **Examples allowed:**
  - Screen
  - Bootleg
  - Draw
  - QB Sneak
  - Trick Play
  - My Custom Type

## Validation Rules

The trigger function ensures:

- ✅ Length: 1-50 characters
- ✅ Characters: Letters, numbers, spaces, hyphens only
- ✅ No empty strings
- ❌ Blocks: Special symbols (@#$%), too long, empty

## Testing

After migration, try these in SQL Editor:

```sql
-- ✅ Should work (custom type)
INSERT INTO plays (playbook_id, formation, play_name, p_type)
VALUES ('your-playbook-id', 'Shotgun', 'Test', 'Screen');

-- ✅ Should work
UPDATE plays SET p_type = 'Bootleg' WHERE id = 'some-play-id';

-- ❌ Should fail (empty)
INSERT INTO plays (playbook_id, formation, play_name, p_type)
VALUES ('your-playbook-id', 'Shotgun', 'Test', '');

-- ❌ Should fail (special chars)
INSERT INTO plays (playbook_id, formation, play_name, p_type)
VALUES ('your-playbook-id', 'Shotgun', 'Test', 'Type@#$');
```

## Rollback (if needed)

To restore original constraint:

```sql
DROP TRIGGER IF EXISTS validate_play_type_trigger ON plays;
DROP FUNCTION IF EXISTS validate_play_type();
ALTER TABLE plays ADD CONSTRAINT plays_p_type_check
  CHECK (p_type IN ('Pass', 'Run', 'RPO', 'Play Action'));
```

## Next Steps

After migration:

1. ✅ Update UI to allow custom play type entry
2. ✅ Update validation schemas in TypeScript
3. ✅ Test creating plays with custom types
