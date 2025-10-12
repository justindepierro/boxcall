# Personnel Phase 5: Diagram Integration 🎯

**Status:** In Progress  
**Date:** October 11, 2025

## Overview

Phase 5 integrates personnel configurations into the diagram editor, enabling:
1. **Auto-loading personnel** when opening a play diagram
2. **Pre-positioning players** based on their positions (QB behind center, RB in backfield, etc.)
3. **Visual representation** of personnel groupings on the field
4. **Saving personnel** with diagram state

## Architecture

### Data Flow

```
Play Selected → Diagram Opens → Read play.personnel
                                       ↓
                    getPersonnelConfigurationByName(playbookId, name)
                                       ↓
                          Personnel Config + Players Array
                                       ↓
                              Create Player Sprites
                                       ↓
                    Auto-Position Based on player_position
                                       ↓
                              Render on Field
```

### Key Components

**1. DiagramEditor.tsx**
- Entry point for diagram system
- Manages diagram state and app lifecycle
- Location: `src/components/playbook/diagram-editor/DiagramEditor.tsx`

**2. DiagramStore (Zustand)**
- Global state for players, routes, shapes
- Location: `src/components/playbook/diagram-editor/stores/diagramStore.ts`

**3. Player Type**
- Represents individual player sprites
- Location: `src/components/playbook/diagram-editor/types/Player.ts`

## Implementation Plan

### Step 1: Understand Current System ✅
- [x] Locate DiagramEditor component
- [x] Find player data structure
- [x] Understand diagram initialization
- [ ] Find where play data is passed to diagram

### Step 2: Add Personnel Loading
- [ ] Add personnel prop to DiagramEditor
- [ ] Fetch personnel config on diagram mount
- [ ] Convert personnel players to diagram sprites
- [ ] Handle missing/default personnel

### Step 3: Auto-Position Players
- [ ] Define position mapping (QB/RB/TE/WR → coordinates)
- [ ] QB: Behind center (x: field center, y: 7 yards from LOS)
- [ ] RB: In backfield (x: offset from QB, y: 5 yards from LOS)
- [ ] TE: On line (x: tackle position, y: LOS)
- [ ] WR: Split out (x: wide positions, y: LOS or backfield)

### Step 4: Save Personnel with Diagram
- [ ] Include personnel in diagram document
- [ ] Update save logic to persist personnel
- [ ] Load personnel when reopening saved diagrams

### Step 5: Testing
- [ ] Test with 11 Personnel (default)
- [ ] Test with 12 Personnel (2 TE)
- [ ] Test with 10 Personnel (4 WR)
- [ ] Test with 21 Personnel (2 RB)
- [ ] Verify save/load cycle

## Position Coordinates (Approximate)

Based on standard formation positioning:

```typescript
const POSITION_COORDINATES = {
  QB: { x: 500, y: 350 },  // Behind center
  RB: { x: 520, y: 330 },  // In backfield, offset from QB
  TE: { x: 420, y: 400 },  // On line, tackle position
  WR: {
    X: { x: 250, y: 400 },  // Split end (LOS)
    Y: { x: 750, y: 380 },  // Slot receiver
    Z: { x: 150, y: 400 },  // Flanker
  }
};
```

## Player Labels

Personnel configurations include labels (e.g., "Q", "R", "X", "Y", "T"):
- These should be displayed on player sprites
- Use existing label system in diagram
- Ensure labels are readable and positioned correctly

## Error Handling

- **No personnel assigned:** Default to "11 Personnel"
- **Config not found:** Create basic 11 Personnel on-the-fly
- **Malformed data:** Log error, use fallback
- **Network error:** Show user-friendly message

## Benefits

1. **Speed:** Coaches don't have to manually place all 11 players
2. **Consistency:** Same personnel = same starting positions
3. **Learning:** New users see proper formations automatically
4. **Workflow:** Smooth transition from play creation → diagramming
5. **Visual:** See personnel grouping come to life on the field

## Next Steps

After Phase 5 completion:
- **Phase 6:** Personnel template library
- **Phase 7:** Personnel analytics and insights
- **Phase 8:** Bulk personnel assignment

---

**Note:** This is THE BIG ONE - where the entire personnel system comes together visually!
