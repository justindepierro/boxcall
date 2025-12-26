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

- ✅ Only list view renders
- ✅ No grid-related code remains
- ✅ All play display works identically

**Status: COMPLETE** (Dec 19, 2025) - Removed ~800 lines of dead grid code

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

- ✅ `src/hooks/usePlaybookData.ts` (new)

### Files to Modify

- ✅ `src/pages/PlaybookPage.tsx`
- ✅ `src/components/playbook/PlayGrid.tsx` (uses usePlaybookData)
- ✅ `src/hooks/usePlaybookStats.ts` (receives DB counts)

### Success Criteria

- ✅ Single `usePlaybookData` call per page
- ✅ Stats count === header count === actual plays
- ✅ No duplicate data fetching

**Status: COMPLETE** (Dec 25, 2025)

- Created usePlaybookData hook with accurate DB counts
- Fixed critical bug: `arePlayGridPropsEqual` wasn't checking `playbookId`
- This caused PlayGrid to not re-render when playbook ID changed from empty to valid

---

## Phase 3: Unified Filtering (Day 4-5)

### Why Third?

- Now that data is unified, simplify filtering
- Single filter state, single filter function

### Tasks

- [x] **3.1** Consolidate filter state in PlaybookContext

  ```typescript
  interface PlaybookFilters {
    search: string;
    playType: string | null; // Pass, Run, RPO, PA
    personnel: string | null; // 11, 12, 21, 22
    situation: string | null; // Red Zone, Goal Line, etc.
    tags: string[];
    // Advanced filters as simple key-value
  }
  ```

- [x] **3.2** Create `useFilteredPlays` hook

  ```typescript
  function useFilteredPlays(plays: Play[], filters: PlaybookFilters) {
    return useMemo(() => {
      return plays.filter((play) => matchesFilters(play, filters));
    }, [plays, filters]);
  }
  ```

- [x] **3.3** ~~Remove `usePlayFiltering` complexity~~ Kept as legacy, PlayGrid uses new hook
- [x] **3.4** Update `QuickFilterPresets` to set filter state directly (via `presetToFilters`)
- [ ] **3.5** Remove category/subcategory system (use filters instead) - DEFERRED for Phase 5

### Files Created

- ✅ `src/types/filters.ts` - Unified PlaybookFilters interface + conversion utilities
- ✅ `src/hooks/useFilteredPlays.ts` - Clean filtering hook with elite detection

### Files Modified

- ✅ `src/contexts/PlaybookContext.tsx` - Added `filters` state + SET_FILTERS action
- ✅ `src/components/playbook/filterPresets.ts` - Added `presetToFilters()` function
- ✅ `src/components/playbook/PlayGrid.tsx` - Now uses `useFilteredPlays` with legacy prop conversion

### Success Criteria

- ✅ Single `filters` object in context (`state.filters`)
- ✅ Quick filters can modify `filters` state (via `presetToFilters`)
- ✅ `filteredPlays` derived from single filter function (`useFilteredPlays`)
- ✅ Backward compatible - legacy props still work during migration

**Status: COMPLETE** (Dec 25, 2025)

- Created unified `PlaybookFilters` interface in `src/types/filters.ts`
- New `useFilteredPlays` hook replaces complex `usePlayFiltering` in PlayGrid
- Legacy `advancedFilters`/`selectedCategory` props auto-convert via `filtersFromLegacy()`
- Context now has unified `filters` state synced with legacy state

---

## Phase 4: Stats from Filtered Data (Day 6)

### Why Fourth?

- Stats should reflect what user sees
- No more DB count vs display count mismatch

### Tasks

- [x] **4.1** Remove DB count queries from PlaybookPage
- [x] **4.2** Update `usePlaybookStats` to calculate from `filteredPlays`

  ```typescript
  function usePlaybookStats(filteredPlays: Play[]) {
    return useMemo(
      () => ({
        totalPlays: filteredPlays.length,
        passCount: filteredPlays.filter((p) => p.p_type === "Pass").length,
        runCount: filteredPlays.filter((p) => p.p_type === "Run").length,
        // etc.
      }),
      [filteredPlays]
    );
  }
  ```

- [x] **4.3** Stats update instantly when filters change
- [x] **4.4** Remove `totalPlaysOverride` and `playTypeCountsOverride` params

### Files Modified

- ✅ `src/hooks/usePlaybookStats.ts` - Removed override params, calculates from passed plays
- ✅ `src/pages/PlaybookPage.tsx` - Uses `useFilteredPlays` to get filtered plays for stats

### Success Criteria

- ✅ Stats always match displayed play count
- ✅ Filter "Pass" → stats show only Pass plays
- ✅ No stale/mismatched counts

**Status: COMPLETE** (Dec 25, 2025)

- Simplified `usePlaybookStats` - no more override params
- PlaybookPage uses `useFilteredPlays` with context filters, passes filtered plays to stats
- Stats now always reflect what user sees!

---

## Phase 5: Cleanup & Polish (Day 7)

### Tasks

- [x] **5.1** Remove dead code from previous phases
- [x] **5.2** Update all imports/references
- [x] **5.3** Run full test suite
- [ ] **5.4** Performance audit (should be faster with less data fetching) - OPTIONAL
- [x] **5.5** Update documentation

### Files Deleted

- ✅ `src/components/playbook/PlayGrid/hooks/usePlayFiltering.ts` - Replaced by `useFilteredPlays`

### Files Modified

- ✅ `src/components/playbook/PlayGrid/hooks/index.ts` - Removed usePlayFiltering export

### Legacy State Note

The following legacy state properties are kept for backward compatibility:

- `state.searchQuery`, `state.selectedCategory`, `state.selectedSubcategory`, `state.advancedFilters`

These are synced with `state.filters` automatically. New code should use `state.filters` directly.
Full migration to `state.filters` only is planned for a future PR.

**Status: COMPLETE** (Dec 25, 2025)

---

## Quick Wins (Can Do Immediately)

1. ✅ **Remove grid view toggle** - DONE (Phase 1)
2. **Rename PlayGrid → PlayList** - Optional, semantic clarity
3. ✅ **Delete view mode persistence** - DONE (Phase 1)

---

## Risk Mitigation

| Risk                            | Mitigation                       |
| ------------------------------- | -------------------------------- |
| Breaking existing filters       | ✅ Keep filter preset IDs stable |
| Data fetch race conditions      | ✅ Single hook eliminates races  |
| Stats mismatch during migration | ✅ Phase 4 complete              |
| Mobile view breakage            | ✅ Tested in Phase 1             |

---

## Definition of Done

- [x] Single data fetch per playbook view
- [x] `displayedPlays.length` === `stats.totalPlays` always
- [x] Quick filters update single `filters` state (via SET_FILTERS action)
- [x] List view only (no grid toggle)
- [x] No "107 vs 81" type mismatches possible
- [ ] < 500 lines in PlayList component (PlayGrid is ~450 lines, close!)

---

## Timeline Estimate

| Phase                        | Effort    | Risk   | Status  |
| ---------------------------- | --------- | ------ | ------- |
| Phase 1: Remove Grid         | 2-3 hours | Low    | ✅ DONE |
| Phase 2: Single Data Source  | 4-6 hours | Medium | ✅ DONE |
| Phase 3: Unified Filtering   | 3-4 hours | Medium | ✅ DONE |
| Phase 4: Stats from Filtered | 2-3 hours | Low    | ✅ DONE |
| Phase 5: Cleanup & Polish    | 1-2 hours | Low    | ✅ DONE |

---

## Final Architecture (Dec 25, 2025)

```
PlaybookPage
  │
  ├── usePlaybookData(activePlaybookId)     ← SINGLE data source
  │     └── plays, totalCount, loading, loadMore
  │
  ├── useFilteredPlays(plays, filters, favoriteIds)  ← UNIFIED filtering
  │     └── filteredPlays, hasFilters
  │
  ├── usePlaybookStats(filteredPlays, ...)  ← Stats from FILTERED plays
  │     └── Always matches display count!
  │
  └── PlayGrid (list view only)
        └── useFilteredPlays internally
        └── Displays filteredPlays

PlaybookContext
  │
  ├── state.filters (PlaybookFilters)       ← NEW: Unified filter object
  │     └── search, playType, personnel, situation, fieldPosition, ...
  │
  ├── state.searchQuery, advancedFilters    ← LEGACY: Auto-synced for compat
  │
  └── SET_FILTERS action                    ← Updates filters + legacy state
```

### Key Benefits

1. **No more count mismatches** - Stats calculate from same filtered array
2. **Single filtering logic** - `useFilteredPlays` replaces scattered filtering
3. **Clean filter state** - `PlaybookFilters` interface is flat and simple
4. **Backward compatible** - Legacy state auto-synced during migration
   | Phase 3: Unified Filtering | 4-6 hours | Medium |
   | Phase 4: Stats from Filtered | 2-3 hours | Low |
   | Phase 5: Cleanup | 2-3 hours | Low |

**Total: ~2-3 days of focused work**

---

## Start Here

Ready to begin? Start with Phase 1 - removing the grid view is the safest first step with immediate complexity reduction.
