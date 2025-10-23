# RLS Migration Steps

## 🚨 CRITICAL: Run this ASAP to fix play creation

Your app currently **cannot create plays** due to a broken RLS policy. This migration fixes it.

---

## Step-by-Step Instructions

### 1. Open Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### 2. Run the Migration

1. Click **New Query** button
2. Copy the **entire contents** of `database/migrations/fix_rls_policies.sql`
3. Paste into the SQL editor
4. Click **Run** (or press Cmd+Enter)

### 3. Verify Success

You should see output like:

```
DROP POLICY
CREATE POLICY (Coaches can insert plays)
CREATE POLICY (Coaches can update plays)
CREATE POLICY (Coaches can delete plays)
DROP POLICY (duplicate removed)
```

### 4. Check Policies

Run this verification query:

```sql
-- Should show 4 policies: SELECT, INSERT, UPDATE, DELETE
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'plays'
ORDER BY cmd;
```

Expected output:
| policyname | cmd |
|------------|-----|
| Coaches can delete plays | DELETE |
| Coaches can insert plays | INSERT |
| Team members can view plays | SELECT |
| Coaches can update plays | UPDATE |

### 5. Test Play Creation

Run this test as a coach user:

```sql
-- Replace 'your-playbook-id' with an actual playbook ID from your account
INSERT INTO plays (playbook_id, play_name, formation, p_type)
VALUES ('your-playbook-id', 'Test Security Play', 'I-Form', 'run')
RETURNING id, play_name;
```

**Expected:** Should succeed and return the new play ID
**If it fails:** Check that your user has coach role in team_members table

---

## Troubleshooting

### "permission denied for table plays"

- **Cause:** Not authenticated or no RLS policy allows access
- **Fix:** Make sure you're logged in with a coach account

### "violates row-level security policy"

- **Cause:** User is not a coach or not in the team
- **Fix:** Check `team_members` table for user's role

### "relation 'plays' does not exist"

- **Cause:** Wrong database or schema
- **Fix:** Verify you're in the correct Supabase project

### Rollback (if needed)

If something goes wrong, you can rollback:

```sql
-- Recreate the old broken policy
DROP POLICY IF EXISTS "Coaches can insert plays" ON plays;
DROP POLICY IF EXISTS "Coaches can update plays" ON plays;
DROP POLICY IF EXISTS "Coaches can delete plays" ON plays;

CREATE POLICY "Team coaches can manage plays" ON plays
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = plays.playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );
```

---

## What This Migration Does

1. **Fixes Broken INSERT Policy**
   - Old: Single "ALL" policy missing WITH CHECK clause
   - New: Separate INSERT/UPDATE/DELETE policies with proper clauses
   - Result: Play creation works again

2. **Removes Duplicate SELECT Policy**
   - Old: Two identical SELECT policies on playbooks table
   - New: One clean SELECT policy
   - Result: Cleaner policy list, no confusion

3. **Adds profiles UPDATE Policy** (if missing)
   - Ensures users can update their favorites/recent plays
   - Stored in profiles.settings JSONB column

---

## After Migration

Once complete, you can:

- ✅ Create plays (INSERT will work)
- ✅ Update plays (UPDATE will work)
- ✅ Delete plays (DELETE will work)
- ✅ View plays (SELECT already worked)

**Next step:** Update PlaybookPage to use SecurePlaysService for added validation and rate limiting.

---

**Estimated Time:** 5 minutes  
**Risk Level:** Low (rollback available)  
**Impact:** HIGH (fixes broken play creation)
