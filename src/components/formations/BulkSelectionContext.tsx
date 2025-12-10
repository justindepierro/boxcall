/**
 * BulkSelectionContext.tsx
 *
 * Manages bulk selection state for formations.
 * Provides selection operations: select, deselect, select all, clear.
 */

/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface BulkSelectionContextValue {
  selectedIds: Set<string>;
  selectFormation: (id: string) => void;
  deselectFormation: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  selectionCount: number;
  hasSelection: boolean;
}

const BulkSelectionContext = createContext<BulkSelectionContextValue | null>(
  null
);

interface BulkSelectionProviderProps {
  children: React.ReactNode;
}

export function BulkSelectionProvider({
  children,
}: BulkSelectionProviderProps): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectFormation = useCallback((id: string) => {
    setSelectedIds((prev) => new Set(prev).add(id));
  }, []);

  const deselectFormation = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  const value = useMemo<BulkSelectionContextValue>(
    () => ({
      selectedIds,
      selectFormation,
      deselectFormation,
      toggleSelection,
      selectAll,
      clearSelection,
      isSelected,
      selectionCount: selectedIds.size,
      hasSelection: selectedIds.size > 0,
    }),
    [
      selectedIds,
      selectFormation,
      deselectFormation,
      toggleSelection,
      selectAll,
      clearSelection,
      isSelected,
    ]
  );

  return (
    <BulkSelectionContext.Provider value={value}>
      {children}
    </BulkSelectionContext.Provider>
  );
}

export function useBulkSelection(): BulkSelectionContextValue {
  const context = useContext(BulkSelectionContext);
  if (!context) {
    throw new Error(
      "useBulkSelection must be used within BulkSelectionProvider"
    );
  }
  return context;
}
