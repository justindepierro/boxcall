# ✅ Migration Checklist

**Date:** October 17, 2025  
**Goal:** Migrate 7 legacy plays to new formation system

---

## Pre-Migration

- [ ] Read `docs/MIGRATION_GUIDE.md`
- [ ] Understand what the migration does
- [ ] Know which plays are being migrated (7 plays)
- [ ] Backup database (optional but recommended)

---

## Step 1: Setup (5 minutes)

- [ ] Go to Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Navigate to Settings → API
- [ ] Copy "service_role" key (NOT anon key)
- [ ] Open `.env` file in editor
- [ ] Add line: `SUPABASE_SERVICE_ROLE_KEY=<your-key>`
- [ ] Save `.env` file
- [ ] Verify `.env` is in `.gitignore` (should already be)

---

## Step 2: Dry Run Test (5 minutes)

- [ ] Open terminal
- [ ] Run: `node scripts/migrate-legacy-plays.js --dry-run`
- [ ] Review output:
  - [ ] Shows 2 playbooks
  - [ ] Shows 7 legacy plays
  - [ ] Lists all play names and formations
  - [ ] Preview looks correct
- [ ] If errors, troubleshoot:
  - [ ] Check service key in `.env`
  - [ ] Restart terminal
  - [ ] Verify key is correct

---

## Step 3: Run Migration (10 minutes)

- [ ] Run: `node scripts/migrate-legacy-plays.js`
- [ ] Read the confirmation prompt carefully
- [ ] Type `yes` to proceed
- [ ] Watch progress:
  - [ ] Each play migrates successfully
  - [ ] Formations created or reused
  - [ ] No errors reported
- [ ] Review summary:
  - [ ] "Plays migrated: 7" ✅
  - [ ] "Formations created: X"
  - [ ] "Formations reused: Y"
  - [ ] "Errors: 0" ✅

---

## Step 4: Verification (10 minutes)

### Database Check

- [ ] Run: `node scripts/check-phase1-state.js`
- [ ] Verify output:
  - [ ] Formations: 3-5 (depending on unique formations)
  - [ ] Plays: 7
  - [ ] Linked: 7/7 (100%)
  - [ ] All formations show `creation_source: 'migration'`

### UI Check

- [ ] Open app: `http://localhost:5173`
- [ ] Go to Playbook view
- [ ] For each play:
  - [ ] Still displays correctly
  - [ ] Formation name still shows
  - [ ] No errors in console
  - [ ] Play can be opened/edited

### New Play Test

- [ ] Create new play with existing formation (e.g., "Trips Right")
- [ ] Check console: Should see "Found existing formation"
- [ ] Verify: No duplicate formation created
- [ ] Run check script again: Should still be same number of formations

---

## Post-Migration

### Success Criteria

- [ ] All 7 legacy plays have `formation_id`
- [ ] 3-5 formations created (no duplicates)
- [ ] All plays still work in UI
- [ ] New plays reuse existing formations
- [ ] No errors in console

### Documentation

- [ ] Update any team docs with migration notes
- [ ] Note which formations were created
- [ ] Record any issues encountered

### Next Steps

- [ ] Can now proceed with Phase 1 testing
- [ ] Ready for formation analytics
- [ ] Ready for confidence scoring
- [ ] Ready for AI recommendations

---

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

1. **Delete created formations:**
   - Query: `DELETE FROM formations WHERE creation_source = 'migration'`
2. **Clear formation_id from plays:**
   - Query: `UPDATE plays SET formation_id = NULL WHERE formation_id IN (SELECT id FROM formations WHERE creation_source = 'migration')`

3. **Re-run migration after fixing issues**

**Note:** You probably won't need this, but it's good to know it exists!

---

## Troubleshooting

### "No playbooks found"

- [ ] Added service key to `.env`?
- [ ] Restarted terminal?
- [ ] Key copied correctly (no extra spaces)?

### "Failed migrations: X"

- [ ] Check output for which plays failed
- [ ] Common issues:
  - [ ] Empty formation name → Add formation to play
  - [ ] Invalid playbook_id → Check play data
- [ ] Fix issues and re-run migration

### Duplicate formations created

- [ ] This shouldn't happen (script normalizes names)
- [ ] If it does, check for:
  - [ ] Extra spaces in formation names
  - [ ] Special characters
  - [ ] Case differences (should be handled)
- [ ] Can manually merge duplicates later

---

## Timeline

**Total Time:** 30 minutes

- Setup: 5 min
- Dry Run: 5 min
- Migration: 10 min
- Verification: 10 min

---

## Questions?

See: `docs/MIGRATION_GUIDE.md` for detailed explanations

---

**Status:** Ready to begin! ✅

**Next:** Add service key to `.env` and run dry run test
