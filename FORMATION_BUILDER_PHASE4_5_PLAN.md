# Formation Builder - Phase 4 & 5 Implementation Plan

## Phase 4: Play Integration - Connect Formations to Plays

**Goal:** Replace text-based formation input with proper database relationships. Everything is connected!

---

## Phase 4 Tasks

### Task 1: Create Formation Selector Component

- [ ] Build `FormationSelector.tsx` dropdown
- [ ] Load formations from FormationService
- [ ] Group by personnel if needed
- [ ] Show formation name + direction (Base/Left/Right)
- [ ] Filter by playbook

### Task 2: Update AddNewPlayModal

- [ ] Replace formation text input with FormationSelector
- [ ] Add formation direction dropdown (Base/Left/Right)
- [ ] Save `formation_id` and `formation_direction` to plays table
- [ ] Keep old `formation` TEXT field for backwards compatibility
- [ ] Show selected formation in preview

### Task 3: Update PlaysService

- [ ] Modify `createPlay()` to save formation_id
- [ ] Modify `updatePlay()` to save formation_id
- [ ] Keep formation TEXT synced for backwards compatibility

### Task 4: Display Formation Badges on PlayCard

- [ ] Show formation name badge
- [ ] Show direction indicator (Left/Right arrow)
- [ ] Show personnel badge if linked
- [ ] Color-code by formation category

---

## Phase 5: Duplicate + Flip Functionality

**Goal:** Rapid play creation by duplicating and flipping formations

---

## Phase 5 Tasks

### Task 1: Add Duplicate Button to PlayCard

- [ ] Add "Duplicate" action to play menu
- [ ] Option: "Duplicate & Flip Formation"
- [ ] Modal or confirmation dialog

### Task 2: Implement Duplicate Logic

- [ ] Copy all play data (name, concept, tags, etc.)
- [ ] If flipping: Get opposite formation variant
- [ ] If flipping: Mirror diagram_data positions
- [ ] Update play name (e.g., "Power Right" → "Power Left")

### Task 3: Diagram Position Flipping

- [ ] Create `flipDiagramPositions()` utility
- [ ] Use same FIELD_WIDTH constant (53.3 yards)
- [ ] Flip player.x coordinates in diagram_data
- [ ] Preserve routes, assignments, labels

---

## Implementation Order

### 🎯 Phase 4 - Step by Step

#### Step 4.1: Create FormationSelector Component

**File:** `src/components/playbook/FormationSelector.tsx`

Features:

- Load formations for current playbook
- Dropdown with search
- Group by category or personnel
- Show "Base / Left / Right" badges

#### Step 4.2: Add Formation Fields to AddNewPlayModal

**File:** `src/components/playbook/AddNewPlayModal/AddNewPlayModal.tsx`

Changes:

- Replace formation text input with FormationSelector
- Add formation_direction dropdown
- Update form state to track formation_id

#### Step 4.3: Update PlaysService to Save Formation ID

**File:** `src/services/playsService.ts`

Changes:

```typescript
createPlay({
  ...playData,
  formation_id: selectedFormation?.id,
  formation_direction: selectedDirection,
  formation: selectedFormation?.name || playData.formation, // Backwards compat
});
```

#### Step 4.4: Update PlayCard to Display Formation Badge

**File:** `src/components/playbook/PlayCard.tsx`

Add:

- Formation badge with name
- Direction arrow (← Left / → Right)
- Personnel badge

---

### 🚀 Phase 5 - Step by Step

#### Step 5.1: Add Duplicate Menu Option

**File:** `src/components/playbook/PlayCard.tsx`

Add menu item:

- "Duplicate Play"
- "Duplicate & Flip"

#### Step 5.2: Implement Duplicate Function

**File:** `src/services/playsService.ts`

```typescript
async duplicatePlay(playId: string, options?: {
  flip?: boolean;
  newName?: string;
}): Promise<Play>
```

Logic:

1. Load original play
2. If flip: Get opposite formation variant
3. If flip: Mirror diagram positions
4. Create new play with duplicated data

#### Step 5.3: Diagram Position Flipping Utility

**File:** `src/utils/diagramHelpers.ts`

```typescript
export function flipDiagramPositions(
  diagramData: DiagramDocument,
  fieldWidth = 53.3
): DiagramDocument {
  // Flip all player x coordinates
  // Preserve routes, labels, assignments
}
```

---

## Data Flow - Phase 4

### Creating a Play with Formation

```
User opens AddNewPlayModal
  ↓
User selects formation: "Twins Same"
  ↓
User selects direction: "Left"
  ↓
FormationSelector shows: "Twins Same - Left"
  ↓
User fills in play details (name, concept, etc.)
  ↓
User clicks "Create Play"
  ↓
PlaysService.createPlay({
  name: "Power",
  formation_id: "uuid-of-twins-same-left",
  formation_direction: "left",
  formation: "Twins Same - Left", // For backwards compat
  ...
})
  ↓
Supabase INSERT into plays table
  ↓
Trigger: update_formation_usage_count() fires
  ↓
formations.usage_count incremented
  ↓
Success! Play created with formation link
  ↓
PlayCard displays formation badge
```

---

## Data Flow - Phase 5

### Duplicating & Flipping a Play

```
User clicks "Duplicate & Flip" on play card
  ↓
PlaysService.duplicatePlay(playId, { flip: true })
  ↓
1. Load original play: "Twins Same Left - Power"
  ↓
2. Get opposite formation variant:
   FormationService.getFormationVariants(base_formation_id)
   Find "right" variant
  ↓
3. Flip diagram positions:
   flipDiagramPositions(original.diagram_data)
   Player X from 15 → 38.3 yards
  ↓
4. Create new play:
   createPlay({
     name: "Twins Same Right - Power",
     formation_id: "uuid-of-twins-same-right",
     formation_direction: "right",
     diagram_data: flipped_diagram_data,
     ...
   })
  ↓
Success! Mirrored play created in seconds!
```

---

## UI Changes

### AddNewPlayModal - Before

```
Formation: [_________] (text input)
```

### AddNewPlayModal - After

```
Formation: [Twins Same ▼] (dropdown)
Direction: [Base] [Left] [Right] (toggle buttons)

Preview: 🏈 Twins Same - Left (Blue personnel)
```

### PlayCard - Before

```
┌─────────────────────┐
│ Power               │
│ Twins Same Left     │ ← Just text
└─────────────────────┘
```

### PlayCard - After

```
┌─────────────────────┐
│ Power               │
│ 🏈 Twins Same       │ ← Formation badge
│ ← Left              │ ← Direction arrow
│ 👥 Blue (11)        │ ← Personnel badge
│ ⚡ Used 5x          │ ← Usage count
└─────────────────────┘
```

---

## Testing Plan

### Phase 4 Tests

1. **Create play with formation**
   - Select formation from dropdown
   - Select direction
   - Create play
   - Verify formation_id saved
   - Verify usage_count incremented

2. **Edit play formation**
   - Open existing play
   - Change formation
   - Save
   - Verify old formation usage_count decremented
   - Verify new formation usage_count incremented

3. **Display formation on PlayCard**
   - Create play with formation
   - View in playbook
   - Verify badge shows correctly
   - Verify direction indicator

### Phase 5 Tests

1. **Duplicate play (no flip)**
   - Duplicate existing play
   - Verify all data copied
   - Verify formation_id same
   - Verify new play appears

2. **Duplicate & flip play**
   - Duplicate with flip option
   - Verify opposite formation variant used
   - Verify diagram positions flipped
   - Verify play name updated

3. **Diagram position accuracy**
   - Create play with diagram
   - Duplicate & flip
   - Verify routes mirrored correctly
   - Verify player labels preserved

---

## Success Criteria

### ✅ Phase 4 Complete When:

1. Can select formation from dropdown (not text input)
2. Formation_id saves to plays table
3. Usage_count auto-increments via trigger
4. PlayCard displays formation badge
5. Personnel linkage visible on card
6. Can edit formation on existing plays

### ✅ Phase 5 Complete When:

1. Can duplicate any play
2. Can duplicate with formation flip
3. Diagram positions flip correctly
4. Opposite formation variant auto-selected
5. Play name updates intelligently
6. Workflow is fast (<2 seconds)

---

## Quick Wins

**Immediate value after Phase 4:**

- ✅ Formations are database records (not strings)
- ✅ Usage tracking automatic
- ✅ Personnel integration visible
- ✅ "Everything is connected" architecture working

**Immediate value after Phase 5:**

- ✅ Create 2 plays (Left + Right) in 10 seconds
- ✅ No manual diagram editing needed
- ✅ Consistent naming and organization
- ✅ Massive time savings for coaches

---

**Let's build Phase 4 first - core integration!** 🚀

Next: Create FormationSelector component
