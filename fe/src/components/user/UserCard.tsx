import Link from "next/link";
import type { User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import { getReputationLevel, formatCount } from "@/lib/utils";

interface UserCardProps {
  user: User;
  rank?: number;
}

export default function UserCard({ user, rank }: UserCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg hover:border-blue-300 transition-colors bg-white">
      {rank !== undefined && (
        <span className="text-sm font-bold text-[#64748b] w-6 flex-shrink-0 text-center">
          #{rank}
        </span>
      )}
      <Link href={`/users/${user.id}`} className="flex-shrink-0">
        <Avatar name={user.name} avatar={user.avatar} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/users/${user.id}`}
          className="font-medium text-sm text-[#60a5fa] hover:underline block truncate"
        >
          {user.name}
        </Link>
        <div className="flex items-center gap-2 text-xs text-[#64748b] mt-0.5">
          <span className="font-medium text-[#1e293b]">
            {formatCount(user.reputation)}
          </span>
          <span className="text-[#94a3b8]">reputasi</span>
          <span
            className={`px-1 py-0.5 rounded text-[10px] font-medium
              ${getReputationLevel(user.reputation) === "Expert"
                ? "bg-amber-100 text-amber-700"
                : getReputationLevel(user.reputation) === "Pro"
                ? "bg-blue-100 text-blue-700"
                : getReputationLevel(user.reputation) === "Regular"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"}`}
          >
            {getReputationLevel(user.reputation)}
          </span>
        </div>
      </div>
    </div>
  );
}
