# Playbook Data Unification Roadmap

> **Goal**: Single source of truth for playbook data, filtering, and stats

## Current Problems

### 1. Multiple Data Sources (The Core Issue)
```
PlaybookPage
  └── useTeamsData() ← fetches ALL plays (107)
      └── passes to usePlaybookStats() ← calculates from partial data
      
PlayGrid  
  └── useTeamsData({ playbookId }) ← fetches SCOPED plays (81)
      └── scopedPlays filter ← redundant client-side filter
      └── usePlayFiltering() ← applies advancedFilters
      └── displayPlays ← what user sees
```

**Result**: Stats show 81, header shows 107, filters break.

### 2. Redundant View Modes
- Grid view adds complexity, rarely used
- List view (shown) is preferred by coaches
- Two rendering paths to maintain

### 3. Scattered Filter Logic
- `advancedFilters` in PlaybookContext
- `selectedCategory` / `selectedSubcategory` in PlaybookContext  
- `searchQuery` in PlaybookContext
- `filterPresets` mapping to advancedFilters
- Client-side filtering in `usePlayFiltering`

---

## Target Architecture

```
PlaybookPage
  └── usePlaybookData(activePlaybookId) ← SINGLE data hook
      ├── plays: Play[]           ← scoped to playbook
      ├── totalCount: number      ← from database
      ├── playTypeCounts: {...}   ← from database  
      ├── formations: Formation[]
      ├── loading, error, refresh
      └── loadMore()              ← pagination
      
  └── PlaybookContext
      ├── filters (single object)
      ├── searchQuery
      └── sorting
      
  └── useFilteredPlays(plays, filters, searchQuery)
      └── filteredPlays ← what gets displayed AND counted
      
  └── PlayList (single view component)
      └── renders filteredPlays
```

**Key Principle**: `filteredPlays.length` === displayed count === stats count

---

## Phase 1: Remove Grid View (Day 1)

### Why First?
- Simplest change with biggest complexity reduction
- No data flow changes, just UI removal
- Immediate code deletion

### Tasks

- [ ] **1.1** Remove `viewMode` state from `useViewMode` hook
- [ ] **1.2** Remove grid/list toggle from `PlayGridHeader`
- [ ] **1.3** Delete `PlayCardWrapper` grid variant rendering
- [ ] **1.4** Remove `VirtuosoGrid` usage in `PlayGrid`
- [ ] **1.5** Rename `PlayGrid` → `PlayList` (semantic clarity)
- [ ] **1.6** Delete unused grid-related CSS/styles
- [ ] **1.7** Update any tests referencing grid view

### Files to Modify
- `src/components/playbook/PlayGrid.tsx` → rename to `PlayList.tsx`
- `src/components/playbook/PlayGrid/components/PlayGridHeader.tsx`
- `src/hooks/useViewMode.ts` → simplify or delete
- `src/components/playbook/play-card/PlayCardWrapper.tsx`

### Success Criteria
- Only list view renders
- No grid-related code remains
- All play display works identically

---

## Phase 2: Single Data Source (Day 2-3)

### Why Second?
- Fixes the 107 vs 81 mismatch
- Establishes foundation for unified stats

### Tasks

- [ ] **2.1** Create `usePlaybookData` hook (new consolidated hook)
  ```typescript
  function usePlaybookData(playbookId: string | null) {
    // Single source: fetches plays scoped to playbookId
    // Returns plays, counts, loading state, pagination
  }
  ```

- [ ] **2.2** Remove `useTeamsData` call from `PlaybookPage`
- [ ] **2.3** Move `useTeamsData` call to `usePlaybookData` 
- [ ] **2.4** Pass `plays` from `usePlaybookData` down to `PlayList`
- [ ] **2.5** Remove redundant `scopedPlays` filter in `PlayList`
- [ ] **2.6** Stats hook uses same `plays` array

### New Data Flow
```
PlaybookPage
  └── usePlaybookData(activePlaybookId)
      ├── plays (already scoped)
      ├── totalCount, playTypeCounts (from DB)
      └── loading, loadMore
      
  └── passes plays to:
      ├── PlayList (display)
      ├── usePlaybookStats (stats calculation)
      └── useFilteredPlays (filtering)
```

### Files to Create
- `src/hooks/usePlaybookData.ts` (new)

### Files to Modify  
- `src/pages/PlaybookPage.tsx`
- `src/components/playbook/PlayList.tsx` (renamed from PlayGrid)
- `src/hooks/usePlaybookStats.ts`

### Success Criteria
- Single `usePlaybookData` call per page
- Stats count === header count === actual plays
- No duplicate data fetching

---

## Phase 3: Unified Filtering (Day 4-5)

### Why Third?
- Now that data is unified, simplify filtering
- Single filter state, single filter function

### Tasks

- [ ] **3.1** Consolidate filter state in PlaybookContext
  ```typescript
  interface PlaybookFilters {
    search: string;
    playType: string | null;      // Pass, Run, RPO, PA
    personnel: string | null;     // 11, 12, 21, 22
    situation: string | null;     // Red Zone, Goal Line, etc.
    tags: string[];
    // Advanced filters as simple key-value
  }
  ```

- [ ] **3.2** Create `useFilteredPlays` hook
  ```typescript
  function useFilteredPlays(plays: Play[], filters: PlaybookFilters) {
    return useMemo(() => {
      return plays.filter(play => matchesFilters(play, filters));
    }, [plays, filters]);
  }
  ```

- [ ] **3.3** Remove `usePlayFiltering` complexity
- [ ] **3.4** Update `QuickFilterPresets` to set filter state directly
- [ ] **3.5** Remove category/subcategory system (use filters instead)

### Files to Modify
- `src/contexts/PlaybookContext.tsx`
- `src/components/playbook/filterPresets.ts`
- `src/components/playbook/QuickFilterPresets.tsx`
- `src/components/playbook/PlayGrid/hooks/usePlayFiltering.ts` → delete or simplify

### Success Criteria
- Single `filters` object in context
- Quick filters directly modify `filters` state
- `filteredPlays` derived from single filter function

---

## Phase 4: Stats from Filtered Data (Day 6)

### Why Fourth?
- Stats should reflect what user sees
- No more DB count vs display count mismatch

### Tasks

- [ ] **4.1** Remove DB count queries from PlaybookPage
- [ ] **4.2** Update `usePlaybookStats` to calculate from `filteredPlays`
  ```typescript
  function usePlaybookStats(filteredPlays: Play[]) {
    return useMemo(() => ({
      totalPlays: filteredPlays.length,
      passCount: filteredPlays.filter(p => p.p_type === 'Pass').length,
      runCount: filteredPlays.filter(p => p.p_type === 'Run').length,
      // etc.
    }), [filteredPlays]);
  }
  ```

- [ ] **4.3** Stats update instantly when filters change
- [ ] **4.4** Remove `totalPlaysOverride` and `playTypeCountsOverride` params

### Files to Modify
- `src/hooks/usePlaybookStats.ts`
- `src/pages/PlaybookPage.tsx`
- `src/components/playbook/PlaybookStatsDashboard.tsx`

### Success Criteria
- Stats always match displayed play count
- Filter "Pass" → stats show only Pass plays
- No stale/mismatched counts

---

## Phase 5: Cleanup & Polish (Day 7)

### Tasks

- [ ] **5.1** Remove dead code from previous phases
- [ ] **5.2** Update all imports/references
- [ ] **5.3** Run full test suite
- [ ] **5.4** Performance audit (should be faster with less data fetching)
- [ ] **5.5** Update documentation

### Files to Delete
- `src/components/playbook/PlayGrid/hooks/usePlayFiltering.ts` (if fully replaced)
- Grid-related utilities
- Unused filter preset complexity

---

## Quick Wins (Can Do Immediately)

1. **Remove grid view toggle** - 15 min, no risk
2. **Rename PlayGrid → PlayList** - 10 min, semantic clarity
3. **Delete view mode persistence** - 5 min, simplification

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing filters | Keep filter preset IDs stable |
| Data fetch race conditions | Single hook eliminates races |
| Stats mismatch during migration | Phase 4 comes after data unification |
| Mobile view breakage | Test after Phase 1 (view removal) |

---

## Definition of Done

- [ ] Single data fetch per playbook view
- [ ] `displayedPlays.length` === `stats.totalPlays` always
- [ ] Quick filters update single `filters` state
- [ ] List view only (no grid toggle)
- [ ] No "107 vs 81" type mismatches possible
- [ ] < 500 lines in PlayList component

---

## Timeline Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 1: Remove Grid | 2-3 hours | Low |
| Phase 2: Single Data Source | 4-6 hours | Medium |
| Phase 3: Unified Filtering | 4-6 hours | Medium |
| Phase 4: Stats from Filtered | 2-3 hours | Low |
| Phase 5: Cleanup | 2-3 hours | Low |

**Total: ~2-3 days of focused work**

---

## Start Here

Ready to begin? Start with Phase 1 - removing the grid view is the safest first step with immediate complexity reduction.
