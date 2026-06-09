import { getReputationLevel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ReputationBadgeProps {
  reputation: number;
  showLabel?: boolean;
  className?: string;
}

const levelStyles: Record<string, string> = {
  Expert: "bg-[#fdf3d0] text-[#a56600] border-[#f5d67d]",
  Pro: "bg-[#e1ecf4] text-[#39739d] border-[#9cc3db]",
  Regular: "bg-[#d4edda] text-[#2e6d44] border-[#9cd4b0]",
  Newbie: "bg-[#e4e6e8] text-[#6a737c] border-[#c8ccd0]",
};

export default function ReputationBadge({
  reputation,
  showLabel = true,
  className,
}: ReputationBadgeProps) {
  const level = getReputationLevel(reputation);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded border",
        levelStyles[level],
        className
      )}
    >
      <span className="font-bold">{reputation.toLocaleString()}</span>
      {showLabel && <span className="opacity-75">{level}</span>}
    </span>
  );
}
