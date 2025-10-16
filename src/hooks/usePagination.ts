/**
 * usePagination Hook
 * 
 * Generic pagination hook for managing page state and computing slices
 * - Current page state
 * - Total pages calculation
 * - Page navigation functions
 * - Data slicing for current page
 * - URL persistence support
 * 
 * @example
 * ```tsx
 * const { currentPage, totalPages, paginatedData, goToPage, nextPage, prevPage } = 
 *   usePagination(players, 50);
 * ```
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface UsePaginationOptions {
  /** Initial page number (1-based, default: 1) */
  initialPage?: number;
  /** Whether to persist page in URL (default: false) */
  persistInUrl?: boolean;
  /** URL parameter name for page (default: 'page') */
  urlParamName?: string;
}

export interface UsePaginationReturn<T> {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Items for the current page */
  paginatedData: T[];
  /** Start index of current page in original data (0-based) */
  startIndex: number;
  /** End index of current page in original data (0-based, exclusive) */
  endIndex: number;
  /** Go to a specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
}

/**
 * Hook for pagination logic
 * 
 * @param data - Array of items to paginate
 * @param itemsPerPage - Number of items per page
 * @param options - Configuration options
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  data: T[],
  itemsPerPage: number,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    persistInUrl = false,
    urlParamName = 'page',
  } = options;

  const navigate = useNavigate();
  const location = useLocation();

  // Initialize page from URL if persistence is enabled
  const [currentPage, setCurrentPage] = useState(() => {
    if (persistInUrl) {
      const params = new URLSearchParams(location.search);
      const urlPage = parseInt(params.get(urlParamName) || '', 10);
      return urlPage > 0 ? urlPage : initialPage;
    }
    return initialPage;
  });

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage) || 1;
  }, [data.length, itemsPerPage]);

  // Calculate start and end indices
  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage, data.length);
  }, [startIndex, itemsPerPage, data.length]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Check for next/prev pages
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Update URL when page changes (if persistence enabled)
  useEffect(() => {
    if (persistInUrl) {
      const params = new URLSearchParams(location.search);
      
      if (currentPage === 1) {
        params.delete(urlParamName);
      } else {
        params.set(urlParamName, currentPage.toString());
      }

      const newSearch = params.toString();
      const newUrl = newSearch ? `?${newSearch}` : location.pathname;
      
      navigate(newUrl, { replace: true });
    }
  }, [currentPage, persistInUrl, urlParamName, navigate, location.pathname, location.search]);

  // Reset to page 1 when data changes (e.g., after filtering)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPrevPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage,
    hasPrevPage,
  };
}
