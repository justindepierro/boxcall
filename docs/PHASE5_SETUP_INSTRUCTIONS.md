# Phase 5: Game Plan Builder - Setup Instructions

## 🚀 Quick Start

### Step 1: Apply Database Migration

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/lvmuiqwihlpnwppdqqfl/sql/new
2. Copy the contents of `database/migrations/20251019_create_game_plans.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute
5. Verify tables were created in the Table Editor

**Option B: Via Command Line**

```bash
# If you have direct database access
psql "postgresql://postgres.[your-ref]:[password]@[host]:5432/postgres" \
  -f database/migrations/20251019_create_game_plans.sql
```

### Step 2: Verify Migration Success

After running the migration, verify these tables exist in Supabase:

- ✅ `game_plans` - Main game plan table
- ✅ `game_plan_situations` - Billick situations (12 types)
- ✅ `game_plan_plays` - Junction table for plays in situations

You can verify by running this query in the SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'game_plan%';
```

Expected output:

```
game_plans
game_plan_situations
game_plan_plays
```

---

## 📋 What We've Built So Far

### ✅ Completed

1. **Database Schema** (`database/migrations/20251019_create_game_plans.sql`)
   - 3 tables with proper RLS policies
   - Supports Billick's 12 situation types
   - Cascading deletes for data integrity

2. **Billick Situation Constants** (`src/constants/gamePlanSituations.ts`)
   - 12 standard situations (1st & 10, 3rd & Short, Red Zone, etc.)
   - Helper functions for labels, colors, validation
   - TypeScript types for type safety

### 🚧 Next Steps

3. **Refactor Game Plan Service** (`src/services/gamePlanService.ts`)
   - Remove mock data
   - Connect to database tables
   - Implement CRUD operations
   - Add duplicate/archive functionality

4. **Create GamePlanModal Component**
   - Similar to PracticeScriptModal
   - Opponent field + game date picker
   - Situation tabs for organizing plays
   - Drag-and-drop within situations

5. **PDF Export**
   - Situational call sheet layout
   - Print-friendly for press box
   - Include wristband numbers

---

## 🎯 Game Plan Structure

### Billick's 12 Situations

1. **1st & 10** - First down plays
2. **2nd & Short** (1-3 yards) - Short yardage, 2nd down
3. **2nd & Medium** (4-7 yards) - Medium distance
4. **2nd & Long** (8+ yards) - Long distance
5. **3rd & Short** (1-3 yards) - Critical short conversions
6. **3rd & Medium** (4-7 yards) - Medium distance conversions
7. **3rd & Long** (8+ yards) - Long distance conversions
8. **Red Zone** (Inside 20) - Scoring territory
9. **Goal Line** (Inside 5) - Goal line offense
10. **Two-Minute Drill** - End of half/game
11. **Short Yardage** (4th & 1-2) - Power situations
12. **Situational** - Trick plays, special situations

### Data Flow

```
Game Plan
  └─ Situation (1st & 10)
      ├─ Play 1 (Priority 1)
      ├─ Play 2 (Priority 2)
      └─ Play 3 (Priority 3)
  └─ Situation (3rd & Short)
      ├─ Play 1 (Priority 1)
      └─ Play 2 (Priority 2)
  ...
```

---

## 🔧 File Locations

```
database/
  └─ migrations/
      └─ 20251019_create_game_plans.sql ← Apply this first!

src/
  └─ constants/
      └─ gamePlanSituations.ts ← Billick situations
  └─ services/
      └─ gamePlanService.ts ← Needs refactoring (next)
  └─ components/
      └─ playbook/
          └─ GamePlanModal.tsx ← To be created
```

---

## 📊 Progress Tracker

- [x] Database schema created
- [x] Billick situation constants defined
- [ ] Database migration applied ← **YOU ARE HERE**
- [ ] Game plan service refactored
- [ ] GamePlanModal component created
- [ ] PDF export implemented
- [ ] Integration with Playbook page
- [ ] Testing & refinement

---

## ❓ Troubleshooting

**Issue:** "table already exists" error

**Solution:** Tables may already exist from previous attempts. Drop them first:

```sql
DROP TABLE IF EXISTS game_plan_plays CASCADE;
DROP TABLE IF EXISTS game_plan_situations CASCADE;
DROP TABLE IF EXISTS game_plans CASCADE;
```

Then re-run the migration.

**Issue:** RLS policy errors

**Solution:** Ensure you're authenticated and have a team_member record for your user.

---

## 🎉 Ready to Continue?

Once the migration is applied successfully:

1. Run `npm run dev` to start the dev server
2. Navigate to the Playbook page
3. We'll refactor the game plan service next
4. Then build the GamePlanModal UI

**Let me know when the migration is applied and we'll continue!** 🚀
