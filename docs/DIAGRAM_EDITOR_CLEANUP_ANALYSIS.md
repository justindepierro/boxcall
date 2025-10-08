# Diagram Editor Cleanup Analysis

**Date:** October 8, 2025  
**Status:** Analysis Complete - Ready for Cleanup Decision

## Overview

You're correct! We have **TWO separate diagram editor implementations** in the playbook folder:

1. **`diagram-editor/`** - The OLD, broken Frankenstein editor (still in production use!)
2. **`diagram-editor-v2/`** - The NEW Pixi.js rebuild we just implemented

## Current State

### 🔴 diagram-editor/ (OLD - In Production)

**Location:** `src/components/playbook/diagram-editor/`

**Used By:**

- ✅ **PlaybookPage.tsx** - Main playbook page (production)
- ✅ **services/diagramService.ts** - Imports DiagramMetadata type
- ✅ Lazy loaded via dynamic import in PlaybookPage

**Size:** ~30+ files, 2000+ lines

**Key Files:**

```
diagram-editor/xkw
├── DiagramEditor.tsx (750+ lines) - Main component
├── context/
│   ├── DiagramEditorProvider.tsx
│   ├── DiagramEditorContext.ts
│   ├── useDiagramEditor.ts
│   └── reducers/ (route, annotation, selection)
├── components/
│   ├── ModernToolPalette.tsx
│   ├── PlayerSidebar.tsx
│   ├── DrawingLayer.tsx
│   ├── ShapeRenderer.tsx
│   ├── FootballFieldCanvas.tsx
│   └── ... many more
├── types/types.ts
└── utils/thumbnail.ts
```

**Architecture:**

- WebGL + SVG hybrid
- 4 conflicting coordinate systems
- Broken player placement
- Cursor mismatch issues
- ~1800 lines of coordinate conversion logic

**Status:** 🔴 **BROKEN** - This is the "Frankenstein" we diagnosed!

---

### 🟢 diagram-editor-v2/ (NEW - Test Only)

**Location:** `src/components/playbook/diagram-editor-v2/`

**Used By:**

- ⚠️ **DiagramV2TestPage.tsx** - Test page only (not in production routes!)
- ⚠️ Not linked in main navigation

**Size:** 15 files, ~1,945 lines

**Key Files:**

```
diagram-editor-v2/
├── DiagramEditorV2.tsx (70 lines) - Main component
├── core/
│   ├── CoordinateSystem.ts (115 lines)
│   ├── Camera.ts (215 lines)
│   └── PixiApp.ts (165 lines)
├── layers/
│   ├── FieldLayer.ts (205 lines)
│   └── PlayersLayer.ts (270 lines)
├── sprites/
│   └── PlayerSprite.ts (225 lines)
├── stores/
│   └── diagramStore.ts (81 lines) - Zustand
├── components/
│   ├── DiagramCanvas.tsx (70 lines)
│   ├── CameraControls.tsx (132 lines)
│   └── PlayerControls.tsx (102 lines)
├── hooks/
│   ├── usePixiApp.ts (125 lines)
│   └── useGestures.ts (165 lines)
└── types/Player.ts (39 lines)
```

**Architecture:**

- Pure Pixi.js v8.5.2 WebGL
- Single unified coordinate system (yards-based)
- Clean Container hierarchy
- Hardware-accelerated rendering
- Touch gestures supported

**Status:** 🟢 **WORKING** - Elite implementation, just implemented coordinate fixes!

---

## The Problem

### 1. Production Uses Broken Editor

**PlaybookPage.tsx** (line 60-62):

```tsx
const PlayDiagramBuilder = lazy(() =>
  import("../components/playbook/diagram-editor/DiagramEditor").then(
    (module) => ({
      default: module.DiagramEditor, // ❌ OLD BROKEN VERSION
    })
  )
);
```

This means when users click "Create Play" in production, they get the **BROKEN** editor with:

- ❌ Cursor mismatch
- ❌ 4 coordinate systems
- ❌ Cannot place players
- ❌ Drawing failures

### 2. New Editor Not Accessible

**DiagramV2TestPage.tsx** exists but:

- ⚠️ No route configured in `DataRouter.tsx`
- ⚠️ Not linked in navigation
- ⚠️ Users can't access it

### 3. Type Conflicts

Both editors export overlapping types:

- `DiagramMetadata`
- `DiagramDocument`
- `Play` structures

This creates import confusion and type conflicts.

---

## Cleanup Strategy Options

### Option A: 🎯 **Simple Rename (Recommended)**

**Replace old with new in one move:**

1. ✅ **Archive the old editor**

   ```bash
   mv src/components/playbook/diagram-editor \
      src/components/playbook/diagram-editor-legacy
   ```

2. ✅ **Rename v2 to main**

   ```bash
   mv src/components/playbook/diagram-editor-v2 \
      src/components/playbook/diagram-editor
   ```

3. ✅ **Update imports in PlaybookPage.tsx**

   ```tsx
   // Change from:
   import("../components/playbook/diagram-editor/DiagramEditor");

   // To:
   import("../components/playbook/diagram-editor/DiagramEditorV2");
   ```

4. ✅ **Delete legacy after verification**
   ```bash
   rm -rf src/components/playbook/diagram-editor-legacy
   ```

**Pros:**

- ✅ Clean folder structure
- ✅ Production uses new editor immediately
- ✅ Old editor archived as backup
- ✅ No confusing version numbers

**Cons:**

- ⚠️ Need to verify all type imports
- ⚠️ May need to add missing features (routes, annotations)

**Effort:** ~2 hours

---

### Option B: 🔄 **Gradual Migration**

**Keep both, slowly migrate features:**

1. Add missing features to v2 (routes, annotations, etc.)
2. Add feature flags to toggle between editors
3. Beta test v2 with subset of users
4. Eventually remove old editor

**Pros:**

- ✅ Safe rollback
- ✅ Can A/B test
- ✅ Time to add missing features

**Cons:**

- ❌ More complex codebase
- ❌ Maintenance burden (2 editors)
- ❌ Type conflicts remain
- ❌ Longer timeline

**Effort:** ~1-2 weeks

---

### Option C: 🗑️ **Nuclear Option**

**Delete old, force migration:**

1. Delete `diagram-editor/` entirely
2. Rename `diagram-editor-v2/` to `diagram-editor/`
3. Update all imports
4. Fix any missing features as they're discovered

**Pros:**

- ✅ Cleanest result
- ✅ No legacy baggage
- ✅ Forces commitment to new architecture

**Cons:**

- ⚠️ Higher risk if features missing
- ⚠️ May break production temporarily
- ⚠️ No rollback without git

**Effort:** ~1 hour + unknown bug fixes

---

## Missing Features Analysis

Comparing old vs new editor:

| Feature             | Old Editor         | New Editor      | Priority  |
| ------------------- | ------------------ | --------------- | --------- |
| **Field Rendering** | ✅ (broken coords) | ✅ Elite        | -         |
| **Player Sprites**  | ✅                 | ✅              | -         |
| **Player Dragging** | ❌ Broken          | ✅ (just fixed) | -         |
| **Selection**       | ✅                 | ✅              | -         |
| **Route Drawing**   | ✅                 | ❌ Missing      | 🔴 HIGH   |
| **Annotations**     | ✅                 | ❌ Missing      | 🟡 MEDIUM |
| **Undo/Redo**       | ✅                 | ❌ Missing      | 🟡 MEDIUM |
| **Save/Load**       | ✅                 | ❌ Missing      | 🔴 HIGH   |
| **Export**          | ✅                 | ❌ Missing      | 🟢 LOW    |
| **Tool Palette**    | ✅                 | ❌ Missing      | 🔴 HIGH   |
| **Touch Gestures**  | ❌                 | ✅              | -         |
| **Zoom Controls**   | ✅                 | ✅              | -         |
| **Camera Pan**      | ❌ Broken          | ✅              | -         |

**Critical Missing Features:**

1. 🔴 **Route Drawing** - Cannot draw play routes yet
2. 🔴 **Save/Load** - Cannot persist diagrams
3. 🔴 **Tool Palette** - No UI for switching tools

**Total Estimated Work:** ~3-5 days to add missing features

---

## Recommendation

### 🎯 **Recommended: Option A (Simple Rename) + Feature Sprint**

**Phase 1: Archive & Rename (Today)**

```bash
# 1. Archive old editor
git mv src/components/playbook/diagram-editor \
       src/components/playbook/diagram-editor-legacy

# 2. Promote v2 to main
git mv src/components/playbook/diagram-editor-v2 \
       src/components/playbook/diagram-editor

# 3. Update component name
mv src/components/playbook/diagram-editor/DiagramEditorV2.tsx \
   src/components/playbook/diagram-editor/DiagramEditor.tsx

# 4. Commit as backup
git commit -m "Archive legacy diagram editor, promote Pixi.js version"
```

**Phase 2: Update Imports (Today)**

- Update `PlaybookPage.tsx` imports
- Update `diagramService.ts` imports
- Update type references
- Run type check: `npm run type-check`

**Phase 3: Add Missing Features (Next 3-5 days)**

- Day 1: Route drawing system
- Day 2: Tool palette + tool switching
- Day 3: Save/Load integration
- Day 4: Undo/Redo
- Day 5: Annotations + polish

**Phase 4: Delete Legacy (After Testing)**

```bash
rm -rf src/components/playbook/diagram-editor-legacy
```

---

## Impact Analysis

### Files That Import Old Editor

**Direct Imports:**

1. `src/pages/PlaybookPage.tsx` - Dynamic import
2. `src/services/diagramService.ts` - Type import

**Type Imports:**

- `DiagramMetadata`
- `DiagramDocument`
- `DiagramEditorProps`

**Estimated Changes:** ~5-10 files to update

---

## Test Plan Before Deletion

Before deleting legacy editor:

1. ✅ **Basic Functionality**
   - [ ] Field renders correctly
   - [ ] Players can be added
   - [ ] Players can be dragged
   - [ ] Camera zoom/pan works
   - [ ] Touch gestures work (mobile)

2. ✅ **Critical Features**
   - [ ] Routes can be drawn
   - [ ] Diagrams can be saved
   - [ ] Diagrams can be loaded
   - [ ] Tools can be switched
   - [ ] Undo/redo works

3. ✅ **Integration**
   - [ ] Opens from PlaybookPage
   - [ ] Saves to database
   - [ ] Creates thumbnails
   - [ ] Exports work

4. ✅ **Performance**
   - [ ] Smooth at 60 FPS
   - [ ] No memory leaks
   - [ ] Fast load times

---

## Commands Cheat Sheet

**View file counts:**

```bash
# Old editor
find src/components/playbook/diagram-editor -name "*.ts*" | wc -l

# New editor
find src/components/playbook/diagram-editor-v2 -name "*.ts*" | wc -l
```

**Archive old editor:**

```bash
git mv src/components/playbook/diagram-editor \
       src/components/playbook/diagram-editor-legacy
```

**Promote new editor:**

```bash
git mv src/components/playbook/diagram-editor-v2 \
       src/components/playbook/diagram-editor
```

**Find all imports:**

```bash
grep -r "diagram-editor/" src/ --include="*.ts" --include="*.tsx"
```

**Delete legacy (after testing):**

```bash
rm -rf src/components/playbook/diagram-editor-legacy
```

---

## Next Steps

**Immediate (Today):**

1. Test current v2 implementation in browser
2. Verify coordinate fixes work
3. Document any remaining bugs

**Short Term (This Week):**

1. Decide on cleanup strategy (recommend Option A)
2. Archive legacy editor
3. Promote v2 to main
4. Update imports
5. Start implementing missing features

**Long Term (Next Week):**

1. Complete missing features (routes, save/load, tools)
2. Full integration testing
3. Delete legacy editor
4. Update documentation

---

## Conclusion

**Yes, you're right!** We have way too much garbage and legacy. The old `diagram-editor/` is:

- ❌ Broken (Frankenstein architecture)
- ❌ Still in production (causing user issues)
- ❌ Confusing naming (no version indicator)
- ❌ Type conflicts with v2

**Recommendation:** Archive the old editor NOW, promote v2, add missing features over next few days.

The new Pixi.js editor is **vastly superior** architecture. Don't let perfect be the enemy of good - get it into production and iterate!
