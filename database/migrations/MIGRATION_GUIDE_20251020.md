# Quick Guide: Running the Formation/Personnel Fix

## What This Does

Fixes plays where personnel package names (like "6 Players" or "Blue") were incorrectly saved in the formation field.

## Before You Start

1. **Backup your database:**

   ```bash
   pg_dump -U your_user boxcall_prod > backup_before_formation_fix_$(date +%Y%m%d).sql
   ```

2. **Test on development first** (IMPORTANT!)

## Step 1: Test on Development

```bash
# Connect to dev database
psql -U your_user -d boxcall_dev -f database/migrations/20251020_fix_formation_personnel_mixup.sql
```

**Expected output:**

```
NOTICE:  Found X plays with personnel packages in formation field
NOTICE:  Set formation = NULL for X plays
NOTICE:  MANUAL ACTION REQUIRED: Review and set correct formation names for affected plays
```

## Step 2: Review Affected Plays (Dev)

```sql
-- See what needs to be fixed
SELECT id, play_name, formation, personnel, p_type
FROM plays
WHERE formation IS NULL
ORDER BY play_name
LIMIT 20;
```

**Example of what you'll see:**
| id | play_name | formation | personnel | p_type |
|----|-----------|-----------|-----------|--------|
| 123 | Power | NULL | 6 Players | Run |
| 456 | Mesh | NULL | Blue | Pass |

**What to do:**

- Set formation to actual formation names: "Shotgun", "I Formation", "Ace", etc.
- The personnel field should already be correct (don't change it)

## Step 3: Run on Production

**Only after testing on dev and confirming it works!**

```bash
# Connect to production database
psql -U your_user -d boxcall_prod -f database/migrations/20251020_fix_formation_personnel_mixup.sql
```

## Step 4: Manual Cleanup

### Option A: Via SQL (Fast)

```sql
-- Set common formation names for NULL entries
-- (Adjust based on your playbook)

-- Example: Set all run plays without formation to "I Formation"
UPDATE plays
SET formation = 'I Formation'
WHERE formation IS NULL
  AND p_type = 'Run'
  AND personnel IN ('21', '22');

-- Example: Set all pass plays without formation to "Shotgun"
UPDATE plays
SET formation = 'Shotgun'
WHERE formation IS NULL
  AND p_type = 'Pass'
  AND personnel IN ('11', '10');
```

### Option B: Via UI (Careful)

1. Filter plays where formation is empty
2. Edit each play individually
3. Set appropriate formation name
4. The new validation will prevent you from re-entering personnel names

## Step 5: Verify Fix

```sql
-- Should return 0 rows (no more bad data)
SELECT formation, COUNT(*) as count
FROM plays
WHERE formation ~ '^\d+\s+Players?$'
   OR formation ~ '^\d{2}\s+Personnel$'
   OR formation IN ('Blue', 'Black', 'Green', 'Red', 'Gold')
   OR formation ~ '^\d{2}$'
GROUP BY formation;
```

## Common Formation Names to Use

| Personnel             | Typical Formations              |
| --------------------- | ------------------------------- |
| 11 (1 RB, 1 TE, 3 WR) | Shotgun, Pistol, Empty          |
| 12 (1 RB, 2 TE, 2 WR) | Ace, Deuce, Pro                 |
| 21 (2 RB, 1 TE, 2 WR) | I Formation, Split Back, Strong |
| 22 (2 RB, 2 TE, 1 WR) | Power, Goal Line, Heavy         |

## Troubleshooting

### "No matches found"

✅ Good! This means you don't have any corrupt data.

### "Found 0 plays"

✅ Also good! Your data is clean.

### "Found 100+ plays"

⚠️ You have significant cleanup to do. Consider:

- Reviewing your data entry process
- Training users on field differences
- Using the UI to batch-edit by playbook

### Migration fails with error

❌ Stop! Check:

- Are you connected to the right database?
- Do you have write permissions?
- Is the plays table accessible?
- Run `\d plays` to verify table structure

## After the Fix

The frontend validation is now active and will:

- ✅ Prevent "6 Players" from being saved in formation field
- ✅ Show helpful error messages
- ✅ Suggest correct values
- ✅ Guide users to proper field usage

**Test it:**

1. Try to create a new play with "11" in the formation field
2. You should get an error: "11 looks like a personnel package..."
3. Change to "Shotgun" and it should work

## Need Help?

If you encounter issues:

1. Check the full documentation: `docs/DATA_INTEGRITY_FORMATION_PERSONNEL_FIX.md`
2. Restore from backup if needed: `psql -U your_user -d boxcall_prod < backup_file.sql`
3. The personnel field should NOT be modified by this migration
4. Setting formation to NULL is safe - you can always fill it in later

---

**Remember:** Test on dev first! Don't skip the backup!
