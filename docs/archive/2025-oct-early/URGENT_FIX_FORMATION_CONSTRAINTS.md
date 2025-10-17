# 🔧 URGENT FIX: Formation Constraint Error

## Problem

You're getting this error when trying to create formations:
```
new row for relation "formations" violates check constraint "formations_variants_have_parent"
```

## Root Cause

Your database has **old constraints** from a previous formation system that used `base_formation_id`. The migration on Oct 16 changed to use `opposite_formation_id` instead, but didn't drop the old constraints.

## Solution

Run this SQL in your **Supabase SQL Editor**:

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run This SQL

```sql
-- Drop old constraint that requires variants to have base_formation_id
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_variants_have_parent CASCADE;

-- Drop old constraint about base formations
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_base_has_no_parent CASCADE;

-- Drop old unique index for variants per base
DROP INDEX IF EXISTS idx_formations_unique_variant CASCADE;

-- Drop old unique index for base formation names
DROP INDEX IF EXISTS idx_formations_unique_base_name CASCADE;

-- Verify it worked
SELECT '✅ Constraints dropped successfully' as result;
```

### Step 3: Verify

After running the SQL, refresh your BoxCall app and try:
1. Click "Data Diagnostic" tab
2. Click "Show Raw Data (Debug Mode)"
3. Check if it loads without errors

## What This Does

- ✅ Removes outdated `base_formation_id` constraints
- ✅ Allows the new `opposite_formation_id` system to work
- ✅ Enables Phase 1 formation direction features
- ✅ Lets you create new formations without errors

## After the Fix

Once this is done, your Formation Direction Review system will work properly and you'll be able to:
- See formations that need opposites
- Create opposite formations
- Mark formations as standalone

---

**Do this now, then come back and test the Data Diagnostic tab!** 🚀
