// FINAL_006 Step 6: Pagination component for mobile
// Props: totalItems, itemsPerPage (default 20), currentPage, onPageChange
// Shows: Previous button, current page info 'Page 2 of 5', Next button
// Also shows: 'अगले N देखें →' for next page
// Mobile-first: large buttons (48px), centered layout
// Hindi + English labels

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items shown per page (default: 20) */
  itemsPerPage?: number;
  /** Currently active page (1-indexed) */
  currentPage: number;
  /** Callback fired when the user selects a new page */
  onPageChange: (page: number) => void;
  /** Display language — 'hi' for Hindi, 'en' for English */
  language?: "hi" | "en";
}

/**
 * Mobile-first pagination control for list views in GaganDrishti.
 * Follows WCAG touch-target minimums (48 px buttons) and shows
 * bilingual labels for rural Indian users.
 */
export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage = 20,
  currentPage,
  onPageChange,
  language = "hi",
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalPages <= 1) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  // Items remaining after current page
  const remainingItems = Math.max(
    0,
    totalItems - currentPage * itemsPerPage
  );
  const nextCount = Math.min(itemsPerPage, remainingItems);

  const labelPage = language === "hi" ? "पृष्ठ" : "Page";
  const labelOf = language === "hi" ? "में से" : "of";
  const labelPrev = language === "hi" ? "पिछला" : "Previous";
  const labelNext = language === "hi" ? "अगला" : "Next";
  const labelNextCount =
    language === "hi"
      ? `अगले ${nextCount} देखें →`
      : `See next ${nextCount} →`;

  return (
    <div className="flex flex-col items-center gap-3 py-4 select-none">
      {/* Page info */}
      <p className="text-sm text-[var(--text-muted)] font-medium">
        {labelPage}{" "}
        <span className="text-[var(--text-main)] font-bold">{currentPage}</span>{" "}
        {labelOf}{" "}
        <span className="text-[var(--text-main)] font-bold">{totalPages}</span>
      </p>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        {/* Previous */}
        <button
          type="button"
          onClick={() => !isFirst && onPageChange(currentPage - 1)}
          disabled={isFirst}
          aria-label={labelPrev}
          className="touch-target flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 text-sm font-semibold text-[var(--text-main)] transition-all hover:border-[var(--border-prominent)] hover:bg-[var(--bg-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{labelPrev}</span>
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={() => !isLast && onPageChange(currentPage + 1)}
          disabled={isLast}
          aria-label={labelNext}
          className="touch-target flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 text-sm font-semibold text-[var(--text-main)] transition-all hover:border-[var(--border-prominent)] hover:bg-[var(--bg-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          <span>{labelNext}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Next-page preview label (hidden on last page) */}
      {!isLast && nextCount > 0 && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          className="text-xs text-[var(--color-brand-primary,#10B981)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {labelNextCount}
        </button>
      )}
    </div>
  );
};
