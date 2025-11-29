# Formation & Personnel Library System - Implementation Roadmap

**Date**: November 29, 2025  
**Estimated Time**: 4-6 hours  
**Goal**: Build centralized formation/personnel libraries with smart inheritance and sync

---

## 🎯 System Overview

Replace scattered formation/personnel data with centralized libraries:

- **Formation Library**: Pre-define formations with metadata (type, strengths, direction)
- **Personnel Library**: Pre-define personnel packages with badge customization
- **Smart Inheritance**: Plays automatically pull data from libraries
- **Bidirectional Sync**: Update library → affects all plays; analyze plays → populate library
- **Clean Architecture**: Small, focused files with clear responsibilities

---

## ✅ Phase 1: Database Schema Enhancement (30 min)

### 1.1 Expand formations table

- [ ] Add `formation_type` column (TEXT: "3x1", "2x2", "Empty", etc.)
- [ ] Add `direction` column (TEXT: "left", "right", null)
- [ ] Add `run_strength` column (TEXT: "left", "right", "balanced")
- [ ] Add `pass_strength` column (TEXT: "left", "right", "balanced")
- [ ] Add `opposite_formation_id` column (UUID foreign key to formations.id)
- [ ] Add `player_positions` column (JSONB for diagram data)
- [ ] Add validation constraints
- [ ] Create indexes for performance

### 1.2 Verify personnel_configurations table

- [ ] Confirm badge_customization JSONB exists
- [ ] Ensure personnel_players linkage works
- [ ] Verify RLS policies

### 1.3 Migration file

- [ ] Create timestamped migration: `YYYYMMDDHHMMSS_formation_personnel_library.sql`
- [ ] Test in Supabase dashboard
- [ ] Commit to `supabase/migrations/`

**Files to create/modify**:

- `supabase/migrations/YYYYMMDDHHMMSS_formation_personnel_library.sql`

---

## ✅ Phase 2: Type System & Data Models (30 min)

### 2.1 Update formation types

- [ ] Expand `Formation` interface in `src/types/formation.ts`
- [ ] Add `FormationLibraryItem` type (extended with metadata)
- [ ] Add `FormationCreate` and `FormationUpdate` types
- [ ] Add validation helpers

### 2.2 Update personnel types

- [ ] Verify `PersonnelConfiguration` type in `src/types/personnel.ts`
- [ ] Add `PersonnelLibraryItem` type
- [ ] Add `PersonnelCreate` and `PersonnelUpdate` types

### 2.3 Create shared library types

- [ ] Create `src/types/library.ts` for common patterns
- [ ] Add `LibraryItemStatus` type ("draft", "active", "archived")
- [ ] Add `SyncStatus` type for tracking play relationships

**Files to create/modify**:

- `src/types/formation.ts` (update)
- `src/types/personnel.ts` (update or create)
- `src/types/library.ts` (new)

---

## ✅ Phase 3: Service Layer - Small Focused Files (90 min)

### 3.1 FormationLibraryService

- [ ] Create `src/services/formationLibrary/FormationLibraryService.ts` (200 lines max)
  - `getFormations(playbookId)` - Fetch all formations
  - `getFormationById(id)` - Get single formation
  - `createFormation(data)` - Create with metadata
  - `updateFormation(id, data)` - Update formation
  - `deleteFormation(id)` - Soft delete
  - `linkOpposite(formationId, oppositeId)` - Link paired formations

### 3.2 FormationIntelligenceService

- [ ] Create `src/services/formationLibrary/FormationIntelligenceService.ts` (250 lines max)
  - `analyzeFormationsFromPlays(playbookId)` - Aggregate metadata from plays
  - `calculateFormationProfile(plays)` - Majority-vote algorithm
  - `detectOpposites(formations)` - Pattern matching (Rip↔Liz, Left↔Right)
  - `getConfidenceScore(plays, field)` - Calculate agreement percentage
  - `populateLibraryFromPlays(playbookId)` - Backfill library from existing plays

### 3.3 FormationSyncService

- [ ] Create `src/services/formationLibrary/FormationSyncService.ts` (200 lines max)
  - `syncPlayToFormation(playId)` - Update play when formation changes
  - `syncFormationToPlays(formationId)` - Cascade updates to all plays
  - `getAffectedPlays(formationId)` - Find plays using this formation
  - `validateSync(playId)` - Check for mismatches

### 3.4 PersonnelLibraryService

- [ ] Create `src/services/personnelLibrary/PersonnelLibraryService.ts` (200 lines max)
  - `getPersonnelConfigs(playbookId)` - Fetch all configs
  - `getPersonnelById(id)` - Get single config
  - `createPersonnel(data)` - Create with badge customization
  - `updatePersonnel(id, data)` - Update config
  - `deletePersonnel(id)` - Soft delete

### 3.5 PersonnelSyncService

- [ ] Create `src/services/personnelLibrary/PersonnelSyncService.ts` (150 lines max)
  - `syncPlayToPersonnel(playId)` - Update play when personnel changes
  - `syncPersonnelToPlays(personnelId)` - Cascade updates to all plays
  - `getAffectedPlays(personnelId)` - Find plays using this personnel

**Files to create**:

- `src/services/formationLibrary/FormationLibraryService.ts`
- `src/services/formationLibrary/FormationIntelligenceService.ts`
- `src/services/formationLibrary/FormationSyncService.ts`
- `src/services/personnelLibrary/PersonnelLibraryService.ts`
- `src/services/personnelLibrary/PersonnelSyncService.ts`

---

## ✅ Phase 4: UI Components - Modular Design (120 min)

### 4.1 Formation Library Page

- [ ] Create `src/pages/FormationLibraryPage.tsx` (300 lines max)
  - Grid/list view toggle
  - Formation cards with metadata preview
  - "Analyze Plays" button to populate library
  - Search/filter by type, strength, direction

### 4.2 Formation Library Components

- [ ] Create `src/components/formation-library/FormationLibraryGrid.tsx` (150 lines)
- [ ] Create `src/components/formation-library/FormationCard.tsx` (200 lines)
  - Shows formation name, type, diagram preview
  - Metadata badges (3x1, Run: Right, Pass: Right)
  - Edit/Delete actions
  - "Used in X plays" count

- [ ] Create `src/components/formation-library/FormationEditorModal.tsx` (300 lines)
  - Form for name, description
  - Dropdowns for formation_type, direction, run_strength, pass_strength
  - Diagram editor integration
  - Opposite formation selector

- [ ] Create `src/components/formation-library/FormationIntelligencePanel.tsx` (250 lines)
  - Shows analyzed formations from plays
  - Confidence scores (e.g., "11/12 plays agree on 3x1")
  - Auto-detected opposites
  - "Save to Library" confirmation

### 4.3 Personnel Library Page

- [ ] Create `src/pages/PersonnelLibraryPage.tsx` (250 lines max)
  - Grid/list view toggle
  - Personnel cards with badge preview
  - Search/filter

### 4.4 Personnel Library Components

- [ ] Create `src/components/personnel-library/PersonnelLibraryGrid.tsx` (150 lines)
- [ ] Create `src/components/personnel-library/PersonnelCard.tsx` (200 lines)
  - Shows personnel name (11, 12, 21)
  - Badge preview
  - Player breakdown (e.g., "1 RB, 1 TE, 3 WR")
  - "Used in X plays" count

- [ ] Create `src/components/personnel-library/PersonnelEditorModal.tsx` (300 lines)
  - Form for name, description
  - Badge customization (colors, labels)
  - Player position builder
  - Preview of badges

### 4.5 Integration with Play Creation

- [ ] Update `src/components/playbook/PlayEditorModal.tsx`
  - Add formation selector dropdown (pulls from library)
  - Add personnel selector dropdown (pulls from library)
  - Auto-populate metadata when selection changes
  - Show inheritance badge (e.g., "Inherited from Formation Library")

**Files to create**:

- `src/pages/FormationLibraryPage.tsx`
- `src/pages/PersonnelLibraryPage.tsx`
- `src/components/formation-library/FormationLibraryGrid.tsx`
- `src/components/formation-library/FormationCard.tsx`
- `src/components/formation-library/FormationEditorModal.tsx`
- `src/components/formation-library/FormationIntelligencePanel.tsx`
- `src/components/personnel-library/PersonnelLibraryGrid.tsx`
- `src/components/personnel-library/PersonnelCard.tsx`
- `src/components/personnel-library/PersonnelEditorModal.tsx`

**Files to modify**:

- `src/components/playbook/PlayEditorModal.tsx`

---

## ✅ Phase 5: Routing & Navigation (15 min)

### 5.1 Add routes

- [ ] Add `/playbook/formations` route in routing config
- [ ] Add `/playbook/personnel` route in routing config

### 5.2 Update navigation

- [ ] Update PlaybookViewTabs to show "Formation Library" and "Personnel Library" buttons
- [ ] Add navigation from FormationBuilderModal to library page
- [ ] Add navigation from PersonnelBuilderModal to library page

**Files to modify**:

- Routing config file (check `src/App.tsx` or routing setup)
- `src/components/playbook/page/PlaybookViewTabs.tsx`

---

## ✅ Phase 6: Cleanup Deprecated Code (30 min)

### 6.1 Remove/archive conflicting logic

- [ ] Review `src/services/formationService.ts` (currently stubbed)
  - Decision: Delete or keep as thin wrapper to new services?
- [ ] Review `src/pages/FormationMapperPage.tsx` (deprecated)
  - Decision: Delete or redirect to new library page?
- [ ] Search for duplicate formation logic
  - `grep -r "formation.*service" src/`
  - Remove redundant helpers

### 6.2 Update documentation

- [ ] Update `docs/ARCHITECTURE.md` with new library system
- [ ] Mark old formation mapper as deprecated in docs
- [ ] Add library system to project overview

**Files to delete/modify**:

- `src/services/formationService.ts` (clean up or remove)
- `src/pages/FormationMapperPage.tsx` (redirect or remove)
- `docs/ARCHITECTURE.md` (update)

---

## ✅ Phase 7: Testing & Validation (45 min)

### 7.1 Service layer tests

- [ ] Test FormationLibraryService CRUD operations
- [ ] Test FormationIntelligenceService aggregation
- [ ] Test FormationSyncService cascade updates
- [ ] Test PersonnelLibraryService CRUD operations

### 7.2 Integration tests

- [ ] Test play creation with library inheritance
- [ ] Test formation update cascading to plays
- [ ] Test "Analyze Plays" backfill feature
- [ ] Test opposite formation linking

### 7.3 Manual testing

- [ ] Create formation in library
- [ ] Create play using library formation
- [ ] Update formation metadata
- [ ] Verify play auto-updates
- [ ] Test personnel library flow

**Files to create**:

- `src/services/formationLibrary/__tests__/FormationLibraryService.test.ts`
- `src/services/formationLibrary/__tests__/FormationIntelligenceService.test.ts`
- `src/services/personnelLibrary/__tests__/PersonnelLibraryService.test.ts`

---

## ✅ Phase 8: Performance & Polish (30 min)

### 8.1 Optimization

- [ ] Add React.memo to library components
- [ ] Implement virtualized lists for large libraries (react-window)
- [ ] Add loading skeletons for library pages
- [ ] Optimize Supabase queries (indexes, batch fetching)

### 8.2 UX enhancements

- [ ] Add toast notifications for sync operations
- [ ] Add confirmation modals for destructive actions
- [ ] Add "Unsaved changes" warnings
- [ ] Add keyboard shortcuts (Cmd+S to save)

### 8.3 Error handling

- [ ] Add error boundaries around library pages
- [ ] Add fallback UI for failed loads
- [ ] Add retry mechanisms for sync failures

---

## 📊 Success Metrics

- [ ] **Performance**: Library page loads < 500ms
- [ ] **Sync Speed**: Formation update cascades to plays < 200ms
- [ ] **Accuracy**: Intelligence service 95%+ agreement on metadata
- [ ] **Bundle Size**: New code adds < 150KB gzipped
- [ ] **Type Safety**: Zero TypeScript errors, 100% type coverage
- [ ] **File Size**: No file > 350 lines (modular architecture)

---

## 🚀 Deployment Checklist

- [ ] Run `npm run validate` (type-check + lint + tests)
- [ ] Apply database migration via `npm run db:migrate:easy`
- [ ] Test on staging environment
- [ ] Create backup of plays table before sync
- [ ] Deploy to production
- [ ] Monitor Sentry for errors
- [ ] Verify formation/personnel libraries populate correctly

---

## 📝 Notes & Decisions

### Architecture Decisions

1. **Modular Services**: Split into 5 focused services (200-250 lines each) vs 1 monolithic service
2. **Bidirectional Sync**: Support both library→plays and plays→library workflows
3. **Smart Intelligence**: Auto-analyze existing plays to bootstrap library
4. **Optimistic UI**: Use optimistic updates for library operations (Facebook-fast pattern)

### File Organization

```
src/
├── services/
│   ├── formationLibrary/
│   │   ├── FormationLibraryService.ts      (200 lines - CRUD)
│   │   ├── FormationIntelligenceService.ts (250 lines - Analysis)
│   │   └── FormationSyncService.ts         (200 lines - Sync)
│   └── personnelLibrary/
│       ├── PersonnelLibraryService.ts      (200 lines - CRUD)
│       └── PersonnelSyncService.ts         (150 lines - Sync)
├── components/
│   ├── formation-library/
│   │   ├── FormationLibraryGrid.tsx        (150 lines)
│   │   ├── FormationCard.tsx               (200 lines)
│   │   ├── FormationEditorModal.tsx        (300 lines)
│   │   └── FormationIntelligencePanel.tsx  (250 lines)
│   └── personnel-library/
│       ├── PersonnelLibraryGrid.tsx        (150 lines)
│       ├── PersonnelCard.tsx               (200 lines)
│       └── PersonnelEditorModal.tsx        (300 lines)
└── pages/
    ├── FormationLibraryPage.tsx            (300 lines)
    └── PersonnelLibraryPage.tsx            (250 lines)
```

### Key Features

- **Zero Manual Work**: "Analyze Plays" button bootstraps library from existing data
- **Always Accurate**: Library is source of truth, plays inherit automatically
- **Self-Updating**: New plays contribute to formation profiles
- **Confidence Scoring**: Show agreement percentage (e.g., "11/12 plays agree")
- **Pattern Matching**: Auto-detect opposites (Rip↔Liz, Left↔Right, Larry↔Ringo)

---

**Next Step**: Start with Phase 1 (Database Schema Enhancement)
