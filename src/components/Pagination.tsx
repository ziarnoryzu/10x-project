import { memo } from "react";
import type { PaginationViewModel } from "../types";
import { Button } from "./ui/button";

interface PaginationProps {
  pagination: PaginationViewModel;
  onPageChange: (page: number) => void;
}

/**
 * Pagination - Component for navigating through paginated content
 * Displays current page, total pages, and navigation controls
 * Disables buttons appropriately on first/last pages
 * Memoized for performance optimization
 */
export const Pagination = memo(function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages } = pagination;

  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      role="navigation"
      aria-label="Nawigacja między stronami notatek"
    >
      <Button variant="outline" onClick={handlePrevious} disabled={isFirstPage} aria-label="Poprzednia strona">
        <span className="hidden sm:inline">Poprzednia</span>
        <span className="sm:hidden">‹</span>
      </Button>
      <span className="px-2 text-xs text-gray-700 sm:px-4 sm:text-sm" aria-current="page">
        <span className="hidden sm:inline">
          Strona {page} z {totalPages}
        </span>
        <span className="sm:hidden">
          {page}/{totalPages}
        </span>
      </span>
      <Button variant="outline" onClick={handleNext} disabled={isLastPage} aria-label="Następna strona">
        <span className="hidden sm:inline">Następna</span>
        <span className="sm:hidden">›</span>
      </Button>
    </nav>
  );
});
