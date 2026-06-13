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
      {/* UPVOTE */}
      <button
        type="button"
        onClick={() => onVote(1)}
        disabled={disabled}
        aria-label="Upvote"
        className={cn(
          "p-1.5 rounded-full transition-colors flex items-center justify-center border border-transparent",
          userVote === 1
            ? "text-[#60a5fa] bg-blue-50"
            : "text-[#94a3b8] hover:bg-blue-50 hover:text-[#60a5fa]",
          disabled && "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronUp className="w-7 h-7 stroke-[3]" />
      </button>

      {/* COUNT */}
      <span
        className={cn(
          "font-semibold text-lg tracking-tight text-center leading-none min-w-[20px]",
          userVote !== null ? "text-[#1e293b] font-bold" : "text-[#64748b]"
        )}
      >
        {formatCount(count)}
      </span>

      {/* DOWNVOTE */}
      <button
        type="button"
        onClick={() => onVote(-1)}
        disabled={disabled}
        aria-label="Downvote"
        className={cn(
          "p-1.5 rounded-full transition-colors flex items-center justify-center border border-transparent",
          userVote === -1
            ? "text-red-500 bg-red-50"
            : "text-[#94a3b8] hover:bg-red-50 hover:text-red-500",
          disabled && "opacity-30 cursor-not-allowed"
        )}
      >
        <ChevronDown className="w-7 h-7 stroke-[3]" />
      </button>
    </div>
  );
}
