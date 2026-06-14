import { getReputationLevel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ReputationBadgeProps {
  reputation: number;
  showLabel?: boolean;
  className?: string;
}

const levelStyles: Record<string, string> = {
  Expert: "bg-amber-100 text-amber-700 border-amber-200",
  Pro: "bg-blue-100 text-blue-700 border-blue-200",
  Regular: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Newbie: "bg-slate-100 text-slate-500 border-slate-200",
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
