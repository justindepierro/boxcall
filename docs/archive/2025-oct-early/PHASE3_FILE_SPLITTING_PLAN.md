# Phase 3: File Splitting Plan

**Date**: October 13, 2025  
**Status**: Planning Complete, Ready for Implementation

---

## 📊 Overview

**Target**: 8 large files totaling ~10,000 lines
**Goal**: Split into focused, maintainable modules (<500 lines each)
**Estimated Impact**: Improved maintainability, testability, and developer experience

---

## 🎯 Priority Files for Splitting

### ✅ RECOMMENDED: Start with Service Layer (Easier, Lower Risk)

#### 1. `dataSyncService.ts` (986 lines) → **PRIORITY 1**

**Current Issues**:

- Single massive static class with 5 distinct responsibilities
- Hard to test individual features
- Difficult to navigate

**Proposed Split**:

```
src/services/dataSyncService/
├── index.ts                          (Main export, 50 lines)
├── DataSyncService.ts                (Core orchestrator, 150 lines)
├── query/
│   ├── PlaysQueryService.ts          (getPlays, updatePlay, createPlay, ~200 lines)
│   └── BulkOperationsService.ts      (bulkCreatePlays, importFromCSV, ~150 lines)
├── backup/
│   ├── BackupService.ts              (Automatic backups, ~150 lines)
│   └── ExportService.ts              (Comprehensive export, ~100 lines)
├── realtime/
│   ├── RealtimeSyncService.ts        (Setup & handlers, ~150 lines)
│   └── SyncNotificationService.ts    (User notifications, ~50 lines)
├── storage/
│   ├── IndexedDBService.ts           (All IndexedDB ops, ~200 lines)
│   └── CacheService.ts               (Cache management, ~150 lines)
└── types.ts                          (Shared interfaces, ~50 lines)
```

**Benefits**:

- Each service <250 lines
- Easy to test in isolation
- Clear separation of concerns
- Can import only what you need

**Estimated Time**: 3-4 hours (with testing)
**Risk Level**: LOW (service layer, good test coverage)

---

#### 2. `auth-store.ts` (1,271 lines) → **PRIORITY 2**

**Current Issues**:

- Zustand store with too many responsibilities
- Mix of auth, user management, team switching, dev profiles
- Complex state management

**Proposed Split**:

```
src/app/auth/
├── index.ts                          (Re-exports, 30 lines)
├── auth-store.ts                     (Core auth state, 300 lines)
├── stores/
│   ├── user-store.ts                 (User profile management, 250 lines)
│   ├── team-store.ts                 (Team switching logic, 250 lines)
│   └── dev-profile-store.ts          (Dev mode profiles, 200 lines)
├── hooks/
│   ├── useAuth.ts                    (Auth hooks, 100 lines)
│   ├── useUserProfile.ts             (Profile hooks, 100 lines)
│   └── useTeamSwitching.ts           (Team hooks, 100 lines)
└── types.ts                          (Auth types, 100 lines)
```

**Benefits**:

- Smaller, focused stores
- Better hook organization
- Easier to optimize with selectors
- Clear boundaries

**Estimated Time**: 4-5 hours (state management is tricky)
**Risk Level**: MEDIUM (critical path, needs careful testing)

---

### ⚠️ COMPLEX: Component Layer (Higher Risk, More Effort)

#### 3. `PlayerControls.tsx` (1,355 lines) → **PRIORITY 3**

**Current Issues**:

- Massive single component
- Multiple dropdowns, modals, and state management
- Hard to understand flow

**Proposed Split**:

```
src/components/playbook/diagram-editor/components/PlayerControls/
├── index.ts                                  (Main export, 20 lines)
├── PlayerControls.tsx                        (Shell component, 200 lines)
├── hooks/
│   ├── usePlayerOperations.ts                (Add/remove logic, 150 lines)
│   ├── useFormationAnalysis.ts               (Analysis state, 100 lines)
│   ├── useDefensiveAdjustments.ts            (Coverage logic, 150 lines)
│   └── useAlignmentSelection.ts              (Alignment state, 80 lines)
├── components/
│   ├── FormationDropdown.tsx                 (Formation menu, 200 lines)
│   ├── DefenseDropdown.tsx                   (Defense menu, 150 lines)
│   ├── CoverageDropdown.tsx                  (Coverage menu, 150 lines)
│   ├── FormationConfirmationModal.tsx        (Confirm dialog, 100 lines)
│   ├── AddPlayersSection.tsx                 (Player buttons, 150 lines)
│   └── SpacingIndicatorSection.tsx           (Spacing controls, 100 lines)
└── types.ts                                  (Local types, 50 lines)
```

**Benefits**:

- Each component <200 lines
- Hooks extract complex logic
- Reusable dropdown components
- Easier to test

**Estimated Time**: 6-8 hours (complex component with state)
**Risk Level**: HIGH (interactive UI, state management)

---

#### 4. `PlayGrid.tsx` (1,121 lines) → **PRIORITY 4**

**Current Issues**:

- Grid display + filters + bulk actions in one file
- Complex selection state
- Multiple modals

**Proposed Split**:

```
src/components/playbook/PlayGrid/
├── index.ts                              (Main export, 20 lines)
├── PlayGrid.tsx                          (Grid shell, 250 lines)
├── hooks/
│   ├── usePlayGridState.ts               (Grid state management, 200 lines)
│   ├── usePlaySelection.ts               (Selection logic, 150 lines)
│   ├── usePlayFiltering.ts               (Filter state, 150 lines)
│   └── useBulkActions.ts                 (Bulk ops, 150 lines)
├── components/
│   ├── PlayGridHeader.tsx                (Toolbar, 120 lines)
│   ├── PlayGridControls.tsx              (View switcher, 100 lines)
│   ├── FilterPanel.tsx                   (Filters UI, 200 lines)
│   └── BulkActionsToolbar.tsx            (Already exists, reuse)
└── types.ts                              (Grid types, 50 lines)
```

**Benefits**:

- Clear separation of concerns
- Hooks encapsulate complex logic
- Reusable filter/selection patterns

**Estimated Time**: 5-6 hours
**Risk Level**: MEDIUM (complex state but good patterns)

---

#### 5. `DiagramEditor.tsx` (1,260 lines) → **PRIORITY 5**

**Current Issues**:

- Main editor component with everything
- Toolbar, modals, handlers all in one place
- PixiJS integration complexity

**Proposed Split**:

```
src/components/playbook/diagram-editor/DiagramEditor/
├── index.ts                              (Main export, 20 lines)
├── DiagramEditor.tsx                     (Core editor, 300 lines)
├── hooks/
│   ├── useDiagramSetup.ts                (Initialization, 150 lines)
│   ├── useDiagramHandlers.ts             (Event handlers, 200 lines)
│   ├── useDiagramKeyboard.ts             (Keyboard shortcuts, 150 lines)
│   └── useDiagramGestures.ts             (Touch/mouse, 150 lines)
├── components/
│   ├── DiagramToolbar.tsx                (Main toolbar, 200 lines)
│   ├── DiagramModals.tsx                 (Modal container, 150 lines)
│   ├── DiagramCanvas.tsx                 (Already exists, enhanced)
│   └── DiagramStatusBar.tsx              (Status/info bar, 100 lines)
└── types.ts                              (Editor types, 50 lines)
```

**Benefits**:

- Isolate PixiJS complexity
- Extract handler logic
- Testable hooks

**Estimated Time**: 7-9 hours (PixiJS complexity)
**Risk Level**: HIGH (core editor, performance critical)

---

### 📄 PAGE Components (Mixed Risk)

#### 6. `PlaybookPage.tsx` (1,535 lines) → **PRIORITY 6**

**Current Issues**:

- Page logic + layout + state management
- Multiple feature orchestration
- Hard to understand flow

**Proposed Split**:

```
src/pages/PlaybookPage/
├── index.ts                              (Route export, 20 lines)
├── PlaybookPage.tsx                      (Page shell, 200 lines)
├── hooks/
│   ├── usePlaybookData.ts                (Data fetching, 150 lines)
│   ├── usePlaybookFilters.ts             (Filter state, 150 lines)
│   ├── usePlaybookSelection.ts           (Selection, 150 lines)
│   └── usePlaybookActions.ts             (CRUD actions, 200 lines)
├── components/
│   ├── PlaybookHeader.tsx                (Already exists, enhanced)
│   ├── PlaybookFilters.tsx               (Filter panel, 200 lines)
│   ├── PlaybookViewToggle.tsx            (View switcher, 100 lines)
│   └── PlaybookBulkActions.tsx           (Bulk toolbar, 150 lines)
└── types.ts                              (Page types, 50 lines)
```

**Estimated Time**: 5-6 hours
**Risk Level**: MEDIUM (complex but well-structured)

---

#### 7. `ProfilePage.tsx` (1,381 lines) → **PRIORITY 7**

**Proposed Split**:

```
src/pages/ProfilePage/
├── index.ts                              (Route export, 20 lines)
├── ProfilePage.tsx                       (Page shell, 200 lines)
├── sections/
│   ├── PersonalInfoSection.tsx           (Basic info, 300 lines)
│   ├── TeamMembershipsSection.tsx        (Teams, 250 lines)
│   ├── PreferencesSection.tsx            (Settings, 250 lines)
│   └── SecuritySection.tsx               (Auth settings, 200 lines)
├── hooks/
│   ├── useProfileData.ts                 (Data management, 150 lines)
│   └── useProfileUpdate.ts               (Update logic, 100 lines)
└── types.ts                              (Profile types, 50 lines)
```

**Estimated Time**: 4-5 hours
**Risk Level**: LOW (clear sections)

---

#### 8. `RosterPage.tsx` (1,044 lines) → **PRIORITY 8**

**Proposed Split**:

```
src/pages/RosterPage/
├── index.ts                              (Route export, 20 lines)
├── RosterPage.tsx                        (Page shell, 200 lines)
├── components/
│   ├── RosterList.tsx                    (Player list, 250 lines)
│   ├── RosterFilters.tsx                 (Filter panel, 150 lines)
│   ├── RosterActions.tsx                 (Toolbar, 150 lines)
│   ├── PlayerFormModal.tsx               (Add/edit, 200 lines)
│   └── RosterImportModal.tsx             (Already exists, enhanced)
├── hooks/
│   ├── useRosterData.ts                  (Data management, 150 lines)
│   └── useRosterOperations.ts            (CRUD, 150 lines)
└── types.ts                              (Roster types, 50 lines)
```

**Estimated Time**: 4-5 hours
**Risk Level**: LOW (straightforward CRUD)

---

## 📋 Implementation Strategy

### Phase 3A: Service Layer (Week 1)

1. ✅ `dataSyncService.ts` → Split into 5 focused services
2. ✅ `auth-store.ts` → Split into stores + hooks

**Estimated**: 8-10 hours
**Risk**: LOW-MEDIUM

### Phase 3B: Component Layer (Week 2)

3. ✅ `PlayerControls.tsx` → Extract hooks + sub-components
4. ✅ `PlayGrid.tsx` → Extract state management
5. ✅ `DiagramEditor.tsx` → Extract handlers + toolbar

**Estimated**: 18-23 hours
**Risk**: MEDIUM-HIGH

### Phase 3C: Page Layer (Week 3)

6. ✅ `PlaybookPage.tsx` → Extract sections
7. ✅ `ProfilePage.tsx` → Extract sections
8. ✅ `RosterPage.tsx` → Extract components

**Estimated**: 13-16 hours
**Risk**: LOW-MEDIUM

---

## ✅ Success Criteria

For each file split:

1. ✅ All original functionality preserved
2. ✅ TypeScript compiles with 0 errors
3. ✅ All existing tests pass
4. ✅ New files are <500 lines each
5. ✅ Clear module boundaries
6. ✅ Improved test coverage possible
7. ✅ No performance regression

---

## 🚀 Quick Win: Start with dataSyncService

**Recommended First Step**: Split `dataSyncService.ts`

**Why**:

- Clear logical boundaries
- Service layer (easier to test)
- Low risk (no UI concerns)
- Big impact (used everywhere)
- Good patterns for other files

**Timeline**: 3-4 hours including tests

---

## 📝 Notes

- Each split should be a separate PR for easier review
- Run full test suite after each split
- Update imports across codebase
- Document new module structure
- Consider adding architectural tests to prevent re-growth

---

**Status**: Ready for implementation
**Next Step**: Begin with `dataSyncService.ts` split
