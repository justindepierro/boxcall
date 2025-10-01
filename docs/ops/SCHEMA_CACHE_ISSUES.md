# PostgREST Schema Cache Issues

## Problem

You're seeing errors like:

```
Could not find the 'created_by' column of 'teams' in the schema cache
```

This means PostgREST's internal schema cache is out of sync with your actual database schema.

## Quick Fixes

### Option 1: Run the SQL Script (Fastest)

1. Go to Supabase Dashboard → SQL Editor
2. Open a new query
3. Copy and paste the contents of `database/check-schema-cache.sql`
4. Run the script
5. Refresh your application

### Option 2: Restart PostgREST Server

1. Go to Supabase Dashboard
2. Navigate to **Project Settings** → **API**
3. Scroll to **PostgREST Settings**
4. Click **"Restart Server"**
5. Wait 30-60 seconds
6. Refresh your application

### Option 3: Use the Reload Script

```bash
npm run db:reload-cache
# or
tsx scripts/reload-schema-cache.ts
```

### Option 4: Manual SQL Command

Run this in Supabase SQL Editor:

```sql
NOTIFY pgrst, 'reload schema';
```

## Root Causes

### 1. Schema Changes Without Cache Reload

- You added/modified columns but didn't reload the cache
- **Solution**: Always reload after schema changes

### 2. Database Migrations Not Applied

- The schema.sql has columns that weren't applied to the database
- **Solution**: Run migrations or apply schema changes manually

### 3. Supabase Project Restart Needed

- Sometimes the PostgREST server needs a full restart
- **Solution**: Use Option 2 above

## Prevention

### After Schema Changes

Always reload the schema cache after:

- Adding/removing columns
- Adding/removing tables
- Changing column types
- Modifying constraints

### Automated Reload

Add this to your migration scripts:

```sql
-- At the end of your migration
NOTIFY pgrst, 'reload schema';
```

## Verification

After reloading, verify the fix:

1. **Check column exists**:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'teams'
  AND column_name = 'created_by';
```

2. **Test API call**:

```bash
curl "YOUR_SUPABASE_URL/rest/v1/teams?select=id,created_by&limit=1" \
  -H "apikey: YOUR_ANON_KEY"
```

3. **Check application**: Try creating a play in your app

## Troubleshooting

### Still seeing errors after reload?

1. **Check if column actually exists**:
   - Run the verification SQL above
   - If no results, the column is missing
   - Apply schema changes from `database/schema.sql`

2. **Wait a bit longer**:
   - Cache reload can take 30-60 seconds
   - Try again after waiting

3. **Check RLS policies**:
   - Sometimes RLS policies reference non-existent columns
   - Review policies with: `SELECT * FROM pg_policies WHERE tablename = 'teams'`

4. **Full project restart**:
   - Go to Supabase Dashboard → Project Settings
   - Pause and resume the project
   - Wait 2-3 minutes

### Need to verify schema?

```sql
-- List all tables and their columns
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('teams', 'plays', 'playbooks')
ORDER BY table_name, ordinal_position;
```

## Related Files

- `database/schema.sql` - Full database schema
- `database/check-schema-cache.sql` - Diagnostic script
- `scripts/reload-schema-cache.ts` - Reload helper script

## Additional Resources

- [PostgREST Schema Cache](https://postgrest.org/en/stable/schema_cache.html)
- [Supabase CLI Migrations](https://supabase.com/docs/guides/cli/local-development)
