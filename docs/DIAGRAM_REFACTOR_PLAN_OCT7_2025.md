# Diagram Builder Refactor & Reorganization Plan
**Date**: October 7, 2025  
**Status**: 📋 **PLANNING**

---

## 🎯 Objectives

1. **Clear Naming**: Replace confusing `diagram/` and `diagram-v2/` with descriptive names
2. **Reduce Duplication**: Extract shared components and utilities
3. **Better Organization**: Group related files logically
4. **Maintainability**: Make it obvious which system to use when

---

## 📊 Current State Analysis

### **Current Structure**

```
src/components/playbook/
├── diagram/                    (~7,555 lines, 45 files)
│   ├── PlayDiagramBuilder.tsx  (Full-featured editor)
│   ├── FieldCanvas/            (Complex orchestrator)
│   ├── components/             (18 components)
│   ├── context/                (3 files)
│   ├── engine/                 (ShapeEngine.ts)
│   ├── types/                  (types.ts)
│   └── utils/                  (thumbnail.ts)
│
└── diagram-v2/                 (~4,200 lines, 27 files)
    ├── VisualPlayBuilderV2.tsx (Lightweight canvas)
    ├── FieldCanvas.tsx         (3,283 lines - monolith)
    ├── DiagramV2Route.tsx
    ├── components/             (15 components)
    ├── context.tsx             (1,321 lines - monolith)
    ├── hooks/                  (5 hooks)
    ├── types.ts
    ├── formations.ts
    └── thumbnail.ts
```

### **Key Issues** 🚨

1. **Confusing Names**: "diagram" vs "diagram-v2" doesn't explain purpose
2. **Duplicate Components**: Both have CanvasPane, Toolbar, HelpOverlay, etc.
3. **Duplicate Utilities**: Both have thumbnail.ts with similar logic
4. **Monolithic Files**: 
   - `diagram-v2/FieldCanvas.tsx` (3,283 lines)
   - `diagram-v2/context.tsx` (1,321 lines)
5. **Mixed Architectures**: diagram/ has FieldCanvas/ folder, diagram-v2/ has FieldCanvas.tsx file

### **What's Shared vs Unique**

| Feature | diagram/ | diagram-v2/ | Should Be Shared? |
|---------|----------|-------------|-------------------|
| FieldCanvas rendering | ✅ (folder) | ✅ (file) | ❓ Different approaches |
| Toolbar | ✅ | ✅ | ✅ YES |
| CanvasPane | ✅ | ✅ | ✅ YES |
| HelpOverlay | ✅ | ✅ | ✅ YES |
| PlayerSidebar | ✅ | ✅ | ✅ YES |
| Context/State | ✅ (separate) | ✅ (unified) | ❓ Different patterns |
| Thumbnail utility | ✅ | ✅ | ✅ YES |
| Types | ✅ | ✅ | ❓ Partially |
| Play metadata form | ✅ | ❌ | ❌ NO (diagram-editor only) |
| Field settings panel | ✅ | ❌ | ❌ NO (diagram-editor only) |

---

## 🏗️ Proposed New Structure

### **Option A: Descriptive Names** (RECOMMENDED)

```
src/components/playbook/
├── diagram-editor/              (Full-featured, was diagram/)
│   ├── DiagramEditor.tsx        (was PlayDiagramBuilder.tsx)
│   ├── components/
│   │   ├── metadata/            (Play metadata forms)
│   │   ├── settings/            (Field settings panels)
│   │   └── properties/          (Player/Route properties)
│   ├── field/                   (Field rendering - keep orchestrator)
│   └── context/
│
├── diagram-canvas/              (Lightweight, was diagram-v2/)
│   ├── DiagramCanvas.tsx        (was VisualPlayBuilderV2.tsx)
│   ├── DiagramCanvasRoute.tsx   (was DiagramV2Route.tsx)
│   ├── field/
│   │   └── FieldCanvas.tsx      (needs refactoring - 3,283 lines)
│   ├── context.tsx              (needs refactoring - 1,321 lines)
│   └── hooks/
│
└── diagram-shared/              (NEW - Common components)
    ├── components/
    │   ├── Toolbar/             (Unified toolbar)
    │   ├── CanvasPane/          (Unified canvas wrapper)
    │   ├── HelpOverlay/         (Unified help)
    │   └── common/              (Shared UI components)
    ├── types/                   (Common types)
    ├── utils/
    │   ├── thumbnail.ts         (Unified utility)
    │   └── geometry.ts          (Shared calculations)
    └── hooks/                   (Shared hooks if any)
```

### **Option B: Feature-Based** (Alternative)

```
src/components/playbook/
├── diagram/
│   ├── editor/                  (Full editor - was diagram/)
│   ├── canvas/                  (Canvas only - was diagram-v2/)
│   └── shared/                  (Common code)
```

**Recommendation**: **Option A** - More explicit and easier to understand at a glance.

---

## 🔨 Refactoring Plan

### **Phase 1: Extract Shared Components** ⚙️

**Goal**: Create `diagram-shared/` with common components

**Steps**:
1. Create `src/components/playbook/diagram-shared/` directory structure
2. Analyze and unify duplicate components:
   - Compare `diagram/components/Toolbar.tsx` vs `diagram-v2/components/Toolbar.tsx`
   - Merge into single parameterized version
   - Same for CanvasPane, HelpOverlay, etc.
3. Extract common types to `diagram-shared/types/`
4. Unify thumbnail utilities
5. Update imports in both systems

**Files to Create**:
```
diagram-shared/
├── components/
│   ├── Toolbar.tsx              (unified)
│   ├── CanvasPane.tsx           (unified)
│   ├── HelpOverlay.tsx          (unified)
│   ├── HelpHint.tsx             (unified)
│   └── TipsOverlay.tsx          (unified)
├── types/
│   ├── common.ts                (shared types)
│   └── canvas.ts                (field/canvas types)
├── utils/
│   └── thumbnail.ts             (unified utility)
└── index.ts                     (barrel export)
```

### **Phase 2: Rename diagram/ → diagram-editor/** 📝

**Goal**: Clear naming for full-featured editor

**Steps**:
1. Rename directory: `diagram/` → `diagram-editor/`
2. Rename main file: `PlayDiagramBuilder.tsx` → `DiagramEditor.tsx`
3. Organize subdirectories:
   - `components/metadata/` - Play metadata forms
   - `components/settings/` - Field settings panels
   - `components/properties/` - Player/Route properties panels
4. Update all imports across codebase
5. Update tests

**Major Changes**:
- `diagram/PlayDiagramBuilder.tsx` → `diagram-editor/DiagramEditor.tsx`
- `diagram/components/` → `diagram-editor/components/`
- `diagram/context/` → `diagram-editor/context/`
- `diagram/FieldCanvas/` → `diagram-editor/field/` (keep orchestrator pattern)

### **Phase 3: Rename diagram-v2/ → diagram-canvas/** 📝

**Goal**: Clear naming for lightweight canvas

**Steps**:
1. Rename directory: `diagram-v2/` → `diagram-canvas/`
2. Rename main files:
   - `VisualPlayBuilderV2.tsx` → `DiagramCanvas.tsx`
   - `DiagramV2Route.tsx` → `DiagramCanvasRoute.tsx`
3. **REFACTOR**: Split monolithic files:
   - Break `FieldCanvas.tsx` (3,283 lines) into smaller components
   - Split `context.tsx` (1,321 lines) into separate context/actions/reducers
4. Update all imports
5. Update route in `DiagramPaneRoute.tsx`

**Major Changes**:
- `diagram-v2/VisualPlayBuilderV2.tsx` → `diagram-canvas/DiagramCanvas.tsx`
- `diagram-v2/DiagramV2Route.tsx` → `diagram-canvas/DiagramCanvasRoute.tsx`
- `diagram-v2/context.tsx` → `diagram-canvas/context/` (split into multiple files)
- `diagram-v2/FieldCanvas.tsx` → `diagram-canvas/field/` (split into components)

### **Phase 4: Refactor Monolithic Files** 🔧

#### **A. Split diagram-canvas/FieldCanvas.tsx** (3,283 lines)

**Current**: One massive file with everything

**Proposed**:
```
diagram-canvas/field/
├── FieldCanvas.tsx              (~200 lines - main coordinator)
├── components/
│   ├── FieldBackground.tsx      (Field rendering)
│   ├── FieldGrid.tsx            (Grid lines)
│   ├── FieldYardLines.tsx       (Yard markers)
│   ├── FieldHashMarks.tsx       (Hash marks)
│   ├── FieldPlayers.tsx         (Player rendering)
│   ├── FieldRoutes.tsx          (Route rendering)
│   └── FieldAnnotations.tsx     (Text/shapes)
├── hooks/
│   ├── useFieldDragDrop.ts
│   ├── useFieldKeyboard.ts
│   ├── useFieldZoomPan.ts
│   └── useFieldSnapping.ts
└── utils/
    ├── coordinates.ts           (Coordinate transformations)
    └── rendering.ts             (SVG helpers)
```

#### **B. Split diagram-canvas/context.tsx** (1,321 lines)

**Current**: One massive file with context, actions, reducers, types

**Proposed**:
```
diagram-canvas/context/
├── DiagramContext.tsx           (~100 lines - context provider)
├── DiagramContextInstance.ts    (~20 lines - context creation)
├── useDiagram.ts                (~30 lines - hook)
├── actions.ts                   (~300 lines - action creators)
├── reducer.ts                   (~400 lines - reducer logic)
├── types.ts                     (~200 lines - state types)
└── initialState.ts              (~100 lines - default state)
```

### **Phase 5: Update Imports** 🔗

**Files to Update**:
1. `src/pages/PlaybookPage.tsx` - Update lazy import
2. `src/components/playbook/DiagramPaneRoute.tsx` - Update import
3. All tests referencing diagram components
4. Any other components importing diagram utilities

**Search Patterns**:
```bash
# Find all imports from diagram/
grep -r "from.*diagram/" src/ --include="*.tsx" --include="*.ts"

# Find all imports from diagram-v2/
grep -r "from.*diagram-v2/" src/ --include="*.tsx" --include="*.ts"
```

### **Phase 6: Update Documentation** 📚

**Files to Update**:
1. `README.md` - Update architecture section
2. `docs/ARCHITECTURE.md` - Update diagram system section
3. `docs/DIAGRAM_SYSTEM_AUDIT_OCT7_2025.md` - Add note about refactor
4. Create `docs/DIAGRAM_SYSTEM_ARCHITECTURE.md` - Comprehensive guide

**New Documentation**:
```markdown
# Diagram System Architecture

## Overview
BoxCall has two diagram systems:

### diagram-editor/ (Full-Featured Editor)
- **Purpose**: Comprehensive play editor with metadata forms
- **Used In**: PlaybookPage modal
- **Features**: Play metadata, field settings, formations, personnel

### diagram-canvas/ (Lightweight Canvas)
- **Purpose**: Quick diagram editing, canvas-only
- **Used In**: DiagramPaneRoute at `/playbook/diagram`
- **Features**: Canvas, tools, minimal UI

### diagram-shared/ (Common Components)
- **Purpose**: Shared components and utilities
- **Contains**: Toolbar, CanvasPane, HelpOverlay, thumbnail utils
```

---

## 📋 Implementation Checklist

### **Phase 1: Shared Components** ✅
- [ ] Create `diagram-shared/` directory structure
- [ ] Compare and unify Toolbar components
- [ ] Compare and unify CanvasPane components
- [ ] Compare and unify HelpOverlay components
- [ ] Extract common types
- [ ] Unify thumbnail utilities
- [ ] Create barrel exports
- [ ] Update imports in both systems
- [ ] Type check

### **Phase 2: Rename diagram-editor** ✅
- [ ] Create `diagram-editor/` directory
- [ ] Move all files from `diagram/`
- [ ] Rename `PlayDiagramBuilder.tsx` → `DiagramEditor.tsx`
- [ ] Organize into subdirectories (metadata/, settings/, properties/)
- [ ] Update all imports (grep search + replace)
- [ ] Update `PlaybookPage.tsx` lazy import
- [ ] Update tests
- [ ] Type check
- [ ] Delete old `diagram/` directory

### **Phase 3: Rename diagram-canvas** ✅
- [ ] Create `diagram-canvas/` directory
- [ ] Move all files from `diagram-v2/`
- [ ] Rename `VisualPlayBuilderV2.tsx` → `DiagramCanvas.tsx`
- [ ] Rename `DiagramV2Route.tsx` → `DiagramCanvasRoute.tsx`
- [ ] Update all imports
- [ ] Update `DiagramPaneRoute.tsx` import
- [ ] Update tests
- [ ] Type check
- [ ] Delete old `diagram-v2/` directory

### **Phase 4: Refactor Monoliths** ⚙️
- [ ] Split `FieldCanvas.tsx` (3,283 lines)
  - [ ] Extract field background
  - [ ] Extract grid rendering
  - [ ] Extract yard lines
  - [ ] Extract hash marks
  - [ ] Extract player rendering
  - [ ] Extract route rendering
  - [ ] Extract annotations
  - [ ] Create field hooks
  - [ ] Create field utils
- [ ] Split `context.tsx` (1,321 lines)
  - [ ] Extract types
  - [ ] Extract actions
  - [ ] Extract reducer
  - [ ] Extract initial state
  - [ ] Create context provider
  - [ ] Create custom hook
- [ ] Type check after each split
- [ ] Test after each split

### **Phase 5: Update Imports** 🔗
- [ ] Run grep to find all diagram imports
- [ ] Update PlaybookPage.tsx
- [ ] Update DiagramPaneRoute.tsx
- [ ] Update all test files
- [ ] Update any other importing files
- [ ] Type check
- [ ] Run tests

### **Phase 6: Documentation** 📚
- [ ] Update README.md
- [ ] Update ARCHITECTURE.md
- [ ] Create DIAGRAM_SYSTEM_ARCHITECTURE.md
- [ ] Update DIAGRAM_SYSTEM_AUDIT_OCT7_2025.md
- [ ] Add inline JSDoc comments explaining system choice
- [ ] Create migration guide for developers

### **Phase 7: Final Validation** ✅
- [ ] Full type check (`npm run type-check`)
- [ ] Run all tests (`npm run test`)
- [ ] Run lint (`npm run lint`)
- [ ] Build project (`npm run build`)
- [ ] Manual QA: Test diagram editor in PlaybookPage
- [ ] Manual QA: Test diagram canvas in DiagramPaneRoute
- [ ] Manual QA: Test all tools (draw, move, delete, etc.)
- [ ] Manual QA: Test save/export functionality

---

## 🎯 Expected Outcomes

### **Before Refactor**
- ❌ Confusing names (diagram/ vs diagram-v2/)
- ❌ ~1,500 lines of duplicate code
- ❌ Monolithic files (3,283 + 1,321 lines)
- ❌ Unclear which system to use
- ❌ Hard to maintain

### **After Refactor**
- ✅ Clear names (diagram-editor/, diagram-canvas/, diagram-shared/)
- ✅ Minimal duplication (shared components extracted)
- ✅ Well-organized files (<500 lines each)
- ✅ Clear documentation on usage
- ✅ Easier to maintain and extend

### **Metrics**
- **Files reduced**: ~10-15 duplicate components consolidated
- **Largest file size**: <600 lines (down from 3,283)
- **Code reuse**: ~20% of code moved to shared directory
- **Clarity**: 100% (obvious naming)

---

## ⚠️ Risks & Mitigation

### **Risk 1: Breaking Changes**
**Mitigation**: 
- Work in feature branch
- Type check after each phase
- Run tests after each phase
- Manual QA before merging

### **Risk 2: Import Hell**
**Mitigation**:
- Use automated search/replace for imports
- Barrel exports from each directory
- Update one system at a time

### **Risk 3: Lost Functionality**
**Mitigation**:
- Keep all components initially
- Test thoroughly
- Have rollback plan (git branch)

### **Risk 4: Merge Conflicts**
**Mitigation**:
- Coordinate with team
- Do refactor when no other diagram work in progress
- Complete in single PR

---

## 🚀 Timeline Estimate

| Phase | Estimated Time | Complexity |
|-------|---------------|------------|
| Phase 1: Shared Components | 3-4 hours | Medium |
| Phase 2: Rename diagram-editor | 1-2 hours | Low |
| Phase 3: Rename diagram-canvas | 1-2 hours | Low |
| Phase 4: Refactor Monoliths | 5-6 hours | High |
| Phase 5: Update Imports | 1-2 hours | Low |
| Phase 6: Documentation | 2-3 hours | Low |
| Phase 7: Validation | 2-3 hours | Medium |
| **Total** | **15-22 hours** | **2-3 days** |

---

## 📝 Notes

- All existing functionality must be preserved
- No UI/UX changes (pure refactor)
- Focus on code organization and maintainability
- Keep backward compatibility during transition if needed

---

**Plan Created**: October 7, 2025  
**Ready to Execute**: ✅ YES  
**Approval Required**: ⚠️ YES (Team lead should review)
