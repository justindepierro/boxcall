# Phase 3B Step 2: PlayGrid.tsx Refactoring Plan

## Current State
- **File**: `src/components/playbook/PlayGrid.tsx`
- **Lines**: 1,121 lines
- **Target**: ~500-550 lines (50-55% reduction)
- **Strategy**: Apply proven methodology from PlayerControls refactor

## File Analysis

### Major Sections Identified:
1. **Imports & Types** (lines 1-100)
2. **Component Setup & Hooks** (lines 100-240)
   - View mode preferences (4 hooks)
   - State management (favorites, expanded play, reordering)
   - Data fetching (useTeamsData)
3. **Event Handlers** (lines 240-400)
   - `handlePlaySave` (inline save handler ~80 lines)
   - `handlePlaySelect` (selection handler)
   - `handleToggleExpand` (expansion handler)
   - `handleSelectAll` (bulk selection)
   - `handleDragEnd` (drag & drop)
4. **Computed Values & Filtering** (lines 400-600)
   - `filteredPlays` (complex filtering logic)
   - `displayPlays` (reordering logic)
   - `visiblePlays` (mobile pagination)
   - `collectedSuggestions` (suggestion aggregation)
5. **Render Logic** (lines 600-1100)
   - Loading/error/empty states
   - Results header with view toggle
   - Bulk operations toolbar
   - List/grid rendering (virtualized & non-virtualized)
   - "Show More" button for mobile
6. **Memo Wrapper** (lines 1100-1122)

## Extraction Strategy

### Phase 1: Extract Custom Hooks (Target: 300+ lines)

**Hook 1: `useViewMode.ts`** (~50 lines)
- View mode state (list/grid)
- Manual override state
- Media query logic
- View mode persistence

**Hook 2: `usePlayPreferences.ts`** (~40 lines)
- `showOneWordCalls` preference
- `directionDisplayFormat` preference
- Any other UI preferences

**Hook 3: `usePlayData.ts`** (~80 lines)
- `useTeamsData` integration
- Data conversion (mapDatabasePlayToFullPlay)
- Refresh logic
- Play count notifications
- Database validation (dev mode)

**Hook 4: `usePlayFiltering.ts`** (~100 lines)
- `filteredPlays` computation
- Search query filtering
- Category/subcategory filtering
- Filter signature generation
- Has filters detection

**Hook 5: `usePlayDisplay.ts`** (~60 lines)
- Display plays with reordering
- Visible plays (mobile pagination)
- Show more/less logic
- Virtualization threshold logic

**Hook 6: `usePlaySelection.ts`** (~40 lines)
- Selected play IDs state
- Handle play select
- Handle select all
- Selection change callbacks

**Hook 7: `usePlayExpansion.ts`** (~30 lines)
- Expanded play ID state
- Handle toggle expand
- Expansion logging

### Phase 2: Extract Handler Functions (Target: 200+ lines)

**Handler 1: `playHandlers.ts`**
- `handlePlaySave` (~80 lines) - Complex inline save logic
- Database updates mapping
- Telemetry events
- Save state management

**Handler 2: `dragDropHandlers.ts`**
- `handleDragEnd` (~50 lines)
- Play reordering logic
- Display list updates

**Handler 3: `renderHelpers.ts`**
- `renderPlayItem` callback (~40 lines)
- PlayCardWrapper configuration
- Dependency management

### Phase 3: Extract Utility Functions (Target: 100+ lines)

**Utility 1: `suggestionUtils.ts`**
- `collectedSuggestions` logic (~50 lines)
- Formation/play name/type aggregation
- Personnel suggestions

**Utility 2: `playDataUtils.ts`**
- `mapDatabasePlayToFullPlay` (~20 lines)
- Data conversion logic

### Phase 4: Extract UI Components (Target: 200+ lines)

**Component 1: `PlayGridHeader.tsx`** (~80 lines)
- Results header
- View mode toggle
- Play count display

**Component 2: `PlayGridBulkToolbar.tsx`** (~60 lines)
- Bulk operations toolbar
- Select all checkbox
- Bulk action buttons

**Component 3: `PlayGridContent.tsx`** (~100 lines)
- List/grid rendering logic
- Virtualized & non-virtualized rendering
- DragDropContext wrapper

**Component 4: `PlayGridMobileFooter.tsx`** (~40 lines)
- "Show More" button
- Mobile pagination logic

## Execution Plan

### Step 1: Create Directory Structure ✅
```
src/components/playbook/
├── PlayGrid/
│   ├── hooks/
│   │   ├── useViewMode.ts
│   │   ├── usePlayPreferences.ts
│   │   ├── usePlayData.ts
│   │   ├── usePlayFiltering.ts
│   │   ├── usePlayDisplay.ts
│   │   ├── usePlaySelection.ts
│   │   └── usePlayExpansion.ts
│   ├── handlers/
│   │   ├── playHandlers.ts
│   │   ├── dragDropHandlers.ts
│   │   └── renderHelpers.ts
│   ├── utils/
│   │   ├── suggestionUtils.ts
│   │   └── playDataUtils.ts
│   ├── components/
│   │   ├── PlayGridHeader.tsx
│   │   ├── PlayGridBulkToolbar.tsx
│   │   ├── PlayGridContent.tsx
│   │   └── PlayGridMobileFooter.tsx
│   └── types.ts (shared types)
```

### Step 2: Extract Hooks (First Pass)
- Extract all 7 custom hooks
- Test each hook independently
- Commit after each hook or group of 2-3 hooks

### Step 3: Extract Handlers (Second Pass)
- Extract handler functions
- Wire up to hooks
- Test integration
- Commit

### Step 4: Extract Utilities (Third Pass)
- Extract utility functions
- Test data transformations
- Commit

### Step 5: Extract Components (Fourth Pass)
- Extract UI components
- Wire up all props
- Test rendering
- Commit

### Step 6: Integrate & Cleanup (Final Pass)
- Update imports in main file
- Replace inline code with hook/handler calls
- Delete extracted code
- Clean up unused imports
- Final test & commit

## Success Metrics
- **Target**: 1,121 → 500-550 lines (50-55% reduction)
- **Zero TypeScript errors**
- **Zero ESLint errors**
- **All features working**
- **No breaking changes**

## Timeline Estimate
- Step 1: Directory structure (5 min)
- Step 2: Extract hooks (60-90 min)
- Step 3: Extract handlers (30-45 min)
- Step 4: Extract utilities (15-20 min)
- Step 5: Extract components (60-90 min)
- Step 6: Integration & cleanup (30-45 min)
- **Total**: 3-4 hours

## Notes
- PlayGrid is more complex than PlayerControls due to:
  - More hooks (7 vs 5)
  - More complex data flow (database integration)
  - Virtualization logic
  - Drag & drop
  - Mobile vs desktop rendering
  - Bulk operations
- Use same proven methodology: extract first, integrate second
- Commit frequently (every 100-200 lines)
- Verify with type-check after each extraction
