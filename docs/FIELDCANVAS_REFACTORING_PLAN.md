# FieldCanvas Refactoring Plan - BEAST SLAYING 🔥

**Date**: October 5, 2025  
**Target**: Reduce FieldCanvas.tsx from 3,283 lines to ~500 lines (85% reduction)  
**Spacing Migration**: 24 instances  
**Estimated Time**: 3-4 hours  

---

## Current State

**File**: `src/components/playbook/diagram-v2/FieldCanvas.tsx`
- **Lines**: 3,283
- **Complexity**: Monolithic component with all logic inline
- **Spacing Instances**: 24 (to be migrated)

**Major Sections**:
1. Drag & Drop Logic (~500 lines)
2. Zoom & Pan (~200 lines)
3. Smart Snapping (~400 lines)
4. Keyboard Shortcuts (~200 lines)
5. Event Handlers (~500 lines)
6. Rendering Logic (~1000+ lines)
7. Minimap (~150 lines)

---

## Extraction Plan

### Phase 1: Custom Hooks (Est. 1,400 lines extracted)

#### ✅ Hook 0: useFieldCoordinates.ts (~100 lines) - COMPLETE
- [x] pctToAbs, absToPct conversions
- [x] clientToWorld mapping
- [x] Type-safe coordinate interfaces

#### Hook 1: useFieldZoomPan.ts (~200 lines)
- [ ] Focal wheel zoom with Ctrl/Cmd
- [ ] Pan state management
- [ ] Minimap drag interactions
- [ ] Clamp helper
- [ ] ViewPort management

#### Hook 2: useFieldDragDrop.ts (~500 lines)
- [ ] Player dragging with threshold
- [ ] Group dragging support
- [ ] Alt-duplicate logic
- [ ] Annotation dragging
- [ ] Selection box dragging
- [ ] Drag state refs

#### Hook 3: useFieldSnapping.ts (~400 lines)
- [ ] computeAlignmentSnap function
- [ ] snapToAnchorPct function
- [ ] Smart snapping logic
- [ ] Alignment guide computation
- [ ] Snap pulse animations
- [ ] Center snap flash

#### Hook 4: useFieldKeyboard.ts (~200 lines)
- [ ] Keyboard event handlers
- [ ] Arrow key nudging
- [ ] Batch commit logic
- [ ] Spacebar-hold-to-pan
- [ ] Delete key support

---

### Phase 2: Render Components (Est. 1,000 lines extracted)

#### Component 1: FieldGrid.tsx (~150 lines)
- [ ] Field background
- [ ] Yard lines (5yd, 10yd increments)
- [ ] Hash marks
- [ ] Line of scrimmage
- [ ] Defensive scrimmage line

#### Component 2: FieldPlayers.tsx (~200 lines)
- [ ] Player markers (ellipses)
- [ ] Player labels
- [ ] Selection states
- [ ] Hover effects
- [ ] Drag preview/opacity
- [ ] Player edit popover

#### Component 3: FieldRoutes.tsx (~200 lines)
- [ ] Route paths rendering
- [ ] Route points
- [ ] Attach preview during drag
- [ ] Route styling (solid/dashed)

#### Component 4: FieldAnnotations.tsx (~200 lines)
- [ ] Annotation rendering
- [ ] Connectors (player-to-player)
- [ ] Lines, arrows, shapes
- [ ] Selection handles
- [ ] Arrow heads

#### Component 5: FieldGuides.tsx (~150 lines)
- [ ] Alignment guides (vertical/horizontal)
- [ ] Guide fade animations
- [ ] Snap visuals
- [ ] Center snap flash
- [ ] Guide opacity management

#### Component 6: FieldMinimap.tsx (~100 lines)
- [ ] Minimap rendering
- [ ] Viewport indicator
- [ ] Drag interactions
- [ ] Player representation

---

### Phase 3: Main File Refactoring

#### FieldCanvas.tsx Orchestrator (~500 lines final)
- [ ] Import all hooks and components
- [ ] Compose hooks
- [ ] Main SVG container
- [ ] Event delegation
- [ ] State management
- [ ] Tool-specific behavior
- [ ] Selection box
- [ ] Inline editor
- [ ] **Migrate all 24 spacing instances**

---

## Spacing Instance Locations

**Found 24 instances** (from grep search):

1. Line 2299: `gap-2 px-2.5 py-1.5` (player edit popover)
2. Line 2311: `px-2 py-1` (label input)
3. Line 2325: `p-0` (color picker button)
4. Line 2328: `mx-1` (divider)
5. Line 2331: `px-2 py-1` (delete button)
6. Line 2670: `gap-2 px-2.5 py-1.5` (annotation edit popover)
7. Line 2686: `p-0` (annotation button)
8. Line 2730: `px-2 py-1` (annotation input)
9. Line 2744: `mx-1` (divider)
10. Line 2747: `px-2 py-1` (annotation delete)
11. Line 2944: `gap-1 px-2 py-1` (toolbar panel)
12. Line 2979: `mx-1` (toolbar divider)
13. Line 3014: `mx-1` (toolbar divider)
14. Line 3231: `bottom-2 right-2` (minimap position)

**Migration Pattern**:
- `gap-1` → `gap-spacing-xs`
- `gap-2` → `gap-spacing-xs`
- `px-2` → `px-spacing-xs`
- `px-2.5` → `px-spacing-xs` (round down)
- `py-1` → `py-spacing-xs`
- `py-1.5` → `py-spacing-xs` (round down)
- `p-0` → `p-0` (keep, no spacing needed)
- `mx-1` → `mx-spacing-xs`
- `bottom-2 right-2` → `bottom-spacing-xs right-spacing-xs`

---

## Progress Tracking

**Hooks Created**: 1/5 (20%)  
- [x] useFieldCoordinates ✅

**Components Created**: 0/6 (0%)

**Main File**: Not started

**Spacing Migration**: 0/24 (0%)

**Current Progress**: 938+ instances (111.1%+)  
**Target After FieldCanvas**: 962+ instances (114.0%+)

---

## Commit Strategy

1. **Commit after each hook** (5 commits)
2. **Commit after each component** (6 commits)
3. **Final commit for main file** (1 commit)
4. **Total**: ~12 commits with clear messages

---

## Testing Strategy

- Type check after each extraction
- Verify no runtime errors
- Test drag/drop functionality
- Test zoom/pan
- Test snapping
- Test keyboard shortcuts
- Test all tools (draw, route, pan, etc.)

---

## Next Steps

1. ✅ useFieldCoordinates created
2. ⏭️ Create useFieldZoomPan
3. ⏭️ Create useFieldDragDrop
4. ⏭️ Create useFieldSnapping
5. ⏭️ Create useFieldKeyboard
6. ⏭️ Create render components
7. ⏭️ Refactor main file
8. ⏭️ Migrate spacing
9. ⏭️ Test & commit

---

**Status**: IN PROGRESS 🔥  
**Completion**: ~3% (100 / 3,283 lines extracted)
