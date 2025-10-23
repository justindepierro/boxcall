# Personnel System Migration Guide - Phase 2

## 🎯 Goal

Apply the personnel system database schema to enable:

- Personnel configurations (11 Personnel, 12 Personnel, etc.)
- Personnel players (QB, RB, TE, WR positions)
- Integration with existing plays table
- Diagram preloading support

## 📋 Prerequisites

- [x] Phase 1 Complete (Personnel Modal UX fixed)
- [ ] Access to Supabase Dashboard
- [ ] Service Role Key or database connection

## 🚀 Migration Steps

### Option 1: Supabase Dashboard (Recommended ✅)

1. **Open SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl/editor
   - Click "+ New query"

2. **Copy Migration SQL:**
   - Open: `supabase/migrations/20251011000000_add_personnel_system.sql`
   - Copy entire file contents

3. **Paste and Run:**
   - Paste SQL into the query editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for completion (should take 5-10 seconds)

4. **Verify Success:**
   - Check for green success message
   - Look for "MIGRATION COMPLETE ✅" in output
   - No errors should appear

5. **Verify Tables Created:**
   ```sql
   -- Run this query to verify:
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'personnel%';
   ```
   Should return:
   - `personnel_configurations`
   - `personnel_players`

### Option 2: psql CLI

1. **Get Connection String:**
   - Supabase Dashboard → Project Settings → Database
   - Copy Connection String (use service_role or postgres role)

2. **Run Migration:**

   ```bash
   psql "postgresql://postgres.lvmuiqwihlpnwppdqqfl:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres" \
     -f supabase/migrations/20251011000000_add_personnel_system.sql
   ```

3. **Verify:**
   ```bash
   psql [connection-string] -c "\dt personnel*"
   ```

### Option 3: Supabase CLI (Local Dev)

1. **Reset Database:**

   ```bash
   supabase db reset
   ```

   This applies ALL migrations including the new one.

2. **Or Push Single Migration:**
   ```bash
   supabase db push
   ```

## ✅ Verification Checklist

After running the migration, verify:

### 1. Tables Exist

```sql
SELECT COUNT(*) FROM personnel_configurations;
SELECT COUNT(*) FROM personnel_players;
```

### 2. Default 11 Personnel Created

```sql
SELECT
  pc.name,
  pc.description,
  COUNT(pp.id) as player_count
FROM personnel_configurations pc
LEFT JOIN personnel_players pp ON pp.config_id = pc.id
WHERE pc.name = '11 Personnel'
GROUP BY pc.id, pc.name, pc.description;
```

Should show:

- Name: "11 Personnel"
- Description: "1 RB, 1 TE, 2 WR"
- Player count: 5 (1 QB + 1 RB + 1 TE + 2 WR)

### 3. QB Always at Position 0

```sql
SELECT
  position,
  label,
  sort_order
FROM personnel_players
WHERE config_id = (SELECT id FROM personnel_configurations LIMIT 1)
ORDER BY sort_order;
```

Should show:

```
position | label | sort_order
---------|-------|------------
QB       | Q     | 0
RB       | R     | 1
TE       | T     | 2
WR       | X     | 3
WR       | Y     | 4
```

### 4. RLS Policies Active

```sql
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename LIKE 'personnel%'
ORDER BY tablename, policyname;
```

Should return multiple policies for both tables.

### 5. Plays Updated

```sql
SELECT
  personnel,
  COUNT(*) as play_count
FROM plays
GROUP BY personnel
ORDER BY play_count DESC;
```

Should show "11 Personnel" as most common value.

## 🐛 Troubleshooting

### Error: "relation personnel_configurations already exists"

**Solution:** Tables already created. Either:

- Run rollback first: `supabase/migrations/20251011000001_rollback_personnel_system.sql`
- Or skip this migration (already applied)

### Error: "permission denied"

**Solution:** Use service_role key or postgres superuser.

### Error: "foreign key constraint violation"

**Solution:** Ensure playbooks table exists and has data.

### No default 11 Personnel created

**Solution:** Run the seed SQL manually:

```sql
DO $$
DECLARE
  playbook_record RECORD;
  config_id UUID;
BEGIN
  FOR playbook_record IN SELECT id, name FROM playbooks LOOP
    INSERT INTO personnel_configurations (playbook_id, name, description)
    VALUES (playbook_record.id, '11 Personnel', '1 RB, 1 TE, 2 WR')
    RETURNING id INTO config_id;

    INSERT INTO personnel_players (config_id, position, label, sort_order)
    VALUES
      (config_id, 'QB', 'Q', 0),
      (config_id, 'RB', 'R', 1),
      (config_id, 'TE', 'T', 2),
      (config_id, 'WR', 'X', 3),
      (config_id, 'WR', 'Y', 4);
  END LOOP;
END $$;
```

## 🎉 Success Indicators

You'll know the migration succeeded when:

1. ✅ No errors in SQL output
2. ✅ Both tables created (`personnel_configurations`, `personnel_players`)
3. ✅ RLS policies active on both tables
4. ✅ Default "11 Personnel" exists for all playbooks
5. ✅ Each 11 Personnel has exactly 5 players (QB, RB, TE, WR, WR)
6. ✅ QB is always at sort_order = 0
7. ✅ Existing plays updated to "11 Personnel"
8. ✅ Helper functions created (`get_personnel_configuration_by_name`, `get_personnel_players`)

## 📝 After Migration

Once migration is successful, proceed to:

- **Phase 3:** Create `personnelService.ts` and React hooks
- **Phase 4:** Connect personnel selector to AddNewPlayModal
- **Phase 5:** Integrate with FieldCanvas diagram system

## 🔙 Rollback (If Needed)

If you need to undo this migration:

```bash
# Run rollback migration
psql [connection-string] -f supabase/migrations/20251011000001_rollback_personnel_system.sql
```

Or via Supabase Dashboard:

- Open SQL Editor
- Run contents of `20251011000001_rollback_personnel_system.sql`

---

**Created:** October 11, 2025  
**Phase:** 2 of 8  
**Status:** Ready to apply  
**Estimated Time:** 5-10 minutes
