import type { ReactNode } from "react";
import React, { useMemo, useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
export interface TableColumn<T = Record<string, unknown>> {
  /** Unique identifier for the column */
  id: string;
  /** Column header label */
  header: string;
  /** Key to access data from row object */
  accessorKey?: keyof T;
  /** Custom cell renderer function */
  cell?: (value: unknown, row: T, index: number) => ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Column width */
  width?: string;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Sticky column position */
  sticky?: "left" | "right";
}
export interface TableRow {
  /** Unique identifier for the row */
  id: string;
  [key: string]: unknown;
}
export type SortDirection = "asc" | "desc" | null;
export interface SortState {
  columnId: string;
  direction: SortDirection;
}
export interface TableProps<T extends TableRow = TableRow> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Table data */
  data: T[];
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Currently selected row IDs */
  selectedRows?: string[];
  /** Selection change handler */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Whether table has borders */
  bordered?: boolean;
  /** Whether rows have alternating colors */
  striped?: boolean;
  /** Table size variant */
  size?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether to show pagination */
  pagination?: boolean;
  /** Current page (0-indexed) */
  currentPage?: number;
  /** Items per page */
  pageSize?: number;
  /** Total number of items */
  totalItems?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Sort state */
  sortState?: SortState;
  /** Sort change handler */
  onSortChange?: (sortState: SortState) => void;
  /** Global filter value */
  globalFilter?: string;
  /** Global filter change handler */
  onGlobalFilterChange?: (filter: string) => void;
  /** Whether to show search */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Custom CSS classes */
  className?: string;
}
// Style functions converted to use Tailwind dark mode classes
const getTableStyles = (size?: "sm" | "md" | "lg", bordered?: boolean) => {
  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  return [
    "w-full table-auto",
    "surface-card",
    "text-gray-900 dark:text-gray-100",
    sizeStyles[size || "md"],
    bordered && "border border-gray-200 dark:border-gray-700",
  ]
    .filter(Boolean)
    .join(" ");
};
const getHeaderStyles = (size?: "sm" | "md" | "lg") => {
  const sizeStyles = {
    sm: "px-2 py-1",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };
  return [
    "border-b border-gray-200 dark:border-gray-700",
    "bg-gray-50 dark:bg-gray-900",
    "text-left font-semibold",
    "text-gray-900 dark:text-gray-100",
    sizeStyles[size || "md"],
  ].join(" ");
};
const getCellStyles = (
  size?: "sm" | "md" | "lg",
  align?: "left" | "center" | "right"
) => {
  const sizeStyles = {
    sm: "px-2 py-1",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };
  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };
  return [
    "border-b border-gray-100 dark:border-gray-700",
    "text-gray-900 dark:text-gray-100",
    sizeStyles[size || "md"],
    alignStyles[align || "left"],
  ].join(" ");
};
const getRowStyles = (
  isSelected?: boolean,
  isEven?: boolean,
  striped?: boolean,
  hoverable?: boolean
) => {
  return [
    "transition-colors duration-200",
    hoverable && "surface-subtle-hover",
    isSelected && "bg-jade-50 dark:bg-navy-900/20",
    striped && isEven && "bg-gray-50 dark:bg-gray-800",
  ]
    .filter(Boolean)
    .join(" ");
};
// Helper components
const SortIcon: React.FC<{ direction: SortDirection }> = ({ direction }) => {
  if (!direction) {
    return (
      <svg
        className="w-4 h-4 text-gray-400 dark:text-gray-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
      </svg>
    );
  }
  return direction === "asc" ? (
    <svg
      className="w-4 h-4 text-jade-600 dark:text-jade-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
  ) : (
    <svg
      className="w-4 h-4 text-jade-600 dark:text-jade-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M3 4a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
  );
};
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 dark:border-jade-400" />
  </div>
);
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <svg
      className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
    <p className="text-sm text-text-secondary">{message}</p>
  </div>
);
export const Table = <T extends TableRow = TableRow>(props: TableProps<T>) => {
  const {
    columns,
    data,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    bordered = false,
    striped = false,
    size = "md",
    loading = false,
    emptyMessage = "No data available",
    pagination = false,
    currentPage = 0,
    pageSize = 10,
    totalItems,
    onPageChange,
    // onPageSizeChange is intentionally not destructured - TODO: Implement functionality
    sortState,
    onSortChange,
    globalFilter = "",
    onGlobalFilterChange,
    searchable = false,
    searchPlaceholder = "Search...",
    className,
  } = props;
  const [internalSortState, setInternalSortState] = useState<SortState>({
    columnId: "",
    direction: null,
  });
  const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
  const currentSortState = sortState || internalSortState;
  const currentGlobalFilter = globalFilter || internalGlobalFilter;
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;
    const newDirection: SortDirection =
      currentSortState.columnId === columnId
        ? currentSortState.direction === "asc"
          ? "desc"
          : currentSortState.direction === "desc"
            ? null
            : "asc"
        : "asc";
    const newSortState = { columnId, direction: newDirection };
    if (onSortChange) {
      onSortChange(newSortState);
    } else {
      setInternalSortState(newSortState);
    }
  };
  const handleGlobalFilterChange = (value: string) => {
    if (onGlobalFilterChange) {
      onGlobalFilterChange(value);
    } else {
      setInternalGlobalFilter(value);
    }
  };
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];
    // Apply global filter
    if (currentGlobalFilter) {
      result = result.filter((row) =>
        columns.some((column) => {
          const value = column.accessorKey ? row[column.accessorKey] : "";
          return String(value)
            .toLowerCase()
            .includes(currentGlobalFilter.toLowerCase());
        })
      );
    }
    // Apply sorting
    if (currentSortState.direction && currentSortState.columnId) {
      const column = columns.find(
        (col) => col.id === currentSortState.columnId
      );
      if (column?.accessorKey) {
        result.sort((a, b) => {
          const aValue = a[column.accessorKey!];
          const bValue = b[column.accessorKey!];
          if (aValue === bValue) return 0;
          const comparison = aValue < bValue ? -1 : 1;
          return currentSortState.direction === "asc"
            ? comparison
            : -comparison;
        });
      }
    }
    return result;
  }, [data, columns, currentGlobalFilter, currentSortState]);
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredAndSortedData;
    const startIndex = currentPage * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, pagination, currentPage, pageSize]);
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = checked ? paginatedData.map((row) => row.id) : [];
    onSelectionChange(newSelection);
  };
  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = checked
      ? [...selectedRows, rowId]
      : selectedRows.filter((id) => id !== rowId);
    onSelectionChange(newSelection);
  };
  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.includes(row.id));
  const isIndeterminate =
    paginatedData.some((row) => selectedRows.includes(row.id)) &&
    !isAllSelected;
  const totalPages =
    pagination && totalItems ? Math.ceil(totalItems / pageSize) : 0;
  return (
    <div className={["space-y-4", className].filter(Boolean).join(" ")}>
      {searchable && (
        <div className="flex justify-between items-center">
          <Input
            placeholder={searchPlaceholder}
            value={currentGlobalFilter}
            onChange={(e) => handleGlobalFilterChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className={getTableStyles(size, bordered)}>
          <thead>
            <tr>
              {selectable && (
                <th className={getHeaderStyles(size)}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded-sm border-gray-300 dark:border-gray-600 text-jade-600 focus:ring-jade-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`${getHeaderStyles(size)} ${column.sortable ? "cursor-pointer select-none group" : ""}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <SortIcon
                        direction={
                          currentSortState.columnId === column.id
                            ? currentSortState.direction
                            : null
                        }
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <LoadingSpinner />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const isSelected = selectedRows.includes(row.id);
                const isEven = rowIndex % 2 === 0;
                return (
                  <tr
                    key={row.id}
                    className={getRowStyles(isSelected, isEven, striped, true)}
                  >
                    {selectable && (
                      <td className={getCellStyles(size)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(row.id, e.target.checked)
                          }
                          className="rounded-sm border-gray-300 dark:border-gray-600 text-jade-600 focus:ring-jade-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = column.accessorKey
                        ? row[column.accessorKey]
                        : undefined;
                      return (
                        <td
                          key={column.id}
                          className={getCellStyles(size, column.align)}
                        >
                          {column.cell
                            ? column.cell(value, row, rowIndex)
                            : String(value || "")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {currentPage * pageSize + 1} to{" "}
            {Math.min(
              (currentPage + 1) * pageSize,
              totalItems || filteredAndSortedData.length
            )}{" "}
            of {totalItems || filteredAndSortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
