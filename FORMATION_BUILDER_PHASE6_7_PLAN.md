# Formation Builder: Phases 6 & 7 - Matching & Templates

**Date:** October 12, 2024  
**Status:** PLANNING  
**Vision:** Bi-directional formation ↔ diagram integration

---

## User Vision

### Problem Statement

Current system auto-creates variants via `createLeftVariant()`, but coaches want:

1. **Manual control**: Match "Twins Right" to existing "Twins Left" (or create new)
2. **Formation as template**: Use formation structure as starting point when drawing plays

### User Stories

**Story 1: Formation Matching**

> As a coach, when I create "Twins Right", I want to manually select which formation is the "Left" variant, so I can link formations that have the same structure but mirror positioning.

**Story 2: Diagram Templates**

> As a coach, when I draw a new play with "Twins Right", I want the diagram to pre-populate with the formation's player positions, so I can add routes on top of a consistent formation structure.

---

## Phase 6: Formation Matching System

### Goal

Build a UI where users can manually link formations as opposite variants.

### Architecture

#### Database Changes

**Current:**

```sql
base_formation_id UUID REFERENCES formations(id) -- Self-referencing
direction TEXT ('base', 'left', 'right')
```

**Proposed Enhancement:**

- Keep existing structure ✅ (already supports manual matching)
- Add metadata: `matched_manually BOOLEAN DEFAULT false`

**Why it works:**

- Base formation: `base_formation_id = NULL, direction = 'base'`
- Left variant: `base_formation_id = {base_id}, direction = 'left'`
- Right variant: `base_formation_id = {base_id}, direction = 'right'`

User can manually set `base_formation_id` on existing formations to link them!

#### Service Layer Updates

**File:** `src/services/FormationService.ts`

**New Functions:**

```typescript
// Link existing formations as variants
async linkFormations(
  baseFormationId: string,
  leftFormationId?: string,
  rightFormationId?: string
): Promise<void> {
  // Set base_formation_id on left/right formations
  // Update direction fields
}

// Unlink variant (make it independent)
async unlinkVariant(formationId: string): Promise<void> {
  // Set base_formation_id = NULL
  // Set direction = 'base'
}

// Get potential matches (same playbook, similar structure)
async getSuggestedMatches(
  formationId: string
): Promise<Formation[]> {
  // Query formations in same playbook
  // Filter by same personnel_id (same player count)
  // Return formations that could be variants
}
```

#### UI Component: FormationMatchingModal

**File:** `src/components/formations/FormationMatchingModal.tsx` (NEW)

**Features:**

- **Side-by-side preview**: Show base formation and potential matches
- **Dropdown selector**: Choose existing formation OR "Create New"
- **Visual confirmation**: Highlight matched formations
- **Unlink button**: Break existing links

**Mockup:**

```
┌─────────────────────────────────────────────────────┐
│  Match Formation Variants                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Base Formation: Twins Right                       │
│  ┌─────────────────────┐                           │
│  │   X       X         │  [Formation Preview]      │
│  │      Y              │                           │
│  │  ────────O──────    │                           │
│  │      Z              │                           │
│  └─────────────────────┘                           │
│                                                     │
│  Left Variant:                                     │
│  [Dropdown: Select Formation ▼]                    │
│    - Twins Left (existing) ✓                       │
│    - Trips Left                                     │
│    - Create New Formation...                       │
│                                                     │
│  ┌─────────────────────┐                           │
│  │         X       X   │  [Preview if selected]    │
│  │              Y      │                           │
│  │  ────────O──────    │                           │
│  │              Z      │                           │
│  └─────────────────────┘                           │
│                                                     │
│  Right Variant:                                    │
│  [Dropdown: Select Formation ▼]                    │
│    - Create New Formation...                       │
│                                                     │
│  [ Cancel ]                    [ Save Matches ]    │
└─────────────────────────────────────────────────────┘
```

#### Integration Points

**Where to trigger:**

1. **FormationBuilder**: After creating base formation → "Match variants?"
2. **FormationSelector**: Right-click → "Manage variants"
3. **FormationBadge**: Click badge → Opens matching modal

### User Workflow

**Scenario A: Link Existing Formations**

1. User has "Twins Right" (base) and "Twins Left" (also marked as base)
2. Opens matching modal for "Twins Right"
3. Selects "Twins Left" as left variant
4. System updates:
   - `Twins Left.base_formation_id = Twins Right.id`
   - `Twins Left.direction = 'left'`
5. Formations now linked! ✅

**Scenario B: Create New Variant**

1. User has "Trips Right" (base), no left variant exists
2. Opens matching modal
3. Selects "Create New Formation..."
4. System:
   - Flips "Trips Right" positions
   - Creates "Trips Left" with flipped coords
   - Links as variant
5. Both formations now linked! ✅

---

## Phase 7: Formation → Diagram Template System

### Goal

When creating a play, pre-populate diagram with formation's player positions.

### Architecture

#### Data Structure Alignment

**Formation Structure:**

```typescript
// formation.player_positions
[
  {
    position: "X", // Position code
    x: 40, // X coordinate
    y: 5, // Y coordinate
    label: "Blue", // Personnel label
    isStrengthSetter: false,
    role: "WR", // Player role
  },
  // ... more players
];
```

**Diagram Structure:**

```typescript
// diagram_data.players
[
  {
    id: "player-1",
    x: 40,
    y: 5,
    label: "X", // Position label
    role: "WR",
    // ... more properties
  },
];
```

**Mapping Logic:**

- Formation `position` → Diagram `label`
- Formation `x, y` → Diagram `x, y` (might need coordinate system conversion)
- Formation `role` → Diagram `role`
- Generate unique `id` for each diagram player

#### Utility Function

**File:** `src/utils/formationDiagramHelpers.ts` (NEW)

```typescript
interface DiagramPlayer {
  id: string;
  x: number;
  y: number;
  label: string;
  role: string;
  // ... other diagram properties
}

/**
 * Convert formation player_positions to diagram players
 */
export function importFormationAsTemplate(
  formation: Formation
): DiagramPlayer[] {
  return formation.player_positions.map((player, index) => ({
    id: `player-${index + 1}`,
    x: player.x,
    y: player.y,
    label: player.position, // "X", "Y", "Z", etc.
    role: player.role, // "WR", "TE", etc.
    // Add default properties for diagram system
    rotation: 0,
    route: null,
    // ... etc
  }));
}

/**
 * Check if formation coordinates are compatible with diagram system
 */
export function areCoordinateSystemsCompatible(formation: Formation): boolean {
  // Validate that formation coords fit within diagram bounds
  // Return false if out of bounds, true if compatible
}

/**
 * Convert formation coordinate system to diagram coordinate system
 * (if they use different scales/origins)
 */
export function convertFormationCoordsToCanvas(
  x: number,
  y: number
): { x: number; y: number } {
  // Transform coords if needed
  // For now, might be 1:1 mapping
  return { x, y };
}
```

#### Integration Point: AddNewPlayModal

**File:** `src/components/playbook/AddNewPlayModal.tsx`

**Enhancement:**

```typescript
const onFormationIdChange = (
  formationId: string | null,
  formation: Formation | null
) => {
  updateFields({
    formation_id: formationId,
    formation: formation?.name || null,
    formation_direction: formation?.direction || null,
  });

  // NEW: Import formation as diagram template
  if (formation && !formData.diagram_data) {
    const templatePlayers = importFormationAsTemplate(formation);
    updateFields({
      diagram_data: {
        version: "1.0",
        players: templatePlayers,
        routes: [],
        // ... other diagram properties
      },
    });
  }
};
```

**Behavior:**

- When user selects formation → diagram pre-populates
- If diagram already exists → don't overwrite (user has started drawing)
- User can reset diagram → re-import formation

#### UI Enhancement: Diagram Canvas

**File:** `src/components/playbook/DiagramCanvas.tsx` (or wherever diagram lives)

**Add Button:**

```tsx
<Button onClick={handleImportFormation} disabled={!formationId}>
  <Icon name="import" />
  Import Formation Template
</Button>
```

**Behavior:**

- Clears current diagram (with confirmation)
- Imports formation positions
- User adds routes on top

### User Workflow

**Scenario: Draw New Play with Formation**

1. User opens "Create New Play" modal
2. Selects formation: "Trips Right"
3. **Diagram auto-populates** with 5 players in Trips formation
4. User adds routes:
   - X runs go route
   - Y runs slant
   - Z runs out route
5. Saves play
6. Next play with "Trips Right" → Same formation positions ✅

**Benefits:**

- ✅ Consistent player positioning across plays
- ✅ Faster play creation (formation is template)
- ✅ Visual confirmation formation matches play
- ✅ Reduces errors (player positions always match formation)

---

## Coordinate System Considerations

### Potential Issue: Different Scales

**Formation Builder:**

- Canvas might be 500px × 300px
- Coordinates: (0, 0) to (500, 300)

**Play Diagram:**

- Canvas might be 800px × 400px
- Coordinates: (0, 0) to (800, 400)

### Solution Options

**Option 1: Normalize to Field Units**

- Store coordinates as **yard-based** (0-53.3 width, 0-100 length)
- Canvas converts yards → pixels on render
- Formation and Diagram use same unit system

**Option 2: Percentage-Based**

- Store as percentages (0-100% width, 0-100% height)
- Canvas scales to actual size
- Works for any canvas size

**Option 3: Direct Pixel Mapping**

- Use same canvas size for both
- 1:1 coordinate mapping
- Simplest, but less flexible

**Recommendation:** Option 1 (Yard-based)

- Most accurate for football context
- Easy to reason about ("X receiver is 12 yards from LOS")
- Survives canvas size changes

---

## Implementation Steps

### Phase 6: Formation Matching

**Step 6.1: Service Layer** (1-2 hours)

- [ ] Add `linkFormations()` to FormationService
- [ ] Add `unlinkVariant()` to FormationService
- [ ] Add `getSuggestedMatches()` to FormationService
- [ ] Add `matched_manually` column to formations table (optional)

**Step 6.2: FormationMatchingModal** (2-3 hours)

- [ ] Create modal component with side-by-side previews
- [ ] Add dropdowns for left/right variant selection
- [ ] Add formation preview rendering
- [ ] Add "Create New" option that triggers FormationBuilder
- [ ] Add save/cancel logic

**Step 6.3: Integration** (1 hour)

- [ ] Add "Manage Variants" button to FormationBuilder
- [ ] Add context menu to FormationSelector
- [ ] Wire up modal to service calls

**Step 6.4: Testing** (1 hour)

- [ ] Test linking existing formations
- [ ] Test creating new variants
- [ ] Test unlinking variants
- [ ] Verify `getOppositeFormationVariant()` works with manual links

### Phase 7: Formation Templates

**Step 7.1: Utility Functions** (1-2 hours)

- [ ] Create `formationDiagramHelpers.ts`
- [ ] Implement `importFormationAsTemplate()`
- [ ] Implement coordinate conversion (if needed)
- [ ] Add validation functions

**Step 7.2: AddNewPlayModal Integration** (1-2 hours)

- [ ] Update `onFormationIdChange` to import template
- [ ] Add logic to prevent overwriting existing diagrams
- [ ] Add "Import Formation" button for manual trigger
- [ ] Add confirmation dialog if diagram exists

**Step 7.3: Diagram Canvas Enhancement** (2-3 hours)

- [ ] Add "Import Formation Template" button
- [ ] Handle formation → diagram conversion
- [ ] Render imported players correctly
- [ ] Ensure routes can be added on top

**Step 7.4: Testing** (1-2 hours)

- [ ] Test formation import on new play
- [ ] Test coordinate accuracy
- [ ] Test with multiple formations
- [ ] Verify diagram editable after import

---

## Data Flow Diagrams

### Phase 6: Matching Flow

```
User: "Match Twins Right variants"
    ↓
FormationMatchingModal opens
    ↓
Load base formation + all playbook formations
    ↓
User selects "Twins Left" as left variant
    ↓
FormationService.linkFormations(baseId, leftId)
    ↓
UPDATE formations
  SET base_formation_id = baseId, direction = 'left'
  WHERE id = leftId
    ↓
Formations linked! ✅
```

### Phase 7: Template Flow

```
User: Opens "Create New Play"
    ↓
User selects formation "Trips Right"
    ↓
onFormationIdChange(formationId, formation) fires
    ↓
Check: diagram_data is empty?
    ↓
YES → importFormationAsTemplate(formation)
    ↓
Convert formation.player_positions → diagram.players
    ↓
updateFields({ diagram_data: { players: [...], routes: [] } })
    ↓
Diagram canvas renders with formation positions ✅
    ↓
User adds routes on top of formation
    ↓
Saves play with formation + diagram
```

---

## Benefits Summary

### Phase 6: Matching

✅ **Flexibility**: Link any formations, not just auto-created ones  
✅ **Coach Control**: Manually define what's a "match"  
✅ **Fix Mistakes**: Unlink incorrect matches  
✅ **Discover Existing**: Suggested matches help find formations

### Phase 7: Templates

✅ **Speed**: No manual player positioning per play  
✅ **Consistency**: Every "Trips Right" play has same formation  
✅ **Accuracy**: Formation positions match diagram positions  
✅ **Time Savings**: 2-3 minutes per play → 30 seconds

### Combined Power

✅ **Integrated System**: Formation structure drives play diagrams  
✅ **Bi-directional**: Changes to formation reflect in plays  
✅ **Professional**: Playbooks look polished and consistent  
✅ **Scalable**: Build large playbooks rapidly

---

## Questions to Confirm

Before implementing, please confirm:

1. **Coordinate System**: Do FormationBuilder and DiagramCanvas use the same coordinate system currently? Or do we need conversion logic?

2. **Overwrite Behavior**: When user selects formation on existing play with diagram, should we:
   - A) Never overwrite (keep user's diagram)
   - B) Ask confirmation ("Replace diagram with formation template?")
   - C) Always overwrite

3. **Template Trigger**: When should formation import happen:
   - A) Auto-import when formation selected
   - B) Manual "Import Formation" button only
   - C) Both (auto on new play, manual button for reset)

4. **Matching UI Priority**: Should FormationMatchingModal be:
   - A) Separate modal accessed from context menu
   - B) Part of FormationBuilder as final step
   - C) Both

5. **Database Migration**: Do you want `matched_manually` flag to track auto-created vs manually-linked variants?

---

## Next Steps

**Option A: Start Phase 6 (Matching System)**

- Build FormationMatchingModal
- Add service layer functions
- Enable manual variant linking

**Option B: Start Phase 7 (Template System)**

- Build formation → diagram import
- Add to AddNewPlayModal
- Enable template workflow

**Option C: Manual Testing First**

- Test current system (Phases 1-5)
- Verify formation badges, direction tracking, flip
- Then decide which phase to tackle

Which direction would you like to go? 🎯
