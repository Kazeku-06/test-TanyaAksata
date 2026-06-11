"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn, formatCount } from "@/lib/utils";

interface VoteButtonProps {
  count: number;
  userVote: 1 | -1 | null;
  onVote: (vote: 1 | -1) => void;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
}

export default function VoteButton({
  count,
  userVote,
  onVote,
  disabled,
  orientation = "vertical",
}: VoteButtonProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center select-none",
        orientation === "vertical" ? "flex-col gap-1.5 w-12" : "flex-row gap-3"
      )}
    >
      {/* 1. UPVOTE BUTTON */}
      <button
        type="button"
        onClick={() => onVote(1)}
        disabled={disabled}
        aria-label="Upvote"
        className={cn(
          "p-1.5 rounded-full transition-colors flex items-center justify-center border border-transparent",
          userVote === 1
            ? "text-[#f48024]" // Warna orange aktif khas SO
            : "text-[#babfc4] hover:bg-[#f8f9f9] hover:text-[#f48024]", // Efek hover soft abu ke orange
          disabled && "opacity-30 cursor-not-allowed"
        )}
      >
        {/* Menggunakan stroke besar (strokeWidth 3) agar mirip panah tebal SO */}
        <ChevronUp className="w-7 h-7 stroke-[3]" />
      </button>

      {/* 2. VOTE COUNT */}
      <span
        className={cn(
          "font-semibold text-lg tracking-tight text-center leading-none min-w-[20px]",
          userVote !== null ? "text-[#232629] font-bold" : "text-[#6a737c]"
        )}
      >
        {formatCount(count)}
      </span>

      {/* 3. DOWNVOTE BUTTON */}
      <button
        type="button"
        onClick={() => onVote(-1)}
        disabled={disabled}
        aria-label="Downvote"
        className={cn(
          "p-1.5 rounded-full transition-colors flex items-center justify-center border border-transparent",
          userVote === -1
            ? "text-[#f48024]" // Di SO asli, downvote aktif juga berwarna orange hangat!
            : "text-[#babfc4] hover:bg-[#f8f9f9] hover:text-[#f48024]",
          disabled && "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronDown className="w-7 h-7 stroke-[3]" />
      </button>
    </div>
  );
}