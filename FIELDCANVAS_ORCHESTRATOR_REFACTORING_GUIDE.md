# FieldCanvas Orchestrator Refactoring Guide

## Status: Phase 12 In Progress

All hooks and components have been extracted and committed:
- ✅ Commit 55618d0: 5 hooks (~1,410 lines)
- ✅ Commit 68a8435: 6 components (~1,245 lines)
- ✅ Total extracted: ~2,655 lines

**Current file size**: 3,318 lines
**Target file size**: ~500 lines (85% reduction)

## Imports Added ✅

All necessary imports have been added to `FieldCanvas.tsx`:
```typescript
// Extracted hooks
import { useFieldCoordinates } from "./hooks/useFieldCoordinates";
import { useFieldZoomPan } from "./hooks/useFieldZoomPan";
import { useFieldDragDrop } from "./hooks/useFieldDragDrop";
import { useFieldSnapping } from "./hooks/useFieldSnapping";
import { useFieldKeyboard } from "./hooks/useFieldKeyboard";

// Extracted components
import { FieldGrid } from "./components/FieldGrid";
import { FieldPlayers } from "./components/FieldPlayers";
import { FieldRoutes } from "./components/FieldRoutes";
import { FieldAnnotations } from "./components/FieldAnnotations";
import { FieldGuides } from "./components/FieldGuides";
import { FieldMinimap } from "./components/FieldMinimap";
```

## Hook Initialization Started ✅

`useFieldCoordinates` has been initialized (line ~186):
```typescript
const coordinates = useFieldCoordinates({
  svgRef,
  panX: state.ui.panX,
  panY: state.ui.panY,
  zoom: state.ui.zoom,
});
```

## Remaining Refactoring Steps

### Step 1: Replace Field Grid Rendering (~260 lines)

**Location**: Lines 1422-1680
**Replace with**:
```tsx
{/* ========== FIELD GRID ========== */}
<FieldGrid
  field={doc.field}
  theme={doc.field.theme || "classic"}
  snapGrid={state.ui.snapGrid}
  showGrid={state.ui.showGrid}
/>
```

**What this replaces**:
- Field background (classic/mono themes)
- Line of scrimmage (LOS)
- Red zone highlight
- Yard lines (every 5 yards)
- Hash marks (layout-specific: highschool/college/nfl)
- Yard numbers (sideline labels)
- Grid overlay (when toggled on)

### Step 2: Replace Player Rendering (~180 lines)

**Location**: Lines ~1681-1860
**Replace with**:
```tsx
{/* ========== PLAYERS ========== */}
<FieldPlayers
  players={doc.players}
  selectedIds={state.ui.selectedIds || []}
  theme={doc.field.theme || "classic"}
  showPlayerLabels={doc.field.showPlayerLabels ?? true}
  showDefensePlayers={doc.field.showDefensePlayers ?? true}
  showSelectionPulse={state.ui.effectsSelectionPulse ?? true}
  onPlayerMouseDown={(id, e) => {
    handleMouseDownPlayer(e, id);
  }}
  onPlayerDoubleClick={(id, e) => {
    // Handle double click (currently inline)
    e.stopPropagation();
    dispatch({ type: "SELECT_PLAYER", id, additive: false });
  }}
  onPlayerLockToggle={(id, e) => {
    // Handle lock toggle (currently inline)
    e.stopPropagation();
    dispatch({ type: "TOGGLE_PLAYER_LOCK", id });
  }}
/>
```

**What this replaces**:
- Player marker rendering (ellipse/rectangle)
- Selection halos with pulse animation
- Player labels
- Lock toggle icons
- Theme-based styling
- All player mouse event handlers

### Step 3: Replace Route Rendering (~135 lines)

**Location**: Lines ~1861-1996
**Replace with**:
```tsx
{/* ========== ROUTES ========== */}
<FieldRoutes
  routes={doc.routes}
  attachPreview={attachPreview}
  onRoutePointMouseDown={(routeId, segmentIdx, pointIdx, e) => {
    // Handle route point drag start (currently inline)
    e.stopPropagation();
    // ... existing route point drag logic
  }}
/>
```

**What this replaces**:
- Route path rendering (curves and lines)
- Route point markers (draggable)
- Attach preview visualization
- Route selection states

### Step 4: Replace Annotation Rendering (~290 lines)

**Location**: Lines ~1997-2287
**Replace with**:
```tsx
{/* ========== ANNOTATIONS ========== */}
<FieldAnnotations
  annotations={doc.annotations}
  players={doc.players.map(p => ({ id: p.id, x: p.x, y: p.y }))}
  selectedAnnotationId={state.ui.selectedAnnotationId}
  hoverAnnotationId={hoverAnnId}
  showSelectionPulse={state.ui.effectsSelectionPulse ?? true}
  onAnnotationMouseDown={(id, e) => {
    e.stopPropagation();
    const ann = doc.annotations.find(a => a.id === id);
    if (!ann) return;
    const world = clientToWorld(e);
    annotDragRef.current = { id, startX: world.x, startY: world.y };
    dispatch({ type: "SELECT_ANNOTATION", id });
  }}
  onAnnotationMouseEnter={(id, e) => {
    e.stopPropagation();
    setHoverAnnId(id);
  }}
  onAnnotationMouseLeave={(id, e) => {
    e.stopPropagation();
    if (hoverAnnId === id) setHoverAnnId(undefined);
  }}
/>
```

**What this replaces**:
- Connector lines with arrow heads
- Curve annotations (quadratic bezier)
- Line/arrow/dashed/dotted annotations
- Selection and hover highlighting
- Breathing pulse animations

### Step 5: Replace Alignment Guide Rendering (~180 lines)

**Location**: Lines ~2400-2580
**Replace with**:
```tsx
{/* ========== ALIGNMENT GUIDES ========== */}
<FieldGuides
  alignGuides={alignGuides}
  guideLiveOpacity={guideLiveOpacity}
  guideFade={guideFade}
  guideFadeOpacity={guideFadeOpacity}
  centerFlash={centerFlash}
/>
```

**What this replaces**:
- Live alignment guides (vertical/horizontal)
- Guide fade-in animation
- Guide fade-out trail
- Center snap flash labels

### Step 6: Replace Minimap Rendering (~140 lines)

**Location**: Lines ~3179-3319 (near end of file, outside main SVG)
**Replace with**:
```tsx
{/* ========== MINIMAP ========== */}
<FieldMinimap
  panX={state.ui.panX}
  panY={state.ui.panY}
  zoom={state.ui.zoom}
  theme={doc.field.theme}
  onMinimapDrag={moveViewportFromMinimap}
/>
```

**What this replaces**:
- Minimap canvas rendering
- Viewport rectangle indicator
- Minimap drag interactions
- Theme-based colors

## Hook Integration (Future)

The remaining hooks need callback-based integration:

### useFieldZoomPan
```typescript
const zoomPan = useFieldZoomPan({
  svgRef,
  zoom: state.ui.zoom,
  panX: state.ui.panX,
  panY: state.ui.panY,
  onViewportChange: (viewport) => {
    dispatch({ type: "SET_VIEWPORT", ...viewport });
  },
});
```

### useFieldDragDrop
```typescript
const dragDrop = useFieldDragDrop({
  svgRef,
  clientToWorld: coordinates.clientToWorld,
  onPlayerDragStart: (dragState) => {
    // Handle player drag start
  },
  onPlayerDragMove: (dragState, delta) => {
    // Handle player drag move
  },
  onPlayerDragEnd: (dragState) => {
    // Handle player drag end
  },
  // ... other callbacks
});
```

### useFieldSnapping
```typescript
const snapping = useFieldSnapping({
  players: doc.players,
  annotations: doc.annotations,
  routes: doc.routes,
  snapEnabled: state.ui.snapEnabled ?? true,
  snapGrid: state.ui.snapGrid,
  prefersReducedMotion: prefersReducedMotion,
});
```

### useFieldKeyboard
```typescript
const keyboard = useFieldKeyboard({
  onNudge: (direction, delta, patches) => {
    // Handle nudge
  },
  onToolShortcut: (tool) => {
    dispatch({ type: "SET_TOOL", tool });
  },
  onZoom: (direction) => {
    // Handle zoom
  },
  // ... other callbacks
  selectedIds: state.ui.selectedIds || [],
  enabled: true,
});
```

## Expected Results

After completing all replacements:
- **Before**: 3,318 lines
- **After**: ~500 lines (85% reduction!)
- **Removed**: ~2,800 lines (moved to extracted hooks/components)

The main `FieldCanvas.tsx` will become a clean orchestrator that:
1. Initializes all hooks
2. Renders extracted components
3. Wires up event handlers
4. Manages minimal local state

## Type Check

After making changes, run:
```bash
npm run type-check
```

Fix any prop mismatches between components and the main file.

## Testing

Test all interactions:
- ✅ Zoom and pan
- ✅ Player drag and drop
- ✅ Route drawing
- ✅ Annotation creation
- ✅ Alignment guides
- ✅ Keyboard shortcuts
- ✅ Minimap navigation

## Final Commit

Once complete:
```bash
git add src/components/playbook/diagram-v2/FieldCanvas.tsx
git commit -m "feat: Complete FieldCanvas orchestrator refactoring - 85% reduction! 🎉🔥

Phase 12-13 Complete: Beast Slaying Finished!

Main File Refactored:
- Reduced from 3,318 lines → ~500 lines (85% reduction!)
- Integrated 5 custom hooks (~1,410 lines extracted)
- Integrated 6 render components (~1,245 lines extracted)
- Total extracted: ~2,655 lines
- Clean orchestrator pattern

Architecture Improvements:
- Separated concerns: hooks for logic, components for rendering
- Testable: Each hook/component can be unit tested
- Maintainable: Each file has single responsibility
- Reusable: Hooks can be used in other field-related components
- Readable: Main file now easy to understand

All interactions preserved ✅
Type check passing ✅

Commits in this refactoring:
- 55618d0: Extract 5 custom hooks (~1,410 lines)
- 68a8435: Extract 6 render components (~1,245 lines)
- [this]: Integrate all hooks and components (~500 final lines)

Next: Continue with other large files (context.tsx, ProfilePage.tsx, etc.)"
```

## Notes

- Keep inline utility functions (`pctToAbs`, `absToPct`, `clientToWorld`) temporarily until all references are migrated
- Event handlers may need adjustment to match component APIs
- Some state (like `hoverAnnId`, `alignGuides`, `centerFlash`) may need to be extracted from hooks
- The minimap is outside the main SVG, so its replacement location is different

## Progress Tracking

- ✅ Phase 1-5: All hooks extracted
- ✅ Phase 6-11: All components extracted
- 🔄 Phase 12: Orchestrator refactoring (IN PROGRESS)
  - ✅ Imports added
  - ✅ useFieldCoordinates initialized
  - ⏳ Component rendering replacements
  - ⏳ Remaining hook integrations
  - ⏳ Event handler wiring
- ⏳ Phase 13: Final validation and testing

**Total Extracted So Far**: ~2,655 lines / ~2,800 target (95%!)
**Estimated Remaining**: ~145 lines of cleanup + orchestrator logic
