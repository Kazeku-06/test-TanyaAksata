import Link from "next/link";
import type { LeaderboardEntry } from "@/types";
import { formatCount, getReputationLevel, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Avatar from "@/components/ui/Avatar";
import { Trophy, AlertCircle, Medal } from "lucide-react";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

// Warna untuk rank 1, 2, 3
const RANK_STYLES: Record<number, string> = {
  1: "text-[#b8860b] font-bold",
  2: "text-[#708090] font-bold",
  3: "text-[#8B4513] font-bold",
};

export default function LeaderboardView({
  entries,
  total,
  isLoading,
  isError,
  currentPage,
  lastPage,
  onPageChange,
}: LeaderboardViewProps) {
  return (
    <div className="px-6 py-4">

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-5 h-5 text-[#f48024]" />
        <h1 className="text-xl font-semibold text-[#232629]">Leaderboard</h1>
      </div>
      <p className="text-sm text-[#6a737c] mb-4">
        Ranking berdasarkan reputasi dan jumlah jawaban diterima.
        {!isLoading && total > 0 && (
          <span> Total {total} pengguna.</span>
        )}
      </p>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#c91d2e] justify-center">
          <AlertCircle className="w-4 h-4" />
          Gagal memuat leaderboard.
        </div>
      ) : entries.length === 0 ? (
        <EmptyState title="Belum ada data" description="Leaderboard masih kosong." />
      ) : (
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-4 px-4 py-3 hover:bg-[#fafafa] transition-colors",
                entry.rank <= 3 && "bg-[#fffdf0]"
              )}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {entry.rank <= 3 ? (
                  <Medal className={cn("w-5 h-5 mx-auto", RANK_STYLES[entry.rank])} />
                ) : (
                  <span className="text-sm font-medium text-[#6a737c]">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <Link href={`/users/${entry.id}`} className="flex-shrink-0">
                <Avatar name={entry.name} avatar={entry.avatar} size="md" />
              </Link>

              {/* Name + level */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/users/${entry.id}`}
                  className="font-medium text-sm text-[#0074cc] hover:underline block truncate"
                >
                  {entry.name}
                </Link>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-medium",
                  {
                    "bg-[#fdf3d0] text-[#a56600]": getReputationLevel(entry.reputation) === "Expert",
                    "bg-[#e1ecf4] text-[#39739d]": getReputationLevel(entry.reputation) === "Pro",
                    "bg-[#d4edda] text-[#2e6d44]": getReputationLevel(entry.reputation) === "Regular",
                    "bg-[#e4e6e8] text-[#6a737c]": getReputationLevel(entry.reputation) === "Newbie",
                  }
                )}>
                  {getReputationLevel(entry.reputation)}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-[#232629]">{formatCount(entry.reputation)}</p>
                  <p className="text-xs text-[#6a737c]">reputasi</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="font-semibold text-[#232629]">{entry.posts_count}</p>
                  <p className="text-xs text-[#6a737c]">pertanyaan</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#2e6d44]">{entry.accepted_count}</p>
                  <p className="text-xs text-[#6a737c]">diterima</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && !isLoading && (
        <div className="flex justify-center py-4 mt-2">
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={onPageChange}
          />
        </div>
      )}

    </div>
  );
}
