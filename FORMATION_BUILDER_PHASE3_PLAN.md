# Formation Builder - Phase 3 Implementation Plan

## Phase 3: FormationBuilderModal UI Component

**Goal:** Build a visual formation builder that lets coaches drag-drop players on a field canvas to create formations.

---

## Component Architecture

```
PlaybookPage
  ├─ Formation Builder Hero Button (already exists)
  └─ FormationBuilderModal (NEW)
       ├─ FormationBuilderHeader (name, personnel selector)
       ├─ FormationBuilderCanvas (field + players)
       │    ├─ FieldBackground (hash marks, yard lines)
       │    └─ DraggablePlayer (position marker)
       ├─ FormationBuilderSidebar (tools)
       │    ├─ PersonnelSelector
       │    ├─ StrengthPlayerSelector
       │    ├─ VariantToggle (Base/Left/Right)
       │    └─ ActionButtons (Save, Cancel, Duplicate)
       └─ FormationBuilderFooter (validation messages)
```

---

## Step-by-Step Implementation

### Step 1: Create FormationBuilderModal Shell ✅
- [ ] Create `src/components/playbook/FormationBuilderModal/FormationBuilderModal.tsx`
- [ ] Basic modal structure with header/body/footer
- [ ] Props: `isOpen`, `onClose`, `playbookId`, `formationId?` (for editing)
- [ ] Integration with PlaybookPage state

### Step 2: Build FormationBuilderCanvas
- [ ] Create `FormationBuilderCanvas.tsx`
- [ ] Canvas dimensions: Match field proportions (53.3 yards wide x ~30 yards deep)
- [ ] Coordinate system: Pixels to yard conversion
- [ ] Grid background with hash marks
- [ ] Line of scrimmage (LOS) indicator

### Step 3: Add Player Positioning
- [ ] Create `DraggablePlayer.tsx` component
- [ ] Default 11 player positions (standard formation)
- [ ] Drag-drop functionality (react-dnd or custom)
- [ ] Position labels (X, Y, Z, H, F, Q, T, etc.)
- [ ] Personnel labels (Blue, Black, Green from selected personnel)
- [ ] Snap to grid option

### Step 4: Personnel Integration
- [ ] Fetch personnel configurations for playbook
- [ ] Personnel selector dropdown
- [ ] Apply personnel labels to player positions
- [ ] Auto-assign labels based on position (X/Y/Z get WR labels, H gets RB/TE, etc.)

### Step 5: Strength Player Selection
- [ ] UI to mark one player as "strength setter"
- [ ] Visual indicator (different color, star icon)
- [ ] Updates `strength_player_position` and `strength_player_label`

### Step 6: Left/Right Variant Preview
- [ ] Toggle buttons: Base | Left | Right
- [ ] Preview flipped positions without saving
- [ ] Use `FormationService.flipPositions()` logic
- [ ] Show both variants side-by-side

### Step 7: Save/Update Flow
- [ ] Name input field
- [ ] Category selector (spread, pro, power, etc.)
- [ ] Tags input (multi-select or chip input)
- [ ] Save button → calls `FormationService.createFormation()`
- [ ] Create variants button → calls `FormationService.createBothVariants()`
- [ ] Validation feedback

### Step 8: Edit Mode
- [ ] Load existing formation by ID
- [ ] Populate fields with existing data
- [ ] Update button → calls `FormationService.updateFormation()`
- [ ] Delete button with confirmation

### Step 9: Connect to PlaybookPage
- [ ] Add state: `const [showFormationBuilder, setShowFormationBuilder] = useState(false)`
- [ ] Update hero button onClick: `setShowFormationBuilder(true)`
- [ ] Add FormationBuilderModal to render tree

---

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────┐
│  Formation Builder                          [X] │  ← Header
├─────────────────────────────────────────────────┤
│                                          ┌────┐ │
│                                          │    │ │
│                                          │ P  │ │
│      ╔═══════════════════════╗          │ E  │ │
│      ║                       ║          │ R  │ │
│      ║    [Field Canvas]     ║          │ S  │ │
│      ║                       ║          │ O  │ │
│      ║   O  O  O  X  Y  Z    ║          │ N  │ │
│      ║      O  O  O  O       ║          │ N  │ │
│      ║  - - - - - - - - -    ║  ← LOS   │ E  │ │
│      ║                       ║          │ L  │ │
│      ║                       ║          │    │ │
│      ╚═══════════════════════╝          │ [□]│ │
│                                          │    │ │
│                                          │ S  │ │
│                                          │ T  │ │
│                                          │ R  │ │
│                                          └────┘ │
├─────────────────────────────────────────────────┤
│ Name: [Twins Same      ]  [Save] [Cancel]      │  ← Footer
└─────────────────────────────────────────────────┘
```

### Colors & Styling
- **Field:** Green gradient (#166534 → #15803d)
- **Players:** Circular markers, team colors
- **Strength Player:** Gold/yellow highlight
- **Grid:** White dashed lines (subtle)
- **Personnel Labels:** Badge style (same as personnel quick-select)

---

## Data Flow

### Create New Formation
```typescript
1. User clicks "Formation Builder" hero button
2. Modal opens with empty canvas
3. User drags 11 players to positions
4. User selects personnel (Blue)
5. User marks strength player (X position)
6. User enters name: "Twins Same"
7. User clicks "Save + Create Variants"
8. Service creates:
   - Base formation (direction: 'base')
   - Left variant (direction: 'left', base_formation_id: base.id)
   - Right variant (direction: 'right', base_formation_id: base.id)
9. Modal closes, formations appear in playbook
```

### Edit Existing Formation
```typescript
1. User clicks "Edit" on formation card
2. Modal opens with loaded data
3. Player positions rendered from player_positions JSONB
4. User updates positions/settings
5. User clicks "Update"
6. Service updates formation
7. If base formation, option to update variants
```

---

## Technical Details

### Canvas Coordinate System
- **Field Width:** 53.3 yards (160 feet)
- **Canvas Width:** 800px (scalable)
- **Pixel Ratio:** 800px / 53.3 = ~15 pixels per yard
- **Y-Axis:** 0 = LOS, positive = offensive side, negative = defensive side
- **Player Size:** 24px diameter circles

### Player Position Schema
```typescript
{
  position: "X",           // Position code
  x: 35,                   // Yards from left sideline (0-53.3)
  y: 20,                   // Yards from LOS (0-50)
  label: "Blue",           // Personnel label
  isStrengthSetter: true,  // Strength indicator
  role: "WR",              // Optional role tag
  jerseyNumber: "1"        // Optional number
}
```

### Default Player Positions (Twins Same Example)
```typescript
const defaultPositions = [
  { position: "LT", x: 20, y: 0 },
  { position: "LG", x: 23, y: 0 },
  { position: "C",  x: 26, y: 0 },
  { position: "RG", x: 29, y: 0 },
  { position: "RT", x: 32, y: 0 },
  { position: "Q",  x: 26, y: 5 },
  { position: "X",  x: 15, y: 0 },  // Left outside
  { position: "Y",  x: 18, y: 0 },  // Left slot
  { position: "Z",  x: 35, y: 0 },  // Right outside
  { position: "H",  x: 38, y: 0 },  // Right slot
  { position: "F",  x: 24, y: 5 },  // Backfield
];
```

---

## Dependencies

### Libraries Needed
- ✅ **React** (already installed)
- ✅ **Tailwind CSS** (already installed)
- ❓ **react-dnd** or **use-gesture** for drag-drop
- ❓ **framer-motion** for animations (already installed?)

### Alternative: Custom Drag-Drop
If we want to avoid new dependencies, we can use native mouse/touch events:
```typescript
const handleMouseDown = (e: React.MouseEvent) => { /* start drag */ };
const handleMouseMove = (e: React.MouseEvent) => { /* update position */ };
const handleMouseUp = () => { /* end drag */ };
```

---

## Testing Plan

### Unit Tests
- [ ] `FormationService.flipPositions()` flips correctly
- [ ] Coordinate conversions (pixels ↔ yards)
- [ ] Validation catches bad inputs

### Integration Tests
- [ ] Create formation → appears in playbook
- [ ] Edit formation → updates in database
- [ ] Create variants → generates left/right correctly
- [ ] Personnel linkage → labels apply correctly

### Manual Tests
- [ ] Drag players on canvas
- [ ] Select personnel, see labels update
- [ ] Mark strength player
- [ ] Preview Left/Right variants
- [ ] Save and reload formation
- [ ] Edit existing formation

---

## Success Criteria

✅ **Phase 3 is complete when:**
1. FormationBuilderModal renders with field canvas
2. Can drag 11 players to positions
3. Can select personnel and see labels apply
4. Can mark strength player
5. Can preview Left/Right variants
6. Can save new formation with variants
7. Can edit existing formation
8. Formation appears in playbook (verified in Phase 4)

---

## Next Steps After Phase 3

**Phase 4:** Integrate formations into play creation
- Update AddNewPlayModal with formation selector
- Save `formation_id` when creating plays
- Display formation badges on PlayCard

**Phase 5:** Duplicate + Flip functionality
- Duplicate play with formation flip
- Auto-flip diagram positions

---

**Let's build Phase 3!** 🚀
