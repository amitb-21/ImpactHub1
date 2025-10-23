import { useState, useCallback, useEffect } from 'react';

/**
 * usePagination Hook
 * Manages pagination state and provides navigation methods
 * 
 * Usage:
 * const {
 *   page,
 *   limit,
 *   total,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   prevPage,
 *   setLimit,
 *   canGoPrev,
 *   canGoNext,
 *   startIndex,
 *   endIndex
 * } = usePagination(initialTotal, initialPage, initialLimit);
 * 
 * Params:
 * - initialTotal: Total number of items (default: 0)
 * - initialPage: Starting page (default: 1)
 * - initialLimit: Items per page (default: 10)
 */
export const usePagination = (
  initialTotal = 0,
  initialPage = 1,
  initialLimit = 10
) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(initialTotal);

  // Calculate derived values
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  // Navigation functions
  const goToPage = useCallback((newPage) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages || 1));
    setPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  const changeLimitAndReset = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Helper functions
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  // Update total when it changes
  useEffect(() => {
    setTotal(initialTotal);
    // Reset to page 1 if total changed and current page exceeds new total pages
    if (page > Math.ceil(initialTotal / limit)) {
      setPage(1);
    }
  }, [initialTotal, limit]);

  return {
    page,
    limit,
    total,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    setLimit: changeLimitAndReset,
    canGoPrev,
    canGoNext,
    // For manual updates
    setPageManually: setPage,
    setTotalManually: setTotal
  };
};

export default usePagination;