# 🔧 AddNewPlayModal Cleanup Audit

**Date:** October 17, 2025  
**Goal:** Ensure AddNewPlayModal is 100% aligned with database schema and current system  
**Priority:** HIGH - User-facing creation flow

---

## 🎯 Issues Found

### **1. DUPLICATE DIRECTION FIELDS** ❌

**Problem:** Modal has TWO direction systems that conflict:

```typescript
// ❌ OLD LEGACY FIELD (database column: f_dir)
formationDir: string; // Used in AdvancedOptionsSection

// ✅ NEW CORRECT FIELD (database column: formation_direction)
formation_direction: "base" | "left" | "right" | null; // Used in FormationSection
```

**Current Behavior:**

- FormationSection shows Left/Right buttons → updates `formation_direction` ✅
- AdvancedOptionsSection ALSO shows formation direction dropdown → updates `formationDir` ❌
- On submit, BOTH fields are sent to database → **CONFLICT!**

**Database Schema:**

```sql
-- plays table has BOTH fields:
f_dir TEXT,                    -- LEGACY: text direction ("Left", "Right", "L", "R")
formation_direction TEXT,      -- NEW: enum ("base", "left", "right")
  CHECK (formation_direction IN ('base', 'left', 'right'))
```

**Fix Required:**

- ✅ Keep: FormationSection with Left/Right toggle (uses `formation_direction`)
- ❌ Remove: AdvancedOptionsSection direction dropdown (uses `formationDir`)
- Update: `formationDir` should ONLY be used for legacy `f_dir` text field (not directional variant)

---

### **2. TAGS & ROLES SECTION - NEEDS DATABASE SCHEMA** ✅

**User Clarification (Oct 17, 2025):**

**TAGS (p_tag1, p_tag2):**

- **Purpose:** Play variations - "IZ Bubble", "IZ Read"
- **Current Limit:** Only 2 tags (p_tag1, p_tag2)
- **User Need:** Unlimited variations per play
- **Examples:** "Bubble", "Read", "Screen", "Alert"
- **Action Required:**
  - ✅ Keep tags UI
  - ❌ Remove 2-tag limit
  - ✅ Add migration: `ALTER TABLE plays ADD COLUMN tags TEXT[]`
  - ✅ Update UI to support array of tags
  - 🔮 Future: Consider hashtag system (#bubble, #redzone) for global search
  - 🔮 Future: Consider @ mentions (@player_name) for tagging

**KEY POSITIONS:**

- **Purpose:** Link to personnel configuration positions
- **Current:** positions[] array (not in database)
- **User Need:** "If Blue personnel, key position is X"
- **Examples:** "X" (from 11 personnel), "Y" (from 12 personnel)
- **Action Required:**
  - ✅ Add migration: `ALTER TABLE plays ADD COLUMN key_positions TEXT[]`
  - ✅ Wire to personnel_configurations position mapping
  - ✅ Validate positions exist in selected personnel

**KEY PLAYERS:**

- **Purpose:** Assign real roster players to positions
- **Current:** players[] array (not in database)
- **User Need:** Select from team roster
- **Examples:** "John Smith", "Mike Jones"
- **Action Required:**
  - ✅ Add migration: `ALTER TABLE plays ADD COLUMN key_players UUID[]` (references team_players)
  - ✅ Add player selector (dropdown from roster)
  - ✅ Link to team_players table via UUID
  - ✅ Display player name + jersey number

**SPECIAL FLAGS (Keeping as-is):**

- **Purpose:** Play flags (situational, tactical)
- **Current:** flags[] array (not in database)
- **Examples:** "Red Zone", "2-Minute", "Goal Line"
- **Action Required:**
  - ✅ Add migration: `ALTER TABLE plays ADD COLUMN flags TEXT[]`
  - ✅ Keep current UI

**Recommendation:** **ENHANCE** - These are critical coaching features!

---

### **3. ONE WORD CALL Field** ⚠️

**Current:**

- Label: "ONE WORD CALL"
- Placeholder: "e.g., POWER, SLANT"
- Database: `one_word_play TEXT`

**Issues:**

- Field name is "one_word_call" but database is "one_word_play" ✅ (correctly mapped)
- UI says "ONE WORD CALL" but it's actually "one word play call"
- Confusing naming

**Fix:**

- Change label to: "Quick Call" or "Shorthand" or "One-Word"
- Update placeholder to match your coaching terminology

---

### **4. TAG SYSTEM ENHANCEMENT** ✅

**Current:**

```typescript
// In modal form:
formationTags: string; // Comma-separated
playTags: string; // Comma-separated

// Sent to database as:
ftag1: formationTags.split(",")[0];
ftag2: formationTags.split(",")[1];
p_tag1: playTags.split(",")[0];
p_tag2: playTags.split(",")[1];
```

**Database (Current):**

```sql
ftag1 TEXT,  -- Only 2 formation tags
ftag2 TEXT,
p_tag1 TEXT, -- Only 2 play tags
p_tag2 TEXT
```

**User Need:** Unlimited play variations

- "IZ" → "IZ Bubble", "IZ Read", "IZ Screen", "IZ Alert", etc.
- Each tag represents a different variation of the base play
- Coaches need flexibility to add as many variations as needed

**Fix Required:**

1. **Add migration** to support tag arrays:

```sql
-- Add new array columns
ALTER TABLE plays
  ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing data
UPDATE plays
SET tags = ARRAY_REMOVE(ARRAY[p_tag1, p_tag2], NULL)
WHERE p_tag1 IS NOT NULL OR p_tag2 IS NOT NULL;

-- Optional: Keep p_tag1, p_tag2 for backwards compatibility
-- Or: Drop after migration
-- ALTER TABLE plays DROP COLUMN p_tag1, DROP COLUMN p_tag2;
```

2. **Update UI** to use tag chips/badges:

```typescript
// Instead of comma-separated input:
tags: string[]  // ["Bubble", "Read", "Screen"]

// UI component: TagInput with add/remove buttons
<TagInput
  tags={formData.tags}
  onAdd={(tag) => updateField("tags", [...formData.tags, tag])}
  onRemove={(index) => updateField("tags", formData.tags.filter((_, i) => i !== index))}
  placeholder="Add variation (e.g., Bubble, Read)"
/>
```

3. **Future Enhancement** - Hashtag system:

```typescript
// Allow # and @ in notes/description for smart tagging:
notes: "#bubble #redzone @john_smith called this in practice";

// Extract hashtags for search:
hashtags: ["bubble", "redzone"];
mentions: ["john_smith"];

// Enable global search: "Show me all #redzone plays"
```

**Recommendation:** **ENHANCE** - Remove 2-tag limit, add array support

---

### **5. SITUATIONAL PREFERENCES Section** ✅

**Current:**

- Down preference (1st, 2nd, 3rd, 4th)
- Distance preference (Short, Medium, Long)
- Hash preference (Left, Middle, Right)
- Coverage preference (free text)
- Front preference (free text)

**Database:**

```sql
pref_down TEXT,
pref_dis TEXT,
pref_hash TEXT,
pref_cov TEXT,
pref_front TEXT
```

**Status:** ✅ **CORRECTLY WIRED**

---

### **6. ADVANCED OPTIONS REDUNDANCY** ⚠️

**AdvancedOptionsSection** shows:

**Formation Details:**

- ❌ `formationType` - Should come from formation (via formation_id)
- ❌ `formationDir` - DUPLICATE (see issue #1)
- ✅ `backAlign` - OK (back_align column exists)
- ✅ `shift` - OK (shift column exists)
- ✅ `motion` - OK (motion column exists)
- ⚠️ `formationTags` - Stored as `ftag1`, `ftag2` (only 2!)
- ❌ `runStrength` - Deprecated (should use formation.run_strength)
- ❌ `passStrength` - Deprecated (should use formation.pass_strength)

**Play Details:**

- ✅ `playDir` (p_dir) - OK
- ✅ `protection` - OK
- ⚠️ `playTags` - Stored as `p_tag1`, `p_tag2` (only 2!)

**Issues:**

1. **Formation Type** should be inherited from selected formation
2. **Run/Pass Strength** deprecated per schema comments
3. **Tags limited to 2** but UI allows comma-separated list

---

### **7. PERSONNEL SECTION** ✅

**Current:**

- Dropdown with personnel options (11, 12, 21, 22, 10, 20, 13, 23, etc.)
- Or free text input
- Can also be inherited from formation via `formation.personnel_name`

**Database:**

```sql
personnel TEXT,        -- In plays table
personnel_id UUID,     -- In formations table (references personnel_configurations)
personnel_name TEXT    -- In formations table (denormalized: "11", "12")
```

**Status:** ✅ **CORRECTLY WIRED**

- Personnel can be entered manually OR inherited from formation
- Works for current Phase 1

---

### **8. MISSING FIELDS** ⚠️

**Fields in Database NOT in Modal:**

```typescript
// Performance metrics (auto-calculated, not user input)
✅ confidence_base: number    // IN MODAL (slider)
✅ times_called: number       // NOT IN MODAL (tracked automatically) ✅
✅ times_successful: number   // NOT IN MODAL (tracked automatically) ✅

// Metadata
✅ created_by: string         // AUTO (auth.uid())
✅ created_at: Date           // AUTO (database)
✅ updated_at: Date           // AUTO (database)
✅ version: number            // AUTO (optimistic locking)

// Optional metadata
❌ is_archived: boolean       // NOT IN MODAL (set via bulk actions)
❌ last_used_at: Date         // NOT IN MODAL (tracked automatically)
❌ complexity_score: number   // NOT IN MODAL (calculated)
❌ duplicate_key: string      // NOT IN MODAL (auto-generated)
❌ install_phase: string      // NOT IN MODAL (future feature)

// Back position modifiers
❌ back_left_of_qb: boolean   // NOT IN MODAL (should be auto-detected?)
❌ back_right_of_qb: boolean  // NOT IN MODAL (should be auto-detected?)

// Diagram fields
✅ diagram_data: JSONB        // Handled by DiagramEditor (separate modal)
✅ diagram_version: number    // AUTO
✅ diagram_url: string        // AUTO (generated thumbnail)

// Formation relationship (Phase 1)
✅ formation_id: UUID         // IN MODAL ✅
✅ formation_direction: TEXT  // IN MODAL ✅

// Creation tracking
❌ creation_source: string    // SHOULD ADD (set to "add_play_modal")
❌ creation_context: JSONB    // SHOULD ADD (track modal state)
```

**Recommendation:**

- ✅ Most auto fields are correct
- ❌ Add `creation_source = "add_play_modal"` on submit
- ❌ Consider `creation_context` for analytics

---

## 📋 Cleanup Checklist

### **Priority 1: Critical Fixes** (DO NOW)

- [ ] **Remove duplicate direction field**
  - Remove `formationDir` dropdown from AdvancedOptionsSection
  - Keep only `formation_direction` in FormationSection (Left/Right buttons)
  - Clarify that `f_dir` (text field) is for legacy support only

- [ ] **Remove placeholder Tags & Roles section**
  - Remove "KEY POSITIONS" input
  - Remove "KEY PLAYERS" input
  - Remove "SPECIAL TAGS" input
  - These are not in database and create user confusion

- [ ] **Add creation tracking**
  ```typescript
  creation_source: "add_play_modal",
  creation_context: {
    active_tab: "main", // Or whatever context is relevant
    user_action: "manual_create"
  }
  ```

### **Priority 2: Field Cleanup** (NEXT)

- [ ] **Fix AdvancedOptionsSection redundancy**
  - Remove `formationType` input (inherit from formation)
  - Remove `runStrength` input (deprecated, use formation.run_strength)
  - Remove `passStrength` input (deprecated, use formation.pass_strength)
  - Keep: `backAlign`, `shift`, `motion` (still valid)

- [ ] **Clarify tag limits**
  - formationTags → only first 2 saved (ftag1, ftag2)
  - playTags → only first 2 saved (p_tag1, p_tag2)
  - Either: Limit UI to 2 inputs OR update database to TEXT[] array

- [ ] **Rename confusing labels**
  - "ONE WORD CALL" → "Quick Call" or "Shorthand"
  - "DESCRIPTION" → "Notes" (match database)

### **Priority 3: Documentation** (LATER)

- [ ] **Add inline help text**
  - Explain what each field is for
  - Show examples for coaches
  - Link to formation builder for complex formations

- [ ] **Update form validation**
  - Ensure formation_direction is validated correctly
  - Validate personnel format
  - Validate tag count (max 2 per type)

---

## 🗺️ Field Mapping Reference

### **✅ Correctly Mapped Fields**

| UI Field             | Form State            | Database Column            | Status |
| -------------------- | --------------------- | -------------------------- | ------ |
| Formation            | `formation`           | `formation TEXT`           | ✅     |
| Formation (selected) | `formation_id`        | `formation_id UUID`        | ✅     |
| Formation Direction  | `formation_direction` | `formation_direction TEXT` | ✅     |
| Play Name            | `playName`            | `play_name TEXT`           | ✅     |
| Play Type            | `playType`            | `p_type TEXT`              | ✅     |
| Personnel            | `personnel`           | `personnel TEXT`           | ✅     |
| Protection           | `protection`          | `protection TEXT`          | ✅     |
| Play Direction       | `playDir`             | `p_dir TEXT`               | ✅     |
| Down Pref            | `prefDown`            | `pref_down TEXT`           | ✅     |
| Distance Pref        | `prefDistance`        | `pref_dis TEXT`            | ✅     |
| Hash Pref            | `prefHash`            | `pref_hash TEXT`           | ✅     |
| Coverage Pref        | `prefCoverage`        | `pref_cov TEXT`            | ✅     |
| Front Pref           | `prefFront`           | `pref_front TEXT`          | ✅     |
| Back Align           | `backAlign`           | `back_align TEXT`          | ✅     |
| Shift                | `shift`               | `shift TEXT`               | ✅     |
| Motion               | `motion`              | `motion TEXT`              | ✅     |
| Confidence           | `confidence`          | `confidence_base INT`      | ✅     |
| One Word             | `oneWordPlay`         | `one_word_play TEXT`       | ✅     |
| Description          | `description`         | `notes TEXT`               | ✅     |

### **❌ Problematic Fields**

| UI Field                 | Form State      | Database         | Issue                              |
| ------------------------ | --------------- | ---------------- | ---------------------------------- |
| Formation Type           | `formationType` | `f_type TEXT`    | Should inherit from formation      |
| Formation Dir (dropdown) | `formationDir`  | `f_dir TEXT`     | DUPLICATE with formation_direction |
| Run Strength             | `runStrength`   | `r_str TEXT`     | DEPRECATED per schema              |
| Pass Strength            | `passStrength`  | `p_str TEXT`     | DEPRECATED per schema              |
| Formation Tags           | `formationTags` | `ftag1, ftag2`   | Only 2 slots, UI allows more       |
| Play Tags                | `playTags`      | `p_tag1, p_tag2` | Only 2 slots, UI allows more       |
| Positions                | `positions[]`   | ❓               | NOT IN DATABASE                    |
| Players                  | `players[]`     | ❓               | NOT IN DATABASE                    |
| Flags                    | `flags[]`       | ❓               | NOT IN DATABASE                    |

### **❌ Missing Fields**

| Database Column    | Needed in Modal? | Notes                           |
| ------------------ | ---------------- | ------------------------------- |
| `creation_source`  | ✅ YES           | Track where play was created    |
| `creation_context` | ⚠️ OPTIONAL      | Track modal state for analytics |
| `back_left_of_qb`  | ⚠️ MAYBE         | Auto-detect from diagram?       |
| `back_right_of_qb` | ⚠️ MAYBE         | Auto-detect from diagram?       |

---

## 🎯 Recommended Action Plan

### **Phase 1: Emergency Fixes** (Today - 30 min)

1. Remove Tags & Roles section (positions, players, flags)
2. Remove duplicate `formationDir` dropdown from Advanced
3. Add `creation_source: "add_play_modal"` to submit

### **Phase 2: Field Cleanup** (Tomorrow - 1 hour)

1. Remove deprecated `formationType`, `runStrength`, `passStrength` from Advanced
2. Update tag inputs to show "Max 2" limit
3. Rename "ONE WORD CALL" → "Quick Call"
4. Rename "DESCRIPTION" → "Notes"

### **Phase 3: Enhancement** (Later - 2 hours)

1. Add inline help text for each section
2. Add validation for formation_direction
3. Consider back position detection from diagram
4. Add creation_context tracking

---

## ✅ What's Already Correct

1. ✅ **Formation Auto-Creation** - Phase 1 complete
2. ✅ **Formation Selection** - FormationSelector works
3. ✅ **Direction Toggle** - Left/Right buttons work
4. ✅ **Formation Metadata Transfer** - Personnel, category, tags pulled from formation
5. ✅ **Play Type Buttons** - Run/Pass/RPO/Screen/Boot
6. ✅ **Personnel Section** - Dropdown + inheritance
7. ✅ **Situational Preferences** - All 5 fields work
8. ✅ **Basic Fields** - formation, play_name, p_type all good
9. ✅ **Diagram Integration** - importFormationAsTemplate ready

---

## 📊 Summary

**Total Fields in Modal:** ~35 fields  
**Correctly Mapped:** ~22 fields ✅  
**Needs Fixing:** ~8 fields ❌  
**Should Remove:** ~5 fields ❌

**Estimated Cleanup Time:** 2-3 hours  
**Priority:** HIGH - This is user-facing creation flow

---

**Next Steps:**

1. Review this audit with team
2. Prioritize fixes (Emergency → Cleanup → Enhancement)
3. Create cleanup branch
4. Test thoroughly after each phase
5. Update documentation

**Goal:** Clean, simple, accurate play creation that matches database schema exactly!
