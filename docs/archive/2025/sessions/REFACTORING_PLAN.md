# Code Refactoring Plan - Large File Decomposition

**Created**: October 4, 2025  
**Status**: Planning Phase  
**Priority**: High - Blocking Phase 3B spacing migrations

## Executive Summary

Identified 6 files exceeding 1000 lines that need decomposition before continuing Phase 3B migrations. Large files make spacing token migrations error-prone and difficult to maintain.

**Total Lines to Refactor**: 9,392 lines across 6 files

## Problem Statement

### Current Blockers

1. **AddNewPlayModal.tsx** (1,323 lines, 121 spacing instances)
   - Only 8/121 spacing instances migrated due to file size
   - 113 remaining instances blocked by complexity
   - Single-file monolith with multiple form sections

2. **Maintenance Issues**
   - Files >1000 lines violate single responsibility principle
   - Difficult to test individual sections
   - High cognitive load for developers
   - Merge conflicts more likely

## Files Requiring Refactoring

### Priority 1: Blocking Spacing Migrations

#### 1. AddNewPlayModal.tsx (1,323 lines) 🔴 **HIGHEST PRIORITY**

- **Current State**: 8/121 spacing instances migrated
- **Complexity**: 11 imports, massive form state, multiple sections
- **Sections Identified**:
  - Formation input with fuzzy search (150+ lines)
  - Play name input with fuzzy search (150+ lines)
  - Personnel selection (100+ lines)
  - Play type multi-select (80+ lines)
  - Advanced options section (300+ lines)
  - Preferences section (200+ lines)
  - Position/player/flag management (200+ lines)

**Refactoring Strategy**:

```
src/components/playbook/AddNewPlayModal/
├── index.tsx (main modal orchestrator, 150 lines)
├── usePlayFormState.ts (form state hook, 100 lines)
├── usePlaySuggestions.ts (fuzzy search logic, 80 lines)
├── sections/
│   ├── FormationSection.tsx (formation input + suggestions)
│   ├── PlayNameSection.tsx (play name input + suggestions)
│   ├── PersonnelSection.tsx (personnel input + suggestions)
│   ├── PlayTypeSection.tsx (play type multi-select)
│   ├── PreferencesSection.tsx (down, distance, hash, coverage)
│   └── AdvancedOptionsSection.tsx (formation details, tags)
├── components/
│   ├── FuzzySearchInput.tsx (reusable autocomplete)
│   ├── TagInput.tsx (reusable tag management)
│   └── PositionManager.tsx (position/player/flag UI)
└── types.ts (form data types)
```

**Expected Outcome**:

- Main file: ~150 lines
- 7 section components: ~150 lines each
- 3 reusable components: ~100 lines each
- Total: ~1,500 lines (distributed across 12 files)
- **Benefit**: Each section's spacing can be migrated independently

---

#### 2. ProfilePage.tsx (1,381 lines) 🟡

- **Current State**: Already migrated in Phase 3A (72 spacing instances)
- **Complexity**: 13 imports, large state management
- **Issue**: Completed migration, but maintenance burden remains

**Refactoring Strategy**:

```
src/pages/ProfilePage/
├── index.tsx (page orchestrator, 150 lines)
├── useProfileData.ts (data fetching hook)
├── sections/
│   ├── ProfileHeader.tsx (avatar, name, bio)
│   ├── AchievementsSection.tsx (badges, trophies)
│   ├── StatsSection.tsx (performance metrics)
│   ├── ActivitySection.tsx (recent activity feed)
│   └── TeamsSection.tsx (team memberships)
└── components/
    ├── EditProfileModal.tsx
    └── AchievementCard.tsx
```

---

### Priority 2: Technical Debt

#### 3. FieldCanvas.tsx (3,283 lines) 🔴 **LARGEST FILE**

- **Location**: `src/components/playbook/diagram-v2/`
- **Complexity**: Monolithic canvas implementation
- **Issue**: Single file handling entire play diagram rendering

**Refactoring Strategy**:

```
src/components/playbook/diagram-v2/FieldCanvas/
├── index.tsx (canvas orchestrator)
├── hooks/
│   ├── useCanvasState.ts
│   ├── useCanvasRendering.ts
│   ├── useCanvasInteraction.ts
│   └── useCanvasSelection.ts
├── renderers/
│   ├── FieldRenderer.tsx (field lines, markers)
│   ├── PlayerRenderer.tsx (player positions)
│   ├── RouteRenderer.tsx (route paths)
│   └── AnnotationRenderer.tsx (labels, notes)
├── tools/
│   ├── SelectionTool.tsx
│   ├── DrawingTool.tsx
│   └── AnnotationTool.tsx
└── utils/
    ├── coordinates.ts
    ├── hitDetection.ts
    └── snapToGrid.ts
```

---

#### 4. context.tsx (1,321 lines) 🟡

- **Location**: `src/components/playbook/diagram-v2/`
- **Complexity**: 11 imports, massive context provider

**Refactoring Strategy**:

```
src/components/playbook/diagram-v2/context/
├── DiagramProvider.tsx (main provider)
├── hooks/
│   ├── useDiagramState.ts
│   ├── useDiagramActions.ts
│   └── useDiagramSelectors.ts
├── reducers/
│   ├── diagramReducer.ts
│   ├── selectionReducer.ts
│   └── historyReducer.ts
└── types.ts
```

---

#### 5. auth-store.ts (1,075 lines) 🟢

- **Location**: `src/app/`
- **Complexity**: 27 imports/exports, Zustand store
- **Issue**: All auth logic in single store file

**Refactoring Strategy**:

```
src/app/auth/
├── store.ts (main store, 150 lines)
├── slices/
│   ├── userSlice.ts
│   ├── sessionSlice.ts
│   ├── permissionsSlice.ts
│   └── profileSlice.ts
├── actions/
│   ├── loginActions.ts
│   ├── signupActions.ts
│   └── profileActions.ts
├── selectors/
│   ├── userSelectors.ts
│   └── permissionSelectors.ts
└── types.ts
```

---

#### 6. PracticePlanner.tsx (1,010 lines) 🟢

- **Location**: `src/pages/`
- **Complexity**: 27 imports, large page component

**Refactoring Strategy**:

```
src/pages/PracticePlanner/
├── index.tsx (page orchestrator)
├── sections/
│   ├── PlannerHeader.tsx
│   ├── PlannerCalendar.tsx
│   ├── PlannerTimeline.tsx
│   └── PlannerDrills.tsx
├── components/
│   ├── DrillCard.tsx
│   ├── TimeSlot.tsx
│   └── PlannerFilters.tsx
└── hooks/
    ├── usePlannerState.ts
    └── usePlannerActions.ts
```

---

## Implementation Plan

### Phase 1: AddNewPlayModal Refactoring (Highest Priority)

**Estimated Time**: 2-3 hours  
**Blocks**: 113 spacing instances in AddNewPlayModal

1. **Extract Form State** (30 min)
   - Create `usePlayFormState.ts` hook
   - Move form data state and validation logic
   - Test state management in isolation

2. **Extract Fuzzy Search** (30 min)
   - Create `usePlaySuggestions.ts` hook
   - Move suggestion loading and filtering logic
   - Create reusable `FuzzySearchInput.tsx` component

3. **Extract Form Sections** (90 min)
   - Create 6 section components in `sections/` directory
   - Each section: ~150 lines, focused responsibility
   - Migrate spacing tokens in each small section (15 min each)

4. **Refactor Main Modal** (30 min)
   - Reduce to orchestrator: render sections, handle submit
   - Should be ~150 lines after extraction

5. **Testing & Validation** (30 min)
   - Run type check and lint
   - Test form submission flow
   - Verify all 121 spacing instances migrated

**Success Criteria**:

- ✅ AddNewPlayModal main file <200 lines
- ✅ All sections <200 lines each
- ✅ 121/121 spacing instances migrated
- ✅ 0 TypeScript errors
- ✅ All tests passing

---

### Phase 2: Return to Phase 3B Migrations

**Estimated Time**: 2-3 hours

After AddNewPlayModal refactoring, resume spacing migrations with cleaner codebase:

- CSVImportModal (81 instances)
- AnalyticsDashboard (87 instances)
- PlayCardDetails (62 instances)
- Remaining smaller components

**Target**: Reach 60-70% of total spacing instances (500-600 instances)

---

### Phase 3: Additional Large File Refactoring (Future)

**Estimated Time**: 1-2 days

Tackle remaining large files in priority order:

1. FieldCanvas.tsx (3,283 lines) - diagram rendering
2. context.tsx (1,321 lines) - diagram state
3. ProfilePage.tsx (1,381 lines) - already migrated spacing
4. auth-store.ts (1,075 lines) - auth state
5. PracticePlanner.tsx (1,010 lines) - practice planning

---

## Benefits

### Immediate Benefits (Phase 1)

- ✅ Unblock 113 spacing instances in AddNewPlayModal
- ✅ Easier code review (small, focused components)
- ✅ Faster spacing token migrations
- ✅ Better component reusability

### Long-term Benefits (Phase 3)

- ✅ Improved maintainability
- ✅ Better testability (isolated components)
- ✅ Reduced merge conflicts
- ✅ Easier onboarding for new developers
- ✅ Clearer separation of concerns

---

## Risks & Mitigation

### Risk: Breaking Existing Functionality

**Mitigation**:

- Extract one section at a time
- Test after each extraction
- Keep git commits small and focused
- Run type checker continuously

### Risk: Time Investment vs. Migration Progress

**Mitigation**:

- Focus only on AddNewPlayModal (blocks 113 instances)
- Defer other large files to post-Phase 3B
- Measure time spent vs. instances gained

### Risk: Increased File Count

**Mitigation**:

- Better than massive monoliths
- Proper directory structure aids discovery
- TypeScript imports handle file relationships

---

## Next Steps

1. ✅ Create this refactoring plan
2. ⏭️ **Start Phase 1**: Extract AddNewPlayModal sections
3. ⏭️ Complete AddNewPlayModal spacing migration (113 remaining)
4. ⏭️ Resume Phase 3B migrations on other components
5. ⏭️ Phase 3: Tackle remaining large files

---

## Metrics

### Current State

- **Files >1000 lines**: 6 files, 9,392 total lines
- **Largest file**: FieldCanvas.tsx (3,283 lines)
- **Spacing migration blocked**: 113 instances in AddNewPlayModal

### Target State (Post-Phase 1)

- **AddNewPlayModal**: 12 files, max 150 lines each
- **Spacing migration**: 121/121 instances complete
- **Files >1000 lines**: 5 files (AddNewPlayModal refactored)

### Target State (Post-Phase 3)

- **Files >1000 lines**: 0 files
- **Average file size**: <400 lines
- **Component reusability**: High (extracted shared components)

---

**Last Updated**: October 4, 2025  
**Status**: Ready to begin Phase 1 (AddNewPlayModal refactoring)
