# Plays & Playbooks Schema Redesign

## Current State Analysis

### Executive Summary

- **Playbooks Table**: 10 columns (reasonable)
- **Plays Table**: 38 columns (very detailed, football-specific)
- **RLS Policies**: 7 total (some duplicates, 1 broken)
- **Core Issue**: "Team coaches can manage plays" ALL policy missing `with_check` clause

---

## Current Schema Breakdown

### 📘 PLAYBOOKS Table (10 columns)

| Column             | Type        | Nullable | Default            | Purpose                 | Keep?     | Notes                        |
| ------------------ | ----------- | -------- | ------------------ | ----------------------- | --------- | ---------------------------- |
| `id`               | uuid        | NO       | uuid_generate_v4() | Primary key             | ✅ KEEP   | Essential                    |
| `team_id`          | uuid        | YES      | null               | Foreign key to teams    | ✅ KEEP   | Essential                    |
| `name`             | text        | NO       | 'Main Playbook'    | Playbook name           | ✅ KEEP   | Essential                    |
| `description`      | text        | YES      | null               | Playbook description    | ✅ KEEP   | Useful for organizing        |
| `is_active`        | boolean     | YES      | true               | Archive status          | ✅ KEEP   | Useful for old seasons       |
| `created_at`       | timestamptz | YES      | now()              | Creation timestamp      | ✅ KEEP   | Essential                    |
| `updated_at`       | timestamptz | YES      | now()              | Last update timestamp   | 🟡 KEEP   | Nice for "last modified"     |
| `play_count`       | integer     | YES      | 0                  | Cached play count       | ❌ REMOVE | Can calculate with COUNT(\*) |
| `last_modified_at` | timestamptz | YES      | now()              | Duplicate of updated_at | ❌ REMOVE | Redundant with updated_at    |
| `created_by`       | uuid        | NO       | null               | User who created        | ✅ KEEP   | Essential for RLS            |

**Recommendation**: Remove `play_count` and `last_modified_at` (redundant). Keep 8 columns.

**Decision**: ✅ APPROVED - Remove both redundant columns

---

### 🏈 PLAYS Table (38 columns)

#### Core Identity (KEEP - 5 columns)

| Column        | Type | Nullable | Default            | Purpose                                   |
| ------------- | ---- | -------- | ------------------ | ----------------------------------------- |
| `id`          | uuid | NO       | uuid_generate_v4() | Primary key                               |
| `playbook_id` | uuid | YES      | null               | Foreign key to playbooks                  |
| `play_name`   | text | NO       | null               | Play name (e.g., "IZ", "Counter GT")      |
| `formation`   | text | NO       | null               | Formation (e.g., "Trips Right", "I-Form") |
| `p_type`      | text | NO       | null               | Play type (Run/Pass)                      |

#### Formation Details (KEEP - 8 columns)

| Column       | Type | Nullable | Default | Purpose                                  |
| ------------ | ---- | -------- | ------- | ---------------------------------------- |
| `personnel`  | text | YES      | null    | Personnel group (e.g., "11 personnel")   |
| `shift`      | text | YES      | null    | Pre-snap shift                           |
| `motion`     | text | YES      | null    | Pre-snap motion                          |
| `back_align` | text | YES      | null    | Running back alignment                   |
| `f_type`     | text | YES      | null    | Formation type classification            |
| `f_dir`      | text | YES      | null    | Formation direction (left/right/field)   |
| `r_str`      | text | YES      | null    | Run strength (where run blocking is)     |
| `p_str`      | text | YES      | null    | Pass strength (where pass protection is) |

#### Protection/Blocking (KEEP - 1 column)

| Column       | Type | Nullable | Default | Purpose                |
| ------------ | ---- | -------- | ------- | ---------------------- |
| `protection` | text | YES      | null    | Pass protection scheme |

#### Situational Preferences (KEEP - 5 columns)

| Column       | Type | Nullable | Default | Purpose                                  |
| ------------ | ---- | -------- | ------- | ---------------------------------------- |
| `pref_down`  | text | YES      | null    | Preferred down (1st, 2nd, 3rd, 4th)      |
| `pref_dis`   | text | YES      | null    | Preferred distance (short, medium, long) |
| `pref_hash`  | text | YES      | null    | Preferred hash (left, middle, right)     |
| `pref_cov`   | text | YES      | null    | Preferred coverage to attack             |
| `pref_front` | text | YES      | null    | Preferred defensive front                |

#### Tagging System (KEEP - 4 columns)

| Column   | Type | Nullable | Default | Purpose                        |
| -------- | ---- | -------- | ------- | ------------------------------ |
| `ftag1`  | text | YES      | null    | Formation tag 1 (custom label) |
| `ftag2`  | text | YES      | null    | Formation tag 2 (custom label) |
| `p_tag1` | text | YES      | null    | Play tag 1 (custom label)      |
| `p_tag2` | text | YES      | null    | Play tag 2 (custom label)      |

#### Play Details & Execution (KEEP - 5 columns)

| Column          | Type | Nullable | Default | Purpose                              | Notes                                   |
| --------------- | ---- | -------- | ------- | ------------------------------------ | --------------------------------------- |
| `one_word_play` | text | YES      | null    | Quick reference/code word for play   | Used for wristbands, speed calls        |
| `p_dir`         | text | YES      | null    | Play direction (Left/Right)          | "IZ Left" vs "IZ Right"                 |
| `key_player1`   | text | YES      | null    | Key player for success               | Future: Link to roster/personnel (Y, Z) |
| `key_player2`   | text | YES      | null    | Secondary key player                 | Future: Link to roster/personnel        |
| `check_into`    | text | YES      | null    | Audible/kill call - alternative play | Future: Link by play_id                 |

**Future Enhancements:**

- `key_player1/2`: Should reference roster OR personnel positions (e.g., "Y receiver", "Z receiver")
- `check_into`: Should be linkable to another play by ID (e.g., "Check into Speed Option")

#### Notes & Documentation (KEEP - 1 column)

| Column  | Type | Nullable | Default | Purpose       | Notes                 |
| ------- | ---- | -------- | ------- | ------------- | --------------------- |
| `notes` | text | YES      | null    | General notes | Essential for coaches |

#### Analytics/Tracking (KEEP - 5 columns)

| Column             | Type    | Nullable | Default | Purpose                      |
| ------------------ | ------- | -------- | ------- | ---------------------------- |
| `complexity_score` | integer | YES      | 0       | How hard is this play (1-10) |
| `times_called`     | integer | YES      | 0       | How many times run in games  |
| `times_successful` | integer | YES      | 0       | How many times successful    |
| `confidence_base`  | integer | YES      | 70      | Base confidence % (0-100)    |
| `diagram_url`      | text    | YES      | null    | Link to diagram image        |

#### System Metadata (KEEP - 5 columns)

| Column          | Type        | Nullable | Default | Purpose                                    |
| --------------- | ----------- | -------- | ------- | ------------------------------------------ |
| `created_at`    | timestamptz | YES      | now()   | When created                               |
| `updated_at`    | timestamptz | YES      | now()   | Last updated                               |
| `is_archived`   | boolean     | YES      | false   | Soft delete                                |
| `created_by`    | uuid        | YES      | null    | User who created                           |
| `duplicate_key` | text        | YES      | null    | Track duplicate plays (versioning/history) |

---

## Schema Summary

### Final Column Count

**Playbooks Table**: 8 columns (after removing 2 redundant)

- Core: id, team_id, name, description, is_active, created_by
- Timestamps: created_at, updated_at

**Plays Table**: 38 columns (ALL KEPT - all serve valid purposes)

- Core Identity: 5 columns
- Formation Details: 8 columns (includes f_type, f_dir, r_str, p_str)
- Protection/Blocking: 1 column
- Situational Preferences: 5 columns
- Tagging System: 4 columns
- Play Details & Execution: 5 columns (includes one_word_play, p_dir, key_players, check_into)
- Notes: 1 column
- Analytics/Tracking: 4 columns
- System Metadata: 5 columns

**Total Schema**: 46 columns across 2 tables

---

## Questions for Decision Making

### ~~1. Unclear Columns - What do these mean?~~

✅ **RESOLVED** - All columns now have clear purposes:

- `f_type` - Formation type classification
- `f_dir` - Formation direction (field reference)
- `r_str` - Run strength (blocking direction)
- `p_str` - Pass strength (protection direction)
- `one_word_play` - Code word for quick calls/wristbands
- `p_dir` - Play direction (Left/Right variant)
- `key_player1/2` - Key personnel (future: link to roster)
- `check_into` - Audible play (future: link by play_id)
- `duplicate_key` - Version tracking for play variants

### 2. Future Enhancements Identified

1. **key_player1/2**: Convert from TEXT to FK reference
   - Link to roster table (player names)
   - OR link to personnel positions (Y, Z, X, etc.)
   - Allows filtering plays by available players

2. **check_into**: Convert from TEXT to FK reference
   - Link to another play by play_id
   - Enables "audible chains" (Play A checks to Play B)
   - UI can show related plays

3. **Custom Fields**: Add JSONB column for team-specific data
   - Each team can define their own fields
   - Example: "Wristband Number", "Game Week Installed", "Scout Team Notes"

### 3. User-Defined Custom Fields Strategy

You mentioned wanting **user-defined data collection**. Options:

#### Option A: Fixed Schema with Many Columns (CURRENT APPROACH)

- ✅ Fast queries, typed data
- ✅ Easy to understand
- ✅ **All 38 columns serve valid football purposes**
- ❌ Can't add new fields without migrations

#### Option B: Add JSONB Custom Fields Column (RECOMMENDED)

```sql
ALTER TABLE plays ADD COLUMN custom_fields JSONB DEFAULT '{}';
```

**Use cases:**

- Wristband numbers
- Game week installed
- Scout team notes
- Team-specific tracking data

**Benefits:**

- ✅ Unlimited flexibility per team
- ✅ No schema changes needed
- ✅ Complements existing structured columns
- ❌ Harder to query across teams

#### Option C: Separate play_custom_fields Table

```sql
CREATE TABLE play_custom_fields (
  id uuid PRIMARY KEY,
  play_id uuid REFERENCES plays(id),
  field_name text NOT NULL,
  field_value text,
  field_type text -- 'text', 'number', 'boolean', 'date'
);
```

- ✅ Fully flexible with metadata
- ✅ Can add UI for field management
- ❌ Most complex to implement
- ❌ Adds more tables

**Recommendation**: Keep current 38 columns + add **Option B (JSONB)** for team-specific customization.

---

## RLS Policy Issues

### Current Playbooks Policies (5 policies, 2 duplicates)

1. **INSERT**: "Users can create playbooks for their teams"
   - ✅ Checks team membership AND role
   - ✅ Requires `created_by = auth.uid()`
   - **Status**: GOOD

2. **SELECT**: "Team members can view playbooks"
   - ✅ All active team members can view
   - **Status**: GOOD

3. **SELECT**: "Users can view playbooks for their teams" ← DUPLICATE!
   - 🔄 Same as #2 but different query
   - **Status**: REDUNDANT - Remove

4. **UPDATE**: "Coaches can update playbooks for their teams"
   - ✅ Coaches+ only
   - **Status**: GOOD

5. **DELETE**: "Head coaches can delete playbooks"
   - ✅ Head coaches only
   - **Status**: GOOD

**Action**: Drop duplicate SELECT policy #3

### Current Plays Policies (2 policies, 1 broken)

1. **ALL**: "Team coaches can manage plays" ← BROKEN!
   - ✅ Has `USING` clause (for SELECT/UPDATE/DELETE)
   - ❌ **Missing `WITH CHECK` clause (breaks INSERT!)**
   - **Status**: BROKEN - Fix immediately

2. **SELECT**: "Team members can view plays"
   - ✅ All active team members
   - **Status**: GOOD

**Critical Fix Needed**:

```sql
DROP POLICY "Team coaches can manage plays" ON plays;

-- Replace with separate policies:
CREATE POLICY "Coaches can insert plays"
  ON plays FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN playbooks pb ON pb.team_id = tm.team_id
      WHERE pb.id = playbook_id
        AND tm.user_id = auth.uid()
        AND tm.team_role IN ('head_coach', 'assistant_coach', 'coordinator')
        AND tm.status = 'active'
    )
  );

CREATE POLICY "Coaches can update plays"
  ON plays FOR UPDATE
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

CREATE POLICY "Coaches can delete plays"
  ON plays FOR DELETE
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

## Proposed Action Plan

### Phase 1: Immediate Fix (2 minutes)

1. ✅ Fix broken plays ALL policy → split into INSERT/UPDATE/DELETE
2. ✅ Test play creation works
3. ✅ Remove duplicate playbooks SELECT policy

### Phase 2: Schema Cleanup (10 minutes)

1. ✅ Remove `play_count` from playbooks (use COUNT query instead)
2. ✅ Remove `last_modified_at` from playbooks (use updated_at)
3. ✅ All plays columns are now documented and justified

### Phase 3: Future Enhancements (Later)

1. Add `custom_fields JSONB` to plays table for team-specific data
2. Convert `key_player1/2` to FK references (roster or personnel positions)
3. Convert `check_into` to FK reference (link plays for audible chains)
4. Add UI for teams to define custom fields
5. Add UI for coaches to populate custom fields when creating plays

---

## Decisions Made

**Question 1**: Do you want to keep all 38 columns in plays table?

- [x] **YES** - Keep everything, all columns serve valid football purposes

**Question 2**: Do you want to add JSONB custom fields for future flexibility?

- [x] **LATER** - Fix RLS first, then add JSONB in Phase 3

**Question 3**: Immediate action?

- [x] **PHASE 1 ONLY** - Just fix the RLS policies and get it working NOW
- [ ] PHASE 1 + 2 - Fix RLS and clean up schema
- [ ] ALL PHASES - Complete redesign with custom fields

---

## ✅ Immediate Action: Phase 1 - Fix RLS Policies

**Goal**: Get play creation working in 2 minutes

**What needs to be fixed**:

1. **Drop broken ALL policy on plays table**
   - Has USING but missing WITH CHECK
   - Blocks all INSERTs

2. **Create 3 separate policies** (INSERT, UPDATE, DELETE)
   - Proper WITH CHECK for INSERT
   - Proper USING for UPDATE and DELETE
   - All check team membership + role + active status

3. **Remove duplicate SELECT policy on playbooks**
   - Policy #3 "Users can view playbooks for their teams" duplicates #2

**Next Steps**:

1. Review SQL fix script (to be created)
2. Run in Supabase SQL Editor
3. Test play creation
4. Hard refresh app and try creating "IZ" play

**After Phase 1 works**, we can do Phase 2 (schema cleanup) and Phase 3 (custom fields) later.

---

## Summary

- **38 columns in plays table**: ✅ All justified and needed for comprehensive football play design
- **10 columns in playbooks table**: ✅ Reduce to 8 (remove 2 redundant)
- **RLS policies**: 🔴 1 broken ALL policy, 1 duplicate SELECT policy
- **Custom fields**: 🟡 Add JSONB later for team-specific data
- **Future enhancements**: FK references for key_player and check_into fields

**Ready to proceed with Phase 1 RLS fix?** 🎯
