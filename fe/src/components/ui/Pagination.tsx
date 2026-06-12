"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  className,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  // Build page numbers to show
  const pages: (number | "...")[] = [];
  const delta = 2;

  for (let i = 1; i <= lastPage; i++) {
    if (
      i === 1 ||
      i === lastPage ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - delta - 1 && i > 1) ||
      (i === currentPage + delta + 1 && i < lastPage)
    ) {
      pages.push("...");
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded border border-[#9199a1] text-[#525960] hover:bg-[#f6f6f6] disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#525960] text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              "min-w-[32px] h-8 px-2 text-sm rounded border transition-colors",
              page === currentPage
                ? "bg-[var(--primary)] text-white border-[var(--primary)] cursor-default"
                : "border-[#9199a1] text-[#232629] hover:bg-[#f6f6f6]"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="p-1.5 rounded border border-[#9199a1] text-[#525960] hover:bg-[#f6f6f6] disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
