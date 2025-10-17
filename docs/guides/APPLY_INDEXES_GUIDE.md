# Apply Formation Indexes - Manual Steps

**Goal:** Add performance indexes to formations table  
**Expected Improvement:** 40-60% faster queries  
**Time Required:** 2 minutes  

---

## Option 1: Via Supabase Dashboard (EASIEST)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in sidebar
   - Click "New query"

3. **Copy/Paste Migration**
   - Copy contents of: `supabase/migrations/20251017000002_add_formation_indexes.sql`
   - Paste into SQL Editor
   - Click "Run" button

4. **Verify Success**
   - Should see: "Success. No rows returned"
   - Check console for index creation messages

---

## Option 2: Via npx supabase CLI

```bash
# This will apply ALL pending migrations including indexes
npx supabase db push
```

**Note:** May show errors for already-applied migrations (safe to ignore)

---

## Option 3: Via psql (If you have connection string)

```bash
# Get connection string from Supabase Dashboard → Settings → Database
# Look for "Connection string" under "Connection pooling"

# Then run:
psql "your-connection-string-here" -f supabase/migrations/20251017000002_add_formation_indexes.sql
```

---

## Verification

After applying, you should see these indexes:

1. ✅ `idx_formations_playbook_id`
2. ✅ `idx_formations_direction`
3. ✅ `idx_formations_metadata_quality`
4. ✅ `idx_formations_playbook_direction`
5. ✅ `idx_formations_opposite_id`
6. ✅ `idx_formations_creation_source`
7. ✅ `idx_formations_playbook_quality_source`

**Check in SQL Editor:**
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'formations'
ORDER BY indexname;
```

---

## Expected Results

**Before:**
- Formation queries: 2-3 seconds
- Direction Review: Slow
- Incomplete panel: Slow

**After:**
- Formation queries: 1-1.5 seconds (40-50% faster)
- Direction Review: Much faster
- Incomplete panel: Much faster

---

## Next Steps

After indexes are applied:

1. Test the application
2. Check if performance is acceptable
3. If still slow, proceed to Phase 2 (React Query)
4. If fast enough, you're done! 🎉

---

**Recommendation:** Use Option 1 (Supabase Dashboard) - it's the easiest and safest.

