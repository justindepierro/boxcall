/**
 * Pagination Component
 *
 * Accessible pagination UI with design system integration
 * - Page number display
 * - Previous/Next navigation
 * - First/Last page buttons
 * - Item range display
 * - Keyboard navigation support
 *
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => goToPage(page)}
 *   itemsPerPage={50}
 *   totalItems={500}
 * />
 * ```
 */

import React from "react";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";

export interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of items per page (for display only) */
  itemsPerPage?: number;
  /** Total number of items (for display only) */
  totalItems?: number;
  /** Whether pagination is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pagination component for navigating through large datasets
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  disabled = false,
  className = "",
}) => {
  // Calculate item range for display
  const startItem =
    itemsPerPage && totalItems
      ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
      : null;
  const endItem =
    itemsPerPage && totalItems
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : null;

  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div
      className={`flex items-center justify-between gap-4 ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Item range display */}
      <div className="flex-1">
        {startItem !== null && endItem !== null && totalItems !== null && (
          <Typography variant="body-md" color="muted" aria-live="polite">
            Showing {startItem}-{endItem} of {totalItems}
          </Typography>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={disabled || !hasPrevPage}
          aria-label="Go to first page"
          className="px-3"
        >
          <Icon name="chevron-left" size={16} />
          <Icon name="chevron-left" size={16} className="-ml-2" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || !hasPrevPage}
          aria-label="Go to previous page"
          className="px-3"
        >
          <Icon name="chevron-left" size={16} />
        </Button>

        {/* Page number display */}
        <div className="flex items-center gap-2 px-4">
          <Typography variant="body-md" color="primary">
            Page
          </Typography>
          <Typography
            variant="body-md"
            color="primary"
            aria-current="page"
            className="font-semibold"
          >
            {currentPage}
          </Typography>
          <Typography variant="body-md" color="muted">
            of {totalPages}
          </Typography>
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || !hasNextPage}
          aria-label="Go to next page"
          className="px-3"
        >
          <Icon name="chevron-right" size={16} />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || !hasNextPage}
          aria-label="Go to last page"
          className="px-3"
        >
          <Icon name="chevron-right" size={16} />
          <Icon name="chevron-right" size={16} className="-ml-2" />
        </Button>
      </div>
    </div>
  );
};

Pagination.displayName = "Pagination";
