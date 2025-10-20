# Migration Guide: play_assignments Table

## Quick Run

```bash
# Via Supabase CLI (recommended)
supabase db push

# Or manually via psql
psql -U postgres -h db.your-project.supabase.co -d postgres -f database/migrations/20251020_create_play_assignments.sql
```

## What This Migration Does

Creates the `play_assignments` table for storing position-specific instructions and assignments for plays.

### Features:

- One assignment per position per play
- Player tagging (mention players in assignments)
- Hashtags for organization
- Shared play notes
- Full RLS security (coaches can edit, players can view)

## Migration is Now Idempotent

✅ Safe to run multiple times  
✅ Uses `CREATE TABLE IF NOT EXISTS`  
✅ Uses `CREATE INDEX IF NOT EXISTS`  
✅ Drops existing policies before recreating

## Re-running After Error

If you got the error:

```
ERROR: relation "idx_play_assignments_play_id" already exists
```

**The migration has been fixed!** Just run it again and it will:

1. Skip creating the table (already exists)
2. Skip creating indexes (already exist)
3. Drop and recreate policies (updated)

## Verify Migration Succeeded

```sql
-- Check table exists
\d play_assignments

-- Check indexes
\di play_assignments*

-- Check policies
\dp play_assignments

-- Or query the table
SELECT * FROM play_assignments LIMIT 5;
```

## Rollback (if needed)

```sql
-- Drop everything created by this migration
DROP TABLE IF EXISTS play_assignments CASCADE;
DROP FUNCTION IF EXISTS update_play_assignments_updated_at() CASCADE;
```

## Next Steps

After migration succeeds:

1. Create TypeScript types for `play_assignments`
2. Create service functions to query/update assignments
3. Build UI components for coaches to create assignments
4. Build player view to see their position assignments

---

**Note:** The "Load failed (api.supabase.com)" error you saw earlier was from trying to run this migration before it was idempotent. It should work now!
