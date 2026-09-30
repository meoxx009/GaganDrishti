// FINAL_006 Step 6: Generic pagination hook
// Returns: { currentPage, totalPages, paginatedItems, goToNext, goToPrev, goToPage }
// Generic hook that takes items array and pageSize

import { useState, useMemo, useCallback } from "react";

interface UsePaginationResult<T> {
  /** Current active page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Slice of items visible on the current page */
  paginatedItems: T[];
  /** Navigate to the next page (no-op if already on last) */
  goToNext: () => void;
  /** Navigate to the previous page (no-op if already on first) */
  goToPrev: () => void;
  /** Jump to a specific page number (clamped to valid range) */
  goToPage: (page: number) => void;
}

/**
 * usePagination — generic hook for paginating any array of items.
 *
 * @param items    - Full array of data to paginate
 * @param pageSize - Number of items per page (default: 20)
 * @returns Pagination state and navigation helpers
 *
 * @example
 * const { paginatedItems, currentPage, totalPages, goToNext } = usePagination(alerts, 10);
 */
export function usePagination<T>(
  items: T[],
  pageSize: number = 20
): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize]
  );

  // Clamp page on items/pageSize changes
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const goToNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goToPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  return {
    currentPage: safePage,
    totalPages,
    paginatedItems,
    goToNext,
    goToPrev,
    goToPage,
  };
}
