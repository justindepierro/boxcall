# Formation Metadata Migration Plan

## Overview

Move formation-level metadata (Run Strength, Pass Strength, Formation Type) from individual plays to the Formation entity. Add play-level modifiers (back position relative to QB) to adjust inherited formation strengths.

## Rationale

**Current Problem:**

- Each play manually sets `r_str`, `p_str`, `f_type`
- Duplicate data across all plays using the same formation
- Changes to formation characteristics require updating every play

**Solution:**

- Formation stores base characteristics once
- Plays inherit from formation automatically
- Play-level modifiers adjust for specific variations (e.g., back alignment)

---

## Phase 1: Extend Formation Type

### 1.1 Add Fields to Formation Type

**File:** `src/types/formation.ts`

```typescript
export interface Formation {
  // ... existing fields ...

  // Formation Metadata (NEW)
  formation_type: FormationType | null; // 'I', 'Singleback', 'Pistol', 'Empty', etc.
  run_strength: StrengthType; // 'left', 'right', 'balanced'
  pass_strength: StrengthType; // 'left', 'right', 'balanced'

  // ... rest of fields ...
}

export type FormationType =
  | "I Formation"
  | "Singleback"
  | "Pistol"
  | "Shotgun"
  | "Empty"
  | "Trips"
  | "Bunch"
  | "Stack"
  | "Wing"
  | "Other";

export type StrengthType = "left" | "right" | "balanced";
```

### 1.2 Update FormationCreate and FormationUpdate

```typescript
export interface FormationCreate {
  // ... existing fields ...
  formation_type?: FormationType;
  run_strength?: StrengthType;
  pass_strength?: StrengthType;
}

export interface FormationUpdate {
  // ... existing fields ...
  formation_type?: FormationType;
  run_strength?: StrengthType;
  pass_strength?: StrengthType;
}
```

---

## Phase 2: Database Migration

### 2.1 Add Columns to formations Table

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_formation_metadata.sql`

```sql
-- Add formation metadata columns
ALTER TABLE formations
ADD COLUMN formation_type TEXT CHECK (formation_type IN (
  'I Formation',
  'Singleback',
  'Pistol',
  'Shotgun',
  'Empty',
  'Trips',
  'Bunch',
  'Stack',
  'Wing',
  'Other'
)),
ADD COLUMN run_strength TEXT CHECK (run_strength IN ('left', 'right', 'balanced')) DEFAULT 'balanced',
ADD COLUMN pass_strength TEXT CHECK (pass_strength IN ('left', 'right', 'balanced')) DEFAULT 'balanced';

-- Add indexes for filtering
CREATE INDEX idx_formations_formation_type ON formations(formation_type);
CREATE INDEX idx_formations_run_strength ON formations(run_strength);
CREATE INDEX idx_formations_pass_strength ON formations(pass_strength);

-- Add comments
COMMENT ON COLUMN formations.formation_type IS 'Base formation type/category';
COMMENT ON COLUMN formations.run_strength IS 'Default run strength for this formation: left, right, or balanced';
COMMENT ON COLUMN formations.pass_strength IS 'Default pass strength for this formation: left, right, or balanced';
```

### 2.2 Add Play-Level Modifier Columns

**File:** Same migration

```sql
-- Add play-level strength modifiers
ALTER TABLE plays
ADD COLUMN back_left_of_qb BOOLEAN DEFAULT FALSE,
ADD COLUMN back_right_of_qb BOOLEAN DEFAULT FALSE;

-- Add indexes
CREATE INDEX idx_plays_back_left_of_qb ON plays(back_left_of_qb) WHERE back_left_of_qb = TRUE;
CREATE INDEX idx_plays_back_right_of_qb ON plays(back_right_of_qb) WHERE back_right_of_qb = TRUE;

-- Add comments
COMMENT ON COLUMN plays.back_left_of_qb IS 'TRUE if running back aligns left of QB (modifies formation strength)';
COMMENT ON COLUMN plays.back_right_of_qb IS 'TRUE if running back aligns right of QB (modifies formation strength)';
```

### 2.3 Optional: Migrate Existing Data

```sql
-- Migrate existing play data to formations (if formations exist)
-- This is a one-time data migration script
UPDATE formations f
SET
  formation_type = (
    SELECT DISTINCT p.f_type
    FROM plays p
    WHERE p.formation_id = f.id
    LIMIT 1
  ),
  run_strength = (
    SELECT DISTINCT p.r_str
    FROM plays p
    WHERE p.formation_id = f.id
    LIMIT 1
  ),
  pass_strength = (
    SELECT DISTINCT p.p_str
    FROM plays p
    WHERE p.formation_id = f.id
    LIMIT 1
  )
WHERE EXISTS (SELECT 1 FROM plays p WHERE p.formation_id = f.id);
```

---

## Phase 3: Formation Builder UI Updates

### 3.1 Add Fields to Formation Builder

**File:** `src/components/playbook/FormationBuilder.tsx` (or similar)

```tsx
// Add to form state
const [formationType, setFormationType] = useState<FormationType | null>(null);
const [runStrength, setRunStrength] = useState<StrengthType>("balanced");
const [passStrength, setPassStrength] = useState<StrengthType>("balanced");

// Add to form UI
<div className="space-y-spacing-md">
  <div>
    <label className="block text-sm font-medium mb-2">Formation Type</label>
    <select
      value={formationType || ""}
      onChange={(e) => setFormationType(e.target.value as FormationType)}
      className="w-full px-3 py-2 border rounded-lg"
    >
      <option value="">Select formation type...</option>
      <option value="I Formation">I Formation</option>
      <option value="Singleback">Singleback</option>
      <option value="Pistol">Pistol</option>
      <option value="Shotgun">Shotgun</option>
      <option value="Empty">Empty</option>
      <option value="Trips">Trips</option>
      <option value="Bunch">Bunch</option>
      <option value="Stack">Stack</option>
      <option value="Wing">Wing</option>
      <option value="Other">Other</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">Run Strength</label>
    <div className="flex gap-2">
      <button
        onClick={() => setRunStrength("left")}
        className={`flex-1 px-4 py-2 border rounded-lg ${
          runStrength === "left"
            ? "bg-primary-500 text-white border-primary-600"
            : "bg-surface border-border hover:bg-surface-hover"
        }`}
      >
        ← Left
      </button>
      <button
        onClick={() => setRunStrength("balanced")}
        className={`flex-1 px-4 py-2 border rounded-lg ${
          runStrength === "balanced"
            ? "bg-primary-500 text-white border-primary-600"
            : "bg-surface border-border hover:bg-surface-hover"
        }`}
      >
        ⚖️ Balanced
      </button>
      <button
        onClick={() => setRunStrength("right")}
        className={`flex-1 px-4 py-2 border rounded-lg ${
          runStrength === "right"
            ? "bg-primary-500 text-white border-primary-600"
            : "bg-surface border-border hover:bg-surface-hover"
        }`}
      >
        Right →
      </button>
    </div>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">Pass Strength</label>
    <div className="flex gap-2">
      <button
        onClick={() => setPassStrength("left")}
        className={`flex-1 px-4 py-2 border rounded-lg ${
          passStrength === "left"
            ? "bg-primary-500 text-white border-primary-600"
            : "bg-surface border-border hover:bg-surface-hover"
        }`}
      >
        ← Left
      </button>
      <button
        onClick={() => setPassStrength("balanced")}
        className={`flex-1 px-4 py-2 border rounded-lg ${
          passStrength === "balanced"
            ? "bg-primary-500 text-white border-primary-600"
            : "bg-surface border-border hover:bg-surface-hover"
        }`}
      >
        ⚖️ Balanced
      </button>
      <button
        onClick={() => setPassStrength("right")}
        className={`flex-1 px-4 py-2 border rounded-lg ${
          passStrength === "right"
            ? "bg-primary-500 text-white border-primary-600"
            : "bg-surface border-border hover:bg-surface-hover"
        }`}
      >
        Right →
      </button>
    </div>
  </div>
</div>;
```

---

## Phase 4: Update Play Card UI

### 4.1 Remove Formation Fields from Play Card

**File:** `src/components/playbook/play-card/fieldDefinitions.tsx`

Remove these fields from `formationFields`:

- ❌ `f_type` (Formation Type)
- ❌ `r_str` (Run Strength)
- ❌ `p_str` (Pass Strength)

These will now be inherited from the formation and displayed as read-only if needed.

### 4.2 Add Back Position Modifiers

**File:** `src/components/playbook/play-card/fieldDefinitions.tsx`

```typescript
// Add after back_align field
back_position_modifiers: {
  label: "Back Position",
  render: (optimisticPlay, handleInlineSave, savingFields) => (
    <div className="flex items-center gap-spacing-sm">
      <label className="flex items-center gap-spacing-xs cursor-pointer">
        <input
          type="checkbox"
          checked={optimisticPlay.back_left_of_qb || false}
          onChange={(e) => handleInlineSave("back_left_of_qb", e.target.checked)}
          disabled={savingFields.has("back_left_of_qb")}
          className="w-4 h-4 text-primary-500 border-border rounded"
        />
        <span className="text-sm">← Left of QB</span>
      </label>
      <label className="flex items-center gap-spacing-xs cursor-pointer">
        <input
          type="checkbox"
          checked={optimisticPlay.back_right_of_qb || false}
          onChange={(e) => handleInlineSave("back_right_of_qb", e.target.checked)}
          disabled={savingFields.has("back_right_of_qb")}
          className="w-4 h-4 text-primary-500 border-border rounded"
        />
        <span className="text-sm">Right of QB →</span>
      </label>
    </div>
  ),
},
```

### 4.3 Display Inherited Formation Metadata

**File:** `src/components/playbook/PlayCard.tsx` or similar

```tsx
// Fetch formation data
const formation = formations.find((f) => f.id === play.formation_id);

// Display inherited values (read-only)
<div className="flex items-center gap-2 text-sm text-text-secondary">
  {formation?.formation_type && (
    <span className="px-2 py-1 bg-surface-secondary rounded">
      Type: {formation.formation_type}
    </span>
  )}
  {formation?.run_strength && (
    <span className="px-2 py-1 bg-surface-secondary rounded">
      Run: {formation.run_strength}
      {play.back_left_of_qb && " (← modified)"}
      {play.back_right_of_qb && " (→ modified)"}
    </span>
  )}
  {formation?.pass_strength && (
    <span className="px-2 py-1 bg-surface-secondary rounded">
      Pass: {formation.pass_strength}
    </span>
  )}
</div>;
```

---

## Phase 5: Update Play Type

### 5.1 Update Play Interface

**File:** `src/types/play.ts`

```typescript
export interface Play {
  // ... existing fields ...

  // DEPRECATED (keep for backward compatibility, but read from formation)
  f_type?: string; // → formation.formation_type
  r_str?: string; // → formation.run_strength (with modifiers)
  p_str?: string; // → formation.pass_strength

  // NEW: Play-level modifiers
  back_left_of_qb?: boolean;
  back_right_of_qb?: boolean;

  // ... rest of fields ...
}
```

---

## Phase 6: Strength Calculation Logic

### 6.1 Create Strength Calculator Utility

**File:** `src/utils/formationStrength.ts`

```typescript
import type { Formation } from "../types/formation";
import type { Play } from "../types/play";

export type StrengthResult = "left" | "right" | "balanced";

/**
 * Calculate effective run strength for a play
 *
 * Base strength from formation, modified by back position
 */
export function calculateRunStrength(
  formation: Formation | null,
  play: Play
): StrengthResult {
  if (!formation) return "balanced";

  let strength = formation.run_strength || "balanced";

  // Apply back position modifiers
  if (play.back_left_of_qb && !play.back_right_of_qb) {
    // Back is left → shifts strength left
    if (strength === "right") return "balanced";
    if (strength === "balanced") return "left";
    return "left"; // already left
  }

  if (play.back_right_of_qb && !play.back_left_of_qb) {
    // Back is right → shifts strength right
    if (strength === "left") return "balanced";
    if (strength === "balanced") return "right";
    return "right"; // already right
  }

  // Both checked or neither → use formation default
  return strength;
}

/**
 * Calculate effective pass strength for a play
 *
 * Currently just returns formation strength (no modifiers yet)
 */
export function calculatePassStrength(
  formation: Formation | null,
  play: Play
): StrengthResult {
  if (!formation) return "balanced";
  return formation.pass_strength || "balanced";
}

/**
 * Get formation type for display
 */
export function getFormationType(
  formation: Formation | null,
  play: Play
): string | null {
  // Prefer formation metadata
  if (formation?.formation_type) {
    return formation.formation_type;
  }

  // Fallback to legacy play field
  return play.f_type || null;
}
```

---

## Phase 7: Update Services

### 7.1 Update FormationService

**File:** `src/services/formationService.ts`

```typescript
// Ensure formation_type, run_strength, pass_strength are included in queries
const { data, error } = await supabase
  .from("formations")
  .select(
    `
    *,
    formation_type,
    run_strength,
    pass_strength
  `
  )
  .eq("id", formationId)
  .single();
```

### 7.2 Update Play Handlers

**File:** `src/hooks/useTeamsData.ts` or `src/components/playbook/PlayGrid.tsx`

```typescript
// When saving play, handle boolean checkboxes
const handlePlaySave = async (playId: string, updates: Partial<Play>) => {
  const dbUpdates: Record<string, any> = {};

  // ... existing field mappings ...

  // Handle boolean modifiers
  if ("back_left_of_qb" in updates) {
    dbUpdates.back_left_of_qb = Boolean(updates.back_left_of_qb);
  }
  if ("back_right_of_qb" in updates) {
    dbUpdates.back_right_of_qb = Boolean(updates.back_right_of_qb);
  }

  // ... rest of save logic ...
};
```

---

## Phase 8: Testing Checklist

### 8.1 Formation Builder

- [ ] Can set formation type from dropdown
- [ ] Can select run strength (Left/Right/Balanced)
- [ ] Can select pass strength (Left/Right/Balanced)
- [ ] Values save to database correctly
- [ ] Values load when editing existing formation

### 8.2 Play Card

- [ ] Formation metadata fields removed from editable section
- [ ] Back position checkboxes render after back_align field
- [ ] Can check "Left of QB"
- [ ] Can check "Right of QB"
- [ ] Can check both (edge case)
- [ ] Can uncheck
- [ ] Checkboxes save to database

### 8.3 Display & Inheritance

- [ ] Play card shows inherited formation type (read-only)
- [ ] Play card shows calculated run strength
- [ ] Modifier indicators show when back position affects strength
- [ ] Multiple plays inherit same formation metadata correctly

### 8.4 Strength Calculation

- [ ] Balanced + no back = Balanced
- [ ] Balanced + back left = Left
- [ ] Balanced + back right = Right
- [ ] Left + back left = Left
- [ ] Left + back right = Balanced
- [ ] Right + back left = Balanced
- [ ] Right + back right = Right

---

## Migration Strategy

### Option A: Big Bang (Recommended for small datasets)

1. Run database migration
2. Update all code at once
3. Migrate existing data
4. Deploy

### Option B: Gradual Migration (Recommended for large datasets)

1. Add new fields (formations + plays)
2. Update formation builder to write to new fields
3. Update play display to read from new fields (with fallback to old)
4. Background job to migrate existing data
5. After verification, remove old fields from UI
6. Eventually deprecate old columns

---

## Benefits

### For Users

✅ **Less repetitive editing** - Set once in formation, inherit everywhere
✅ **Consistency** - All plays using a formation share same characteristics
✅ **Flexibility** - Play-level modifiers for special cases
✅ **Clearer UI** - Less clutter on play cards

### For System

✅ **Data normalization** - Single source of truth
✅ **Easier updates** - Change formation affects all plays
✅ **Better analytics** - Can query formations by strength/type
✅ **Scalability** - Less duplicate data

---

## Future Enhancements

1. **Auto-calculate strength** from player positions
2. **Visual strength indicators** on formation diagram
3. **Strength-based filtering** (show all left-run formations)
4. **Strength recommendations** based on personnel
5. **Historical tracking** of formation effectiveness by strength
6. **More modifiers**: motion direction, shift direction, etc.

---

## Files to Modify

### Database

- `supabase/migrations/YYYYMMDDHHMMSS_add_formation_metadata.sql` (NEW)

### Types

- `src/types/formation.ts` (add fields)
- `src/types/play.ts` (add modifiers, deprecate old fields)

### Services

- `src/services/formationService.ts` (include new fields)

### Components

- `src/components/playbook/FormationBuilder.tsx` (add UI fields)
- `src/components/playbook/play-card/fieldDefinitions.tsx` (remove old, add modifiers)
- `src/components/playbook/PlayCard.tsx` (display inherited values)

### Utilities

- `src/utils/formationStrength.ts` (NEW - calculation logic)

### Hooks

- `src/hooks/useTeamsData.ts` (handle boolean fields)
- `src/components/playbook/PlayGrid.tsx` (update save logic)

---

## Estimated Effort

- **Phase 1-2 (Types + Migration):** 1-2 hours
- **Phase 3 (Formation Builder UI):** 2-3 hours
- **Phase 4 (Play Card UI):** 2-3 hours
- **Phase 5-6 (Logic + Utils):** 2-3 hours
- **Phase 7 (Services):** 1-2 hours
- **Phase 8 (Testing):** 2-3 hours

**Total:** ~10-16 hours

---

## Questions to Answer

1. Should we keep old `f_type`, `r_str`, `p_str` fields for backward compatibility?
   - **Recommendation:** Yes, for gradual migration
2. What happens if a play has no formation assigned?
   - **Recommendation:** Show "No formation" message, allow manual override
3. Can both back position checkboxes be checked at once?
   - **Recommendation:** Yes, treat as "balanced" override
4. Should pass strength also have modifiers?
   - **Recommendation:** Not initially, add later if needed
5. Should we migrate existing play data automatically?
   - **Recommendation:** Yes, with manual verification option
