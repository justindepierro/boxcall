# Simplified Formation Direction System

## Problem Statement

The current system is too complex:

- 4 directionality types (mirror, built-in, symmetric, unspecified)
- Manual linking UI with dropdowns
- User has to understand "base" vs "left" vs "right"
- Too many decisions for the user

## New Simple Approach

**Core Workflow**: Just make formations. System handles the rest.

### User Experience

1. **Create/Edit Formation**
   - User draws or edits a formation (e.g., "Trips")
   - Saves it

2. **Automatic Check**
   - System checks: "Does this formation have an opposite-side variant?"
   - If YES: Done! ✅
   - If NO: Show prompt...

3. **Simple Prompt**

   ```
   ┌─────────────────────────────────────────┐
   │  Create Opposite-Side Formation?        │
   ├─────────────────────────────────────────┤
   │                                         │
   │  "Trips" doesn't have a flipped         │
   │  version yet.                           │
   │                                         │
   │  [Preview: Shows flipped formation]     │
   │                                         │
   │  ✅ Yes, create flipped version         │
   │  ⏭️  Skip for now                        │
   │  ❌ This formation doesn't need one      │
   │                                         │
   └─────────────────────────────────────────┘
   ```

4. **User Clicks "Yes"**
   - System automatically:
     - Flips X coordinates of all player positions
     - Flips run_strength (left ↔ right)
     - Flips pass_strength (left ↔ right)
     - Creates new formation with flipped data
     - Links them together

5. **Done!**
   - Both formations now exist
   - Linked as variants
   - User can use either in plays

---

## What Gets Removed

**DELETE These Concepts**:

- ❌ `directionality_type` field (mirror/built-in/symmetric/unspecified)
- ❌ `base_formation_id` concept
- ❌ "base" direction (just left/right or NULL)

**KEEP These Concepts**:

- ✅ `direction` field (left/right or NULL)
- ✅ Player position flipping logic
- ✅ Strength flipping logic
- ✅ Formation pairing concept (linked formations)
- ✅ **Manual linking option** (simplified, as fallback)

---

## New Database Schema

### formations table

```sql
-- SIMPLIFIED SCHEMA
CREATE TABLE formations (
  id UUID PRIMARY KEY,
  playbook_id UUID REFERENCES playbooks(id),
  name TEXT NOT NULL,

  -- SIMPLIFIED: Only left/right or NULL
  -- NULL = standalone formation (doesn't need variants)
  -- "left" = left-side formation (has right partner)
  -- "right" = right-side formation (has left partner)
  direction TEXT CHECK (direction IN ('left', 'right')),

  -- SIMPLIFIED: Direct link to opposite-side partner
  opposite_formation_id UUID REFERENCES formations(id),

  -- Metadata
  personnel_id UUID,
  category TEXT,
  formation_type TEXT,
  run_strength TEXT DEFAULT 'balanced',
  pass_strength TEXT DEFAULT 'balanced',
  player_positions JSONB,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure bidirectional consistency
CREATE OR REPLACE FUNCTION ensure_bidirectional_formation_link()
RETURNS TRIGGER AS $$
BEGIN
  -- If opposite_formation_id is set, ensure the opposite formation links back
  IF NEW.opposite_formation_id IS NOT NULL THEN
    UPDATE formations
    SET opposite_formation_id = NEW.id
    WHERE id = NEW.opposite_formation_id
      AND opposite_formation_id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_formation_link_bidirectional
AFTER INSERT OR UPDATE OF opposite_formation_id ON formations
FOR EACH ROW
EXECUTE FUNCTION ensure_bidirectional_formation_link();
```

---

## New UI Flow

### FormationBuilderPanel (Edit Details Tab)

**After Save, Check for Opposite**:

```tsx
const handleSave = async () => {
  // Save formation
  await FormationService.updateFormation(formation.id, formData);

  // Check if opposite exists
  const hasOpposite = await FormationService.hasOppositeFormation(formation.id);

  if (!hasOpposite) {
    // Show prompt modal
    setShowCreateOppositeModal(true);
  } else {
    toast.success("Formation saved!");
  }
};
```

### CreateOppositeFormationModal

```tsx
interface CreateOppositeFormationModalProps {
  formation: Formation;
  onCreateOpposite: () => Promise<void>;
  onSkip: () => void;
  onNeverAsk: () => void;
}

export const CreateOppositeFormationModal: React.FC<Props> = ({
  formation,
  onCreateOpposite,
  onSkip,
  onNeverAsk,
}) => {
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<FormationPlayerPosition[]>([]);

  useEffect(() => {
    // Generate preview of flipped formation
    const flipped = FormationService.flipPositions(formation.player_positions);
    setPreview(flipped);
  }, [formation]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await onCreateOpposite();
      toast.success("Opposite formation created!");
    } catch (error) {
      toast.error("Failed to create opposite formation");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onSkip}>
      <Typography variant="headline-md">
        Create Opposite-Side Formation?
      </Typography>

      <Typography variant="body" className="text-text-muted">
        "{formation.name}" doesn't have a flipped version yet.
      </Typography>

      {/* Side-by-side preview */}
      <div className="grid grid-cols-2 gap-4 my-4">
        <div>
          <Typography variant="caption">Original</Typography>
          <FieldCanvas positions={formation.player_positions} />
          <Typography variant="caption" className="text-center">
            {formation.direction || "Standalone"}
          </Typography>
        </div>

        <div>
          <Typography variant="caption">Flipped</Typography>
          <FieldCanvas positions={preview} />
          <Typography variant="caption" className="text-center">
            {getOppositeDirection(formation.direction)}
          </Typography>
        </div>
      </div>

      {/* Metadata changes preview */}
      <div className="p-4 bg-surface-muted rounded">
        <Typography variant="caption" className="font-medium">
          What will be flipped:
        </Typography>
        <ul className="mt-2 space-y-1 text-sm">
          <li>✅ Player positions (X coordinates)</li>
          <li>
            ✅ Run strength: {formation.run_strength} →{" "}
            {flipStrength(formation.run_strength)}
          </li>
          <li>
            ✅ Pass strength: {formation.pass_strength} →{" "}
            {flipStrength(formation.pass_strength)}
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleCreate}
          disabled={creating}
          variant="primary"
          className="flex-1"
        >
          ✅ Yes, create flipped version
        </Button>

        <Button onClick={onSkip} variant="secondary" className="flex-1">
          ⏭️ Skip for now
        </Button>
      </div>

      <Button
        onClick={onNeverAsk}
        variant="ghost"
        size="sm"
        className="w-full mt-2"
      >
        ❌ This formation doesn't need a flipped version
      </Button>
    </Modal>
  );
};
```

---

## Implementation Steps

### Phase 1: Database Migration

1. Add `opposite_formation_id` column
2. Add bidirectional trigger
3. Migrate existing `base_formation_id` relationships to `opposite_formation_id`
4. Drop `directionality_type` column
5. Update `direction` enum (remove "base", keep left/right, allow NULL)

### Phase 2: Service Layer Updates

**FormationService.ts**:

```typescript
/**
 * Check if formation has an opposite-side variant
 */
static async hasOppositeFormation(formationId: string): Promise<boolean> {
  const formation = await this.getFormationById(formationId);
  return formation.opposite_formation_id !== null;
}

/**
 * Get opposite-side formation (if exists)
 */
static async getOppositeFormation(formationId: string): Promise<Formation | null> {
  const formation = await this.getFormationById(formationId);

  if (!formation.opposite_formation_id) {
    return null;
  }

  return this.getFormationById(formation.opposite_formation_id);
}

/**
 * Create opposite-side formation
 * Automatically flips positions and strengths
 */
static async createOppositeFormation(formationId: string): Promise<Formation> {
  const original = await this.getFormationById(formationId);

  // Determine directions
  const originalDirection = original.direction || "left";
  const oppositeDirection = originalDirection === "left" ? "right" : "left";

  // Flip positions
  const flippedPositions = this.flipPositions(original.player_positions);

  // Create opposite formation
  const opposite = await this.createFormation({
    playbook_id: original.playbook_id,
    name: original.name,
    description: original.description,
    category: original.category,
    personnel_id: original.personnel_id,
    personnel_name: original.personnel_name,
    direction: oppositeDirection,
    opposite_formation_id: original.id, // Link back to original
    formation_type: original.formation_type,
    run_strength: this.flipStrength(original.run_strength),
    pass_strength: this.flipStrength(original.pass_strength),
    player_positions: flippedPositions,
    tags: original.tags,
    is_custom: original.is_custom,
  });

  // Update original to link to opposite
  await this.updateFormation(original.id, {
    direction: originalDirection,
    opposite_formation_id: opposite.id,
  });

  return opposite;
}

/**
 * Mark formation as not needing an opposite
 * Sets direction to NULL (standalone formation)
 */
static async markAsStandalone(formationId: string): Promise<void> {
  await this.updateFormation(formationId, {
    direction: null,
    opposite_formation_id: null,
  });
}
```

### Phase 3: UI Components

1. **CreateOppositeFormationModal.tsx** (new component)
   - Side-by-side preview
   - Shows what will be flipped
   - 3 action buttons (Yes, Skip, Never)

2. **FormationBuilderPanel.tsx** (update)
   - After save, check for opposite
   - Show modal if needed
   - Handle all 3 actions

3. **Simplify "Link Formations" tab** (keep as fallback)
   - Remove complex dropdowns
   - Simple "Link to Existing Formation" button
   - Searches for unpaired formations with same name
   - One-click linking with preview

### Phase 4: Formation Selector Updates

**FormationSelector.tsx**:

```tsx
// Group formations by name
const formationGroups = groupFormationsByName(formations);

// Display each group
formationGroups.map((group) => (
  <div>
    <span>{group.name}</span>
    {group.hasVariants && (
      <div className="flex gap-2">
        <Button
          onClick={() => onSelect(group.leftFormation)}
          active={selected === group.leftFormation.id}
        >
          ← Left
        </Button>
        <Button
          onClick={() => onSelect(group.rightFormation)}
          active={selected === group.rightFormation.id}
        >
          Right →
        </Button>
      </div>
    )}
  </div>
));
```

---

## Migration Plan

### Database Migration

```sql
-- 1. Add new column
ALTER TABLE formations
ADD COLUMN opposite_formation_id UUID REFERENCES formations(id);

-- 2. Migrate existing data
-- Convert base_formation_id relationships to opposite_formation_id pairs
WITH variants AS (
  SELECT
    base_formation_id,
    MAX(CASE WHEN direction = 'left' THEN id END) as left_id,
    MAX(CASE WHEN direction = 'right' THEN id END) as right_id
  FROM formations
  WHERE base_formation_id IS NOT NULL
  GROUP BY base_formation_id
)
UPDATE formations f
SET opposite_formation_id =
  CASE
    WHEN f.direction = 'left' THEN v.right_id
    WHEN f.direction = 'right' THEN v.left_id
  END
FROM variants v
WHERE f.base_formation_id = v.base_formation_id;

-- 3. Update direction for base formations
UPDATE formations
SET direction = NULL
WHERE direction = 'base';

-- 4. Create bidirectional trigger (see schema above)

-- 5. Drop old columns
ALTER TABLE formations
DROP COLUMN base_formation_id,
DROP COLUMN directionality_type;

-- 6. Update direction constraint
ALTER TABLE formations
DROP CONSTRAINT IF EXISTS formations_direction_check;

ALTER TABLE formations
ADD CONSTRAINT formations_direction_check
CHECK (direction IN ('left', 'right') OR direction IS NULL);
```

---

## Benefits

1. **Simpler for Users**
   - Just create formations
   - System prompts when needed
   - No manual linking

2. **Clearer Mental Model**
   - Formation either has opposite or doesn't
   - No "base" concept to understand
   - Direct pairing (A ↔ B)

3. **Less Code**
   - Remove directionality_type logic
   - Remove base_formation_id queries
   - Remove "Link Formations" tab
   - Simpler database schema

4. **Better UX**
   - Preview before creating
   - See what gets flipped
   - Option to never ask again

5. **Automatic Metadata Flipping**
   - User doesn't have to think about strengths
   - System handles it correctly

---

## Fallback: Manual Linking (Simplified)

### Problem It Solves

Users can create formations through multiple entry points:

1. Formation Manager (main)
2. New Play modal (quick add)
3. Bulk import
4. API/Scripts

If formations get created separately without going through the automatic prompt, they need a way to link them manually.

### Simplified Manual Linking UI

Instead of complex dropdowns with all formations, show **smart suggestions**:

```tsx
┌─────────────────────────────────────────────────────────────────┐
│  Link Formations Tab (Simplified)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Current Formation: Trips (left)                                │
│  Status: ⚠️ No opposite formation linked                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔍 Suggested Matches                                      │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  📋 Trips (right)                                         │ │
│  │     • Same name ✅                                        │ │
│  │     • Same personnel (11) ✅                              │ │
│  │     • Opposite direction ✅                               │ │
│  │     • Created: Oct 15, 2025                              │ │
│  │                                                           │ │
│  │     [Preview] [Link This Formation]                       │ │
│  │                                                           │ │
│  │  ───────────────────────────────────────────────────      │ │
│  │                                                           │ │
│  │  📋 Trips Right (unlinked)                                │ │
│  │     • Similar name ⚠️ (not exact match)                   │ │
│  │     • Same personnel (11) ✅                              │ │
│  │     • Created: Oct 14, 2025                              │ │
│  │                                                           │ │
│  │     [Preview] [Link This Formation]                       │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔧 Advanced Options                                        │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  [➕ Create New Opposite]  [🔍 Search All Formations]    │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Smart Matching Algorithm

```typescript
/**
 * Find potential opposite formations
 * Prioritizes:
 * 1. Exact name match + opposite direction
 * 2. Similar name + opposite direction
 * 3. Same personnel + no opposite yet
 */
static async findPotentialOpposites(formationId: string): Promise<Formation[]> {
  const formation = await this.getFormationById(formationId);

  // Skip if already linked
  if (formation.opposite_formation_id) {
    return [];
  }

  const { data: candidates } = await supabase
    .from("formations")
    .select("*")
    .eq("playbook_id", formation.playbook_id)
    .is("opposite_formation_id", null) // Only unpaired formations
    .neq("id", formation.id);

  if (!candidates) return [];

  // Score each candidate
  const scored = candidates.map(candidate => {
    let score = 0;

    // Exact name match: +100 points
    if (candidate.name === formation.name) {
      score += 100;
    }

    // Similar name: +50 points
    else if (
      candidate.name.toLowerCase().includes(formation.name.toLowerCase()) ||
      formation.name.toLowerCase().includes(candidate.name.toLowerCase())
    ) {
      score += 50;
    }

    // Opposite direction: +80 points
    const currentDir = formation.direction;
    const candidateDir = candidate.direction;

    if (
      (currentDir === "left" && candidateDir === "right") ||
      (currentDir === "right" && candidateDir === "left")
    ) {
      score += 80;
    }

    // Same personnel: +40 points
    if (candidate.personnel_id === formation.personnel_id) {
      score += 40;
    }

    // Same category: +20 points
    if (candidate.category === formation.category) {
      score += 20;
    }

    return { formation: candidate, score };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Return top 5 matches
  return scored.slice(0, 5).map(s => s.formation);
}
```

### One-Click Linking

When user clicks "Link This Formation":

```tsx
const handleLinkFormation = async (oppositeId: string) => {
  // Show confirmation with preview
  setShowLinkPreview(true);
  setPreviewOpposite(oppositeId);
};

// In preview modal
<Modal>
  <Typography variant="headline-md">Link These Formations?</Typography>

  {/* Side-by-side preview */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Typography>Current: {formation.name}</Typography>
      <FieldCanvas positions={formation.player_positions} />
      <Typography>Direction: {formation.direction}</Typography>
    </div>

    <div>
      <Typography>Link to: {opposite.name}</Typography>
      <FieldCanvas positions={opposite.player_positions} />
      <Typography>Direction: {opposite.direction}</Typography>
    </div>
  </div>

  {/* Show what will change */}
  <div className="p-4 bg-info-50 rounded">
    <Typography variant="caption">
      ✅ These formations will be linked
      {formation.name !== opposite.name && (
        <div>
          ⚠️ Names don't match exactly - they'll keep their current names
        </div>
      )}
    </Typography>
  </div>

  <Button
    onClick={async () => {
      await FormationService.linkFormations(formation.id, opposite.id);
      toast.success("Formations linked!");
    }}
  >
    Link Formations
  </Button>
</Modal>;
```

### Unlink Option

```tsx
// If formation already has opposite
{
  formation.opposite_formation_id && (
    <div className="p-4 bg-success-50 rounded">
      <Typography variant="body">
        ✅ Linked to: {oppositeFormation.name}
      </Typography>

      <div className="flex gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateToFormation(formation.opposite_formation_id)}
        >
          View Opposite Formation
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUnlinkModal(true)}
        >
          Unlink
        </Button>
      </div>
    </div>
  );
}
```

---

## Complete User Flows

### Flow A: Normal Creation (Automatic)

1. User creates "Trips" formation
2. Saves it
3. **Automatic modal appears**: "Create opposite?"
4. User clicks "Yes"
5. Done! ✅

**Result**: Both formations created and linked automatically

---

### Flow B: Creation Through Play Modal (Manual Linking)

1. User creating play, needs formation
2. Clicks "Add Formation" in play modal
3. Quickly draws "Trips" formation
4. Saves (no prompt - quick flow)
5. **Formation saved without opposite**
6. Later, user opens Formation Manager
7. Edits "Trips" formation
8. Sees warning: "⚠️ No opposite formation linked"
9. Goes to "Link Formations" tab
10. Sees suggested match: "Trips Right"
11. Clicks "Link This Formation"
12. Preview shows both formations
13. Clicks "Confirm"
14. Done! ✅

**Result**: Formations linked manually when needed

---

### Flow C: Bulk Import (Manual Linking)

1. User imports 50 formations from spreadsheet
2. Import completes
3. User sees notification: "⚠️ 12 formations don't have opposites"
4. Opens "Formation Health" dashboard
5. Sees list of unpaired formations
6. Clicks "Fix All"
7. System shows suggested matches for each
8. User reviews and approves matches
9. All linked in one batch
10. Done! ✅

**Result**: Bulk linking with smart suggestions

---

### Flow 1: Create "Trips" Formation

1. User draws "Trips" formation
2. Clicks "Save"
3. Modal appears: "Create opposite-side formation?"
4. User sees side-by-side preview
5. User clicks "Yes"
6. System creates "Trips" (right) automatically
7. Both formations now linked
8. Done! ✅

### Flow 2: Create "Empty" Formation (No Opposite Needed)

1. User draws "Empty" formation (symmetric)
2. Clicks "Save"
3. Modal appears: "Create opposite-side formation?"
4. User clicks "This formation doesn't need one"
5. Formation saved as standalone (direction = NULL)
6. Modal won't appear again for this formation
7. Done! ✅

### Flow 3: Edit Existing Formation with Opposite

1. User edits "Twins" (left)
2. Clicks "Save"
3. System checks: opposite_formation_id exists? YES
4. No modal shown
5. Toast: "Formation saved!"
6. Done! ✅

---

## Type Updates

```typescript
// SIMPLIFIED Formation type
export interface Formation {
  id: string;
  playbook_id: string;
  name: string;

  // SIMPLIFIED: left/right or NULL
  direction: "left" | "right" | null;

  // SIMPLIFIED: Direct link to opposite
  opposite_formation_id: string | null;

  // Metadata
  personnel_id: string | null;
  category: FormationCategory | null;
  formation_type: FormationType | null;
  run_strength: StrengthType;
  pass_strength: StrengthType;
  player_positions: FormationPlayerPosition[];
  tags: string[];

  // Timestamps
  created_at: string;
  updated_at: string;
}

// REMOVE these types:
// ❌ FormationDirectionalityType
// ❌ base_formation_id references
```

---

## Testing Checklist

### Unit Tests

- [ ] `flipPositions()` flips X coordinates correctly
- [ ] `flipStrength()` flips left ↔ right, keeps balanced
- [ ] `hasOppositeFormation()` returns correct boolean
- [ ] `getOppositeFormation()` returns linked formation
- [ ] `createOppositeFormation()` creates and links correctly
- [ ] `markAsStandalone()` sets direction to NULL

### Integration Tests

- [ ] Create formation → Modal appears
- [ ] Click "Yes" → Opposite formation created
- [ ] Click "Skip" → Modal closes, no opposite created
- [ ] Click "Never" → Formation marked as standalone
- [ ] Edit formation with opposite → No modal appears
- [ ] Database trigger ensures bidirectional link

### UI Tests

- [ ] Modal shows side-by-side preview
- [ ] Preview shows flipped positions correctly
- [ ] Metadata changes displayed correctly
- [ ] Formation selector groups by name
- [ ] Left/Right buttons work correctly

---

## Timeline

- **Phase 1 (Database)**: 1 day
- **Phase 2 (Service Layer)**: 1 day
- **Phase 3 (UI Components)**: 2 days
- **Phase 4 (Selector Updates)**: 1 day
- **Testing**: 1 day

**Total**: ~1 week

---

## Success Criteria

✅ User can create formations without thinking about "directionality types"
✅ System automatically prompts to create opposite when needed
✅ User sees clear preview before creating opposite
✅ Metadata (positions, strengths) flipped automatically
✅ Option to mark formation as standalone (no opposite needed)
✅ Existing formations migrated correctly
✅ No "Link Formations" tab needed
✅ Simpler codebase (removed complexity)
