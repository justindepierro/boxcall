# Week 3: Performance Optimization - Detailed Plan

**Status:** 📋 Ready to Start  
**Estimated Time:** 10 hours  
**Priority:** 🔴 Critical  
**Dependencies:** Week 1 ✅ Complete, Week 2 ✅ Complete

---

## 🎯 Week 3 Goals

Transform the roster page from "fast enough" to "blazing fast" with measurable performance improvements:

- ✅ 66% faster filtering (300ms → <100ms)
- ✅ 70-90% fewer component re-renders
- ✅ Support for 500+ players without lag
- ✅ 30% memory reduction (15MB → <10MB)

---

## Task Breakdown

### Task 3.1: Search Debouncing (2 hours)

**Priority:** 🔴 Critical  
**Impact:** Prevents expensive filtering on every keystroke  
**Expected Improvement:** ~80% reduction in filter computations

#### Step-by-Step Implementation

**Step 1: Create Reusable Debounce Hook** (30 min)

Create `src/hooks/useDebouncedValue.ts`:

```typescript
import { useState, useEffect } from "react";

/**
 * Debounces a value by delaying updates until after a specified delay.
 * Useful for expensive operations like filtering or API calls.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * const searchTerm = 'john';
 * const debouncedSearch = useDebouncedValue(searchTerm, 300);
 * // debouncedSearch updates 300ms after searchTerm stops changing
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timer to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
```

**Step 2: Update useRosterFilters Hook** (1 hour)

Modify `src/pages/RosterPage/hooks/useRosterFilters.ts`:

```typescript
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type { RosterPlayerView } from "../../../services/rosterService";

export const useRosterFilters = (
  players: RosterPlayerView[]
): UseRosterFiltersReturn => {
  // Keep immediate state for input responsiveness
  const [searchInput, setSearchInput] = useState("");

  // Debounced value for actual filtering (300ms delay)
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // ... other state (positionFilters, gradeLevelFilters, statusFilter)

  // Read from URL on mount (use searchInput for immediate update)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || "";
    if (urlSearch) setSearchInput(urlSearch);
    // ... rest of URL reading
  }, []);

  // Write to URL (use searchInput for immediate URL update)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    // ... rest of URL writing
  }, [
    searchInput,
    positionFilters,
    gradeLevelFilters,
    statusFilter,
    navigate,
    location.search,
  ]);

  // Use debouncedSearch in filteredPlayers calculation
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Use debouncedSearch instead of searchInput
      const matchesSearch =
        !debouncedSearch ||
        `${player.first_name} ${player.last_name}`
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        player.position
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        player.jersey_number?.toString().includes(debouncedSearch);

      // ... rest of filter logic (positions, grades, status)

      return (
        matchesSearch && matchesPosition && matchesGradeLevel && matchesStatus
      );
    });
  }, [
    players,
    debouncedSearch,
    positionFilters,
    gradeLevelFilters,
    statusFilter,
  ]);

  return {
    searchTerm: searchInput, // Return immediate value for controlled input
    setSearchTerm: setSearchInput, // Set immediate value
    filteredPlayers, // Uses debounced value
    // ... rest of exports
  };
};
```

**Step 3: Unit Testing** (30 min)

Create `src/hooks/useDebouncedValue.test.ts`:

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("test", 300));
    expect(result.current).toBe("test");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "initial" } }
    );

    expect(result.current).toBe("initial");

    // Update value
    rerender({ value: "updated" });
    expect(result.current).toBe("initial"); // Still initial immediately

    // Fast forward 200ms - should still be initial
    jest.advanceTimersByTime(200);
    expect(result.current).toBe("initial");

    // Fast forward another 100ms (total 300ms) - should update
    jest.advanceTimersByTime(100);
    expect(result.current).toBe("updated");
  });

  it("cancels previous timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "1" } }
    );

    rerender({ value: "2" });
    jest.advanceTimersByTime(100);

    rerender({ value: "3" });
    jest.advanceTimersByTime(100);

    rerender({ value: "4" });
    jest.advanceTimersByTime(100);

    // Should still be initial - timer kept resetting
    expect(result.current).toBe("1");

    // Wait full 300ms from last change
    jest.advanceTimersByTime(200);
    expect(result.current).toBe("4"); // Only final value
  });
});
```

**Validation:**

- [ ] Input field responds instantly (no perceived lag)
- [ ] Filtering waits 300ms after typing stops
- [ ] Console logs show ~80% fewer filter operations
- [ ] All tests pass

---

### Task 3.2: Optimize Stat Calculations (1 hour)

**Priority:** 🟡 High  
**Impact:** Prevents unnecessary recalculations  
**Expected Improvement:** 90% fewer stat recalculations

#### Implementation Plan

**Step 1: Create useRosterStats Hook** (30 min)

Create `src/pages/RosterPage/hooks/useRosterStats.ts`:

```typescript
import { useMemo } from "react";
import type { RosterPlayerView } from "../../../services/rosterService";

export interface RosterStats {
  total: number;
  active: number;
  inactive: number;
  filtered: number;
  selected: number;
}

/**
 * Calculates roster statistics with memoization.
 * Only recalculates when player counts actually change, not on every render.
 *
 * @param players - Full player list
 * @param filteredPlayers - Filtered player list
 * @param selectedPlayerIds - Set of selected player IDs
 * @returns Memoized stats object
 */
export const useRosterStats = (
  players: RosterPlayerView[],
  filteredPlayers: RosterPlayerView[],
  selectedPlayerIds: Set<string>
): RosterStats => {
  // Calculate active count separately for dependency tracking
  const activeCount = useMemo(() => {
    return players.filter((p) => p.is_active === true).length;
  }, [players]);

  // Memoize all stats together
  return useMemo(() => {
    return {
      total: players.length,
      active: activeCount,
      inactive: players.length - activeCount,
      filtered: filteredPlayers.length,
      selected: selectedPlayerIds.size,
    };
  }, [
    players.length,
    activeCount,
    filteredPlayers.length,
    selectedPlayerIds.size,
  ]);
};

export default useRosterStats;
```

**Step 2: Update Barrel Export** (5 min)

Update `src/pages/RosterPage/hooks/index.ts`:

```typescript
export { useRosterData } from "./useRosterData";
export { useRosterFilters } from "./useRosterFilters";
export { useRosterSelection } from "./useRosterSelection";
export { useRosterStats } from "./useRosterStats";

export type { UseRosterDataReturn } from "./useRosterData";
export type { UseRosterFiltersReturn } from "./useRosterFilters";
export type { UseRosterSelectionReturn } from "./useRosterSelection";
export type { RosterStats } from "./useRosterStats";
```

**Step 3: Integrate into RosterPage** (15 min)

Update `src/pages/RosterPage.tsx`:

```typescript
import {
  useRosterData,
  useRosterFilters,
  useRosterSelection,
  useRosterStats, // Add this
} from './RosterPage/hooks';

// In component:
const { players, setPlayers: _setPlayers, loading, teamId, loadRoster } = useRosterData();
const {
  filteredPlayers,
  // ... rest
} = useRosterFilters(players);
const {
  selectedPlayerIds,
  // ... rest
} = useRosterSelection();

// Add stats hook
const stats = useRosterStats(players, filteredPlayers, selectedPlayerIds);

// Update RosterStats component usage:
<RosterStats
  totalPlayers={stats.total}
  activePlayerCount={stats.active}
  filteredCount={stats.filtered}
  selectedCount={stats.selected}
/>
```

**Step 4: Unit Testing** (10 min)

Create `src/pages/RosterPage/hooks/useRosterStats.test.ts`:

```typescript
import { renderHook } from "@testing-library/react";
import { useRosterStats } from "./useRosterStats";

describe("useRosterStats", () => {
  const mockPlayers = [
    { id: "1", is_active: true, first_name: "John", last_name: "Doe" },
    { id: "2", is_active: true, first_name: "Jane", last_name: "Smith" },
    { id: "3", is_active: false, first_name: "Bob", last_name: "Johnson" },
  ];

  it("calculates all stats correctly", () => {
    const filtered = mockPlayers.slice(0, 2);
    const selected = new Set(["1"]);

    const { result } = renderHook(() =>
      useRosterStats(mockPlayers, filtered, selected)
    );

    expect(result.current).toEqual({
      total: 3,
      active: 2,
      inactive: 1,
      filtered: 2,
      selected: 1,
    });
  });

  it("updates when player list changes", () => {
    const filtered = mockPlayers.slice(0, 2);
    const selected = new Set(["1"]);

    const { result, rerender } = renderHook(
      ({ players }) => useRosterStats(players, filtered, selected),
      { initialProps: { players: mockPlayers } }
    );

    expect(result.current.total).toBe(3);

    // Add a player
    const newPlayers = [
      ...mockPlayers,
      { id: "4", is_active: true, first_name: "Alice", last_name: "Williams" },
    ];
    rerender({ players: newPlayers });

    expect(result.current.total).toBe(4);
    expect(result.current.active).toBe(3);
  });
});
```

**Validation:**

- [ ] Stats only recalculate when counts change
- [ ] React DevTools Profiler shows < 5 RosterStats renders during filtering
- [ ] All tests pass
- [ ] 0 TypeScript errors

---

### Task 3.3: Add Pagination (4 hours)

**Priority:** 🟡 High  
**Impact:** Support for 500+ players, faster rendering  
**Expected Improvement:** ~90% faster initial render with large datasets

#### Implementation Plan

**Step 1: Create usePagination Hook** (1.5 hours)

Create `src/hooks/usePagination.ts`:

```typescript
import { useState, useMemo, useCallback, useEffect } from "react";

export interface UsePaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  setItemsPerPage: (count: number) => void;
  itemsPerPage: number;
}

/**
 * Reusable pagination hook for any array of items.
 * Automatically resets to page 1 when items change (e.g., after filtering).
 *
 * @param items - Array of items to paginate
 * @param options - Configuration options
 * @returns Pagination state and controls
 *
 * @example
 * const { paginatedItems, currentPage, totalPages, nextPage, prevPage } =
 *   usePagination(players, { itemsPerPage: 25 });
 */
export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { itemsPerPage: initialItemsPerPage = 25, initialPage = 1 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Reset to page 1 when items change (e.g., after filtering)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  // Calculate paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Calculate display info
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  const startIndex =
    items.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, items.length);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    setItemsPerPage,
    itemsPerPage,
  };
}

export default usePagination;
```

**Step 2: Create Pagination Component** (1 hour)

Create `src/components/ui/Pagination/Pagination.tsx`:

```typescript
import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon/Icon';
import { Typography } from '../../design-system';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  startIndex?: number;
  endIndex?: number;
  totalItems?: number;
  showInfo?: boolean;
  className?: string;
}

/**
 * Pagination component with page numbers, next/prev buttons, and item count.
 * Shows ellipsis for large page counts (e.g., 1 ... 5 6 7 ... 20).
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onNext,
  onPrev,
  hasNext = currentPage < totalPages,
  hasPrev = currentPage > 1,
  startIndex,
  endIndex,
  totalItems,
  showInfo = true,
  className = '',
}) => {
  // Generate page numbers to show (with ellipsis for large ranges)
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show: 1 ... 4 5 6 ... 10
      pages.push(1);

      // Add left ellipsis if current page is far from start
      if (currentPage > 3) {
        pages.push('left-ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add right ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        pages.push('right-ellipsis');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if only 1 page
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-spacing-md ${className}`}>
      {/* Info text */}
      {showInfo && startIndex !== undefined && endIndex !== undefined && totalItems !== undefined && (
        <Typography variant="body-sm" color="muted">
          Showing {startIndex}-{endIndex} of {totalItems}
        </Typography>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-spacing-xs">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev || (() => onPageChange(currentPage - 1))}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          <Icon name="chevron-left" className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex gap-spacing-xs">
          {getPageNumbers().map((page, index) => {
            if (typeof page === 'string') {
              // Render ellipsis
              return (
                <span
                  key={page}
                  className="px-3 py-1 text-sm text-text-secondary"
                  aria-label="More pages"
                >
                  ...
                </span>
              );
            }

            // Render page number button
            return (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNext || (() => onPageChange(currentPage + 1))}
          disabled={!hasNext}
          aria-label="Next page"
        >
          <Icon name="chevron-right" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
```

Create barrel export `src/components/ui/Pagination/index.ts`:

```typescript
export { Pagination } from "./Pagination";
export type { PaginationProps } from "./Pagination";
```

**Step 3: Integrate into RosterPage** (1 hour)

Update `src/pages/RosterPage.tsx`:

```typescript
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../components/ui/Pagination';

// In component:
const [pageSize, setPageSize] = useState(25);

const {
  paginatedItems: paginatedPlayers,
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
  hasNextPage,
  hasPrevPage,
  startIndex,
  endIndex,
} = usePagination(filteredPlayers, { itemsPerPage: pageSize });

// In JSX (replace filteredPlayers.map with paginatedPlayers.map):
{!loading && filteredPlayers.length > 0 && (
  <>
    {/* Page size selector */}
    {filteredPlayers.length > 25 && (
      <div className="flex items-center justify-end gap-spacing-sm mb-spacing-md">
        <Typography variant="body-sm" color="muted">
          Items per page:
        </Typography>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-2 py-1 border border-surface-secondary rounded text-sm"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    )}

    {/* Player grid with pagination */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
      {paginatedPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelected={selectedPlayerIds.has(player.id)}
          onToggleSelection={togglePlayerSelection}
          onEdit={openEditModal}
          onToggleStatus={togglePlayerStatus}
          onNavigate={(id) => navigate(`/roster/${id}`)}
        />
      ))}
    </div>

    {/* Pagination controls */}
    {filteredPlayers.length > pageSize && (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        onNext={nextPage}
        onPrev={prevPage}
        hasNext={hasNextPage}
        hasPrev={hasPrevPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredPlayers.length}
        className="mt-spacing-lg"
      />
    )}
  </>
)}
```

**Step 4: Testing** (30 min)

Create `src/hooks/usePagination.test.ts`:

```typescript
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));

  it("paginates items correctly", () => {
    const { result } = renderHook(() =>
      usePagination(items, { itemsPerPage: 25 })
    );

    expect(result.current.paginatedItems).toHaveLength(25);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.currentPage).toBe(1);
  });

  it("navigates to next page", () => {
    const { result } = renderHook(() =>
      usePagination(items, { itemsPerPage: 25 })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0].id).toBe(26);
  });

  it("resets to page 1 when items change", () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination(items, { itemsPerPage: 25 }),
      { initialProps: { items } }
    );

    // Go to page 3
    act(() => {
      result.current.goToPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    // Change items (e.g., after filtering)
    const filtered = items.slice(0, 10);
    rerender({ items: filtered });

    // Should reset to page 1
    expect(result.current.currentPage).toBe(1);
  });
});
```

**Validation:**

- [ ] Only 25-100 cards render at a time
- [ ] Page size selector works (25/50/100)
- [ ] Navigation buttons work correctly
- [ ] Ellipsis shows for large page counts
- [ ] Filtering resets to page 1
- [ ] All tests pass

---

### Task 3.4: Performance Monitoring (1 hour)

**Priority:** 🟡 High  
**Impact:** Measure actual improvements, catch regressions

#### Implementation Plan

**Step 1: Add Performance Marks** (30 min)

Update `src/pages/RosterPage/hooks/useRosterFilters.ts`:

```typescript
const filteredPlayers = useMemo(() => {
  if (process.env.NODE_ENV === "development") {
    performance.mark("roster-filter-start");
  }

  const result = players.filter((player) => {
    // ... filter logic
  });

  if (process.env.NODE_ENV === "development") {
    performance.mark("roster-filter-end");
    performance.measure(
      "roster-filter",
      "roster-filter-start",
      "roster-filter-end"
    );

    const measure = performance.getEntriesByName("roster-filter")[0];
    if (measure) {
      console.log(
        `[Performance] Filtering ${players.length} players took ${measure.duration.toFixed(2)}ms`
      );
    }

    // Clean up marks
    performance.clearMarks("roster-filter-start");
    performance.clearMarks("roster-filter-end");
    performance.clearMeasures("roster-filter");
  }

  return result;
}, [
  players,
  debouncedSearch,
  positionFilters,
  gradeLevelFilters,
  statusFilter,
]);
```

**Step 2: Add Re-render Tracking** (30 min)

Create `src/hooks/useRenderCount.ts`:

```typescript
import { useRef, useEffect } from "react";

/**
 * Development hook to track component render count.
 * Logs to console in development mode only.
 *
 * @param componentName - Name to display in logs
 * @returns Current render count
 *
 * @example
 * function MyComponent() {
 *   useRenderCount('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function useRenderCount(componentName: string): number {
  const renders = useRef(0);

  useEffect(() => {
    renders.current += 1;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Render] ${componentName} rendered ${renders.current} times`
      );
    }
  });

  return renders.current;
}

export default useRenderCount;
```

**Step 3: Add to PlayerCard** (optional):

```typescript
import { useRenderCount } from "../../../hooks/useRenderCount";

export const PlayerCard = React.memo<PlayerCardProps>(
  ({
    player,
    // ... props
  }) => {
    // Track renders in development
    if (process.env.NODE_ENV === "development") {
      useRenderCount(`PlayerCard-${player.id}`);
    }

    // ... rest of component
  }
);
```

**Validation:**

- [ ] Console logs show filter times < 100ms
- [ ] PlayerCard renders < 10 times during filtering
- [ ] Performance marks only appear in development
- [ ] Production build has no performance overhead

---

## Week 3 Validation Checklist

Before marking Week 3 complete, verify:

### Functionality

- [ ] Search debounce: Input feels instant, filtering delayed 300ms
- [ ] Pagination: Can navigate between pages smoothly
- [ ] Page size: Can change items per page (25/50/100)
- [ ] Filter + pagination: Filtering resets to page 1
- [ ] Stats: Only recalculate when counts change

### Performance (Development Console)

- [ ] Filter time < 100ms (check performance logs)
- [ ] PlayerCard renders < 10 times during filter
- [ ] No lag when typing in search
- [ ] Smooth scrolling and interactions

### Code Quality

- [ ] All new hooks have unit tests
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] JSDoc comments on all new hooks
- [ ] Barrel exports updated

### User Experience

- [ ] Search feels responsive
- [ ] Page navigation is intuitive
- [ ] Loading states are smooth
- [ ] No visual glitches

---

## Week 3 Success Metrics

| Metric                  | Before          | Target         | Achieved | How to Measure           |
| ----------------------- | --------------- | -------------- | -------- | ------------------------ |
| Filter time             | 300ms           | <100ms         | \_\_\_ms | Console performance logs |
| Search lag              | Every keystroke | 300ms debounce | \_\_\_   | User testing             |
| Cards rendered          | 500+            | 25-100         | \_\_\_   | Count in grid            |
| Memory usage            | 15MB            | <10MB          | \_\_\_MB | Chrome Task Manager      |
| Re-renders (PlayerCard) | 500+            | <10            | \_\_\_   | Console render logs      |

---

## Time Tracking

| Task                       | Estimated | Actual      | Notes |
| -------------------------- | --------- | ----------- | ----- |
| 3.1 Search debouncing      | 2h        | \_\_\_h     |       |
| 3.2 Stat optimization      | 1h        | \_\_\_h     |       |
| 3.3 Pagination             | 4h        | \_\_\_h     |       |
| 3.4 Performance monitoring | 1h        | \_\_\_h     |       |
| Testing & validation       | 2h        | \_\_\_h     |       |
| **Total**                  | **10h**   | **\_\_\_h** |       |

---

## Next Steps

After completing Week 3:

1. **Manual Testing** - Test with 500+ player dataset
2. **Performance Baseline** - Record metrics for comparison
3. **Documentation** - Update README with performance notes
4. **Week 4 Planning** - Move to UX polish (custom dropdowns, etc.)

---

## Troubleshooting

### Common Issues

**Issue: Debounce not working**

- Check that `useDebouncedValue` hook is imported correctly
- Verify `debouncedSearch` is used in filter calculation, not `searchInput`
- Check console for errors

**Issue: Pagination resets unexpectedly**

- Verify `useEffect` dependency array is correct
- Check that `totalPages` calculation is accurate
- Look for unnecessary re-renders

**Issue: Performance not improving**

- Verify React.memo is still on PlayerCard
- Check React DevTools Profiler for actual render counts
- Ensure pagination is limiting rendered cards

---

**Ready to start Week 3! 🚀**
