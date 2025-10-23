# 🔄 Legacy Play Migration Guide

**Date:** October 17, 2025  
**Status:** ✅ **MIGRATION COMPLETE**  
**Result:** 7/7 plays successfully linked to formations  
**Time Taken:** ~10 minutes

---

## ✅ MIGRATION COMPLETE - SUMMARY

**Executed:** October 17, 2025

**Results:**

- ✅ **7 plays migrated** (100% success rate)
- ✅ **0 formations created** (reused existing "Twins" and "Trips")
- ✅ **7 formations reused** (4 plays → Twins L, 3 plays → Trips R)
- ✅ **Direction normalization applied** (all directions standardized to "R" or "L")
- ✅ **Zero errors** during migration

**Migrated Plays:**

1. Cross → Twins (L)
2. Same Power Read → Twins (L)
3. Smaug → Twins (L)
4. Shaq → Twins (L)
5. Iz → Trips (R)
6. Power Read → Trips (R)
7. Slice → Trips (R)

**Impact:**

- All legacy plays now feed into formation analytics
- Compatible with Phase 1 auto-creation system
- Direction normalization matches FormationService standards

---

## 🎯 What This Migration Does (Archive)

The migration script will:

1. ✅ Find all plays without `formation_id` (your 7 legacy plays)
2. ✅ Auto-create formations from their formation text (e.g., "Trips Right")
3. ✅ Link each play to its formation via `formation_id`
4. ✅ Mark formations as created by "migration" (for tracking)
5. ✅ Reuse existing formations (no duplicates!)

**What WON'T change:**

- ❌ Your play data (name, type, formation text, etc. all stay the same)
- ❌ Your playbook structure
- ❌ Anything visible in the UI

**What WILL change:**

- ✅ Each play gets a `formation_id` field populated
- ✅ Formations are created in the database
- ✅ Your plays now feed into formation analytics!

---

## 🚀 Step-by-Step Migration

### **Step 1: Add Service Role Key (Required for RLS bypass)**

The migration script needs admin access to read all your plays. You'll need to add your Supabase service role key to `.env`:

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project
   - Go to Settings → API

2. **Copy Service Role Key**
   - Find "service_role" key (NOT the anon key!)
   - Click to reveal and copy it
   - ⚠️ **IMPORTANT**: This key has admin access - never commit it to git!

3. **Add to .env file**

   ```bash
   # Open .env file
   code .env

   # Add this line (replace with your actual key):
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Save and close** `.env`

---

### **Step 2: Dry Run (Test Mode)**

Before making any changes, let's do a test run to see what will happen:

```bash
node scripts/migrate-legacy-plays.js --dry-run
```

**Expected Output:**

```
🔄 Legacy Play Migration Script
================================================================================
Mode: DRY RUN (no changes)
================================================================================

📚 Step 1: Finding playbooks...
   ✓ Found 2 playbooks

🏈 Step 2: Finding legacy plays...
   📖 My Playbook: 5 legacy plays
   📖 Test Playbook: 2 legacy plays

   ✓ Total legacy plays to migrate: 7

📋 MIGRATION PREVIEW
================================================================================

Found 7 plays without formation_id:

1. Play Name 1
   Formation: "Trips Right"
   Type: pass
   Playbook: abc123...

2. Play Name 2
   Formation: "Empty"
   Type: run
   Playbook: abc123...

[... etc for all 7 plays ...]

================================================================================
This script will:
  1. Create formations for each unique formation name
  2. Link each play to its formation via formation_id
  3. Mark formations as created by "migration"

Your plays will NOT be modified except for adding formation_id.
================================================================================
```

**Review the preview:**

- ✅ Are all 7 plays listed?
- ✅ Do the formation names look correct?
- ✅ Are these the plays you want to migrate?

---

### **Step 3: Run the Migration**

If the dry run looks good, run the actual migration:

```bash
node scripts/migrate-legacy-plays.js
```

**You'll be prompted to confirm:**

```
⚠️  Proceed with migration? (yes/no):
```

Type `yes` and press Enter.

**Expected Output:**

```
🔄 Step 3: Migrating plays...
================================================================================

📝 Migrating: Play Name 1
   Formation: "Trips Right"
   + Creating formation: Trips Right
   ✓ Linked to formation: Trips Right (abc123...)

📝 Migrating: Play Name 2
   Formation: "Trips Right"
   ✓ Reusing existing formation: Trips Right
   ✓ Linked to formation: Trips Right (abc123...)

[... continues for all 7 plays ...]

================================================================================
📊 MIGRATION SUMMARY
================================================================================

✅ Success:
   • Legacy plays found: 7
   • Plays migrated: 7
   • Formations created: 3
   • Formations reused: 4

🎉 Migration complete!

✅ Next steps:
   1. Verify: Open your playbook and check the plays
   2. Test: Create a new play to verify auto-creation still works
   3. Analytics: Your migrated plays now feed into formation analytics!

================================================================================
```

---

### **Step 4: Verify Migration**

Now let's verify everything worked:

1. **Check database state:**

   ```bash
   node scripts/check-phase1-state.js
   ```

   **Expected:**
   - Formations: 3-5 (depending on unique formations)
   - Plays: 7 (your legacy plays)
   - Linked: 100% ✅

2. **Check in UI:**
   - Open your app: http://localhost:5173
   - Go to Playbook view
   - Click on a play
   - Verify it still looks correct

3. **Test new play creation:**
   - Create a new play with formation "Trips Right"
   - It should reuse the existing formation (no duplicate!)
   - Check console: Should see "Found existing formation: Trips Right"

---

## 📊 Understanding the Results

### **Formations Created vs Reused**

If you have 7 plays but only 3 formations were created, that's **good**! It means:

- Multiple plays share the same formation
- No duplicates were created
- Formations are properly reused

**Example:**

```
Play 1: "Trips Right" → Creates "Trips Right" formation
Play 2: "Trips Right" → Reuses "Trips Right" formation
Play 3: "Empty"       → Creates "Empty" formation
Play 4: "Trips Right" → Reuses "Trips Right" formation
Play 5: "Doubles"     → Creates "Doubles" formation
Play 6: "Empty"       → Reuses "Empty" formation
Play 7: "Doubles"     → Reuses "Doubles" formation

Result: 7 plays, 3 formations (perfect!)
```

---

## 🐛 Troubleshooting

### **Error: "No playbooks found. Check authentication."**

**Solution:**

1. Make sure you added `SUPABASE_SERVICE_ROLE_KEY` to `.env`
2. Restart the terminal to reload environment variables
3. Verify the key is correct (copy from Supabase dashboard)

### **Error: "column playbooks.user_id does not exist"**

**Solution:** The script has been fixed - pull latest version.

### **Error: "Failed migrations: X"**

**Solution:**

- Check which plays failed (listed in output)
- Common issues:
  - Empty formation name → Fix: Add formation name to play
  - Invalid playbook_id → Fix: Verify play belongs to valid playbook
- You can manually fix these plays and re-run the script

### **Formations duplicated**

**Solution:**

- This shouldn't happen (case-insensitive matching!)
- If it does, check formation names for subtle differences:
  - "Trips Right" vs "Trips Right" (extra space)
  - "Trips Right" vs "TripsRight" (no space)
- The script normalizes these, but check anyway

---

## ✅ Success Checklist

After migration, you should have:

- [ ] All 7 plays have `formation_id` populated
- [ ] 3-5 formations created (depending on unique formation names)
- [ ] No duplicate formations
- [ ] Formations marked with `creation_source = 'migration'`
- [ ] All plays still look correct in UI
- [ ] New plays can still be created
- [ ] New plays reuse existing formations

---

## 🎉 What You Accomplished

**Before Migration:**

```
Play 1: formation="Trips Right", formation_id=null ⚠️
Play 2: formation="Empty",       formation_id=null ⚠️
Play 3: formation="Trips Right", formation_id=null ⚠️
[... 4 more plays without formation_id ...]

Analytics: 0 plays usable ❌
```

**After Migration:**

```
Play 1: formation="Trips Right", formation_id=abc-123 ✅
Play 2: formation="Empty",       formation_id=def-456 ✅
Play 3: formation="Trips Right", formation_id=abc-123 ✅
[... 4 more plays with formation_id ...]

Formation "Trips Right": 3 plays linked
Formation "Empty": 2 plays linked
Formation "Doubles": 2 plays linked

Analytics: 7 plays usable ✅
Confidence scoring: Ready ✅
AI recommendations: Ready ✅
```

---

## 🚀 Next Steps

Now that your legacy plays are migrated:

1. **Create new plays** - They'll auto-create formations just like before
2. **All plays linked** - Your entire playbook feeds into analytics
3. **Ready for Phase 2** - Data quality validation and cleanup
4. **Ready for Phase 4+** - Practice scripts, game plans, confidence scoring!

---

## 📝 Quick Reference

```bash
# Test migration (no changes)
node scripts/migrate-legacy-plays.js --dry-run

# Run actual migration
node scripts/migrate-legacy-plays.js

# Verify results
node scripts/check-phase1-state.js
```

---

**🎯 Ready to migrate? Start with the dry run!**
