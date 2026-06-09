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
        "flex items-center gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      <button
        onClick={() => onVote(1)}
        disabled={disabled}
        aria-label="Upvote"
        className={cn(
          "p-1 rounded-full border-2 transition-colors",
          userVote === 1
            ? "border-[#f48024] text-[#f48024]"
            : "border-[#babfc4] text-[#babfc4] hover:border-[#f48024] hover:text-[#f48024]",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <span
        className={cn(
          "font-bold text-base",
          userVote === 1
            ? "text-[#f48024]"
            : userVote === -1
            ? "text-[#0a95ff]"
            : "text-[#6a737c]"
        )}
      >
        {formatCount(count)}
      </span>

      <button
        onClick={() => onVote(-1)}
        disabled={disabled}
        aria-label="Downvote"
        className={cn(
          "p-1 rounded-full border-2 transition-colors",
          userVote === -1
            ? "border-[#0a95ff] text-[#0a95ff]"
            : "border-[#babfc4] text-[#babfc4] hover:border-[#0a95ff] hover:text-[#0a95ff]",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
