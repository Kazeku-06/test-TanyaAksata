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
    <div className="flex items-center gap-3 p-3 border border-[#e3e6eb] rounded hover:border-[#babfc4] transition-colors bg-white">
      {rank !== undefined && (
        <span className="text-sm font-bold text-[#6a737c] w-6 flex-shrink-0 text-center">
          #{rank}
        </span>
      )}
      <Link href={`/users/${user.id}`} className="flex-shrink-0">
        <Avatar name={user.name} avatar={user.avatar} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/users/${user.id}`}
          className="font-medium text-sm text-[#0074cc] hover:underline block truncate"
        >
          {user.name}
        </Link>
        <div className="flex items-center gap-2 text-xs text-[#6a737c] mt-0.5">
          <span className="font-medium text-[#232629]">
            {formatCount(user.reputation)}
          </span>
          <span className="text-[#9199a1]">reputasi</span>
          <span
            className={`px-1 py-0.5 rounded text-[10px] font-medium
              ${getReputationLevel(user.reputation) === "Expert"
                ? "bg-[#fdf3d0] text-[#a56600]"
                : getReputationLevel(user.reputation) === "Pro"
                ? "bg-[#e1ecf4] text-[#39739d]"
                : getReputationLevel(user.reputation) === "Regular"
                ? "bg-[#d4edda] text-[#2e6d44]"
                : "bg-[#e4e6e8] text-[#6a737c]"}`}
          >
            {getReputationLevel(user.reputation)}
          </span>
        </div>
      </div>
    </div>
  );
}
