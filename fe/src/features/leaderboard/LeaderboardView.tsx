"use client";

import Link from "next/link";
import type { LeaderboardEntry } from "@/types";
import { formatCount, getReputationLevel, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Avatar from "@/components/ui/Avatar";
import { AlertCircle, Trophy } from "lucide-react";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function LeaderboardView({
  entries,
  total,
  isLoading,
  isError,
  currentPage,
  lastPage,
  onPageChange,
}: LeaderboardViewProps) {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-3 py-10 px-4 text-sm text-red-600 justify-center bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>Gagal memuat data papan peringkat. Pastikan koneksi aman dan coba lagi.</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return <EmptyState title="Belum ada data" description="Leaderboard saat ini masih kosong." />;
  }

  const rank1 = entries.find((e) => e.rank === 1);
  const rank2 = entries.find((e) => e.rank === 2);
  const rank3 = entries.find((e) => e.rank === 3);

  const topThreeOrder = [rank2, rank1, rank3];

  return (
    <div className="w-full bg-white font-sans text-[#1e293b] p-6 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1e293b]">Leaderboard</h1>
        <p className="text-[14px] text-[#64748b] mt-1">
          Top contributors in the DevForum community
        </p>
      </div>

      {/* TOP 3 */}
      {currentPage === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {topThreeOrder.map((entry, index) => {
            if (!entry) return <div key={`empty-${index}`} className="hidden md:block" />;

            const isRank1 = entry.rank === 1;
            const isRank2 = entry.rank === 2;
            const isRank3 = entry.rank === 3;
            const repLevel = getReputationLevel(entry.reputation);

            return (
              <div
                key={entry.id}
                className={cn(
                  "border rounded-2xl p-6 flex flex-col items-center justify-center bg-white shadow-sm relative transition-all",
                  isRank1 && "border-blue-300 bg-gradient-to-b from-blue-50 to-white", 
                  isRank2 && "border-slate-200 bg-white",
                  isRank3 && "border-amber-200 bg-white"
                )}
              >
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-100">
                    <Avatar name={entry.name} avatar={entry.avatar} size="lg" className="w-full h-full object-cover" />
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm",
                      isRank1 && "bg-[#60a5fa]",
                      isRank2 && "bg-[#64748b]",
                      isRank3 && "bg-[#d97706]"
                    )}
                  >
                    #{entry.rank}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1e293b] tracking-tight truncate max-w-full px-2">
                  {entry.name}
                </h3>

                <span className="text-[11px] bg-blue-50 text-[#60a5fa] px-3 py-0.5 rounded-md font-semibold mt-1.5 border border-blue-200">
                  {repLevel}
                </span>

                <div className="flex items-center gap-2 mt-5 text-[#1e293b]">
                  <Trophy className={cn("w-5 h-5", isRank1 ? "text-[#60a5fa]" : isRank2 ? "text-[#64748b]" : "text-[#d97706]")} />
                  <span className="text-2xl font-bold tracking-tight">
                    {entry.reputation?.toLocaleString() ?? 0}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mt-6 text-center text-[11px] text-[#64748b] border-t border-dashed border-blue-100 w-full pt-4 justify-center">
                  <div>
                    <p className="font-bold text-[#1e293b] text-[13px]">{entry.posts_count?.toLocaleString() ?? 0}</p>
                    <p className="text-[11px] text-[#94a3b8]">posts</p>
                  </div>
                  <div className="w-px bg-blue-100 h-8 self-center" />
                  <div>
                    <p className="font-bold text-[#1e293b] text-[13px]">{entry.accepted_count?.toLocaleString() ?? 0}</p>
                    <p className="text-[11px] text-[#94a3b8]">accepted</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* LIST TABLE */}
      <div className="w-full border border-blue-200 rounded-xl overflow-hidden shadow-sm mt-4">
        <table className="w-full border-collapse text-left text-sm text-[#1e293b]">
          <thead className="bg-blue-50 border-b border-blue-200 text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
            <tr>
              <th className="px-6 py-3.5 w-20 text-center">Rank</th>
              <th className="px-6 py-3.5">User</th>
              <th className="px-6 py-3.5">Level</th>
              <th className="px-6 py-3.5 text-right">Reputation</th>
              <th className="px-6 py-3.5 text-right pr-8">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 bg-white">
            {entries
              .filter((entry) => currentPage > 1 || entry.rank > 3)
              .map((entry) => {
                const repLevel = getReputationLevel(entry.reputation);

                return (
                  <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-center font-mono font-bold text-[#94a3b8] group-hover:text-[#1e293b]">
                      {entry.rank.toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={entry.name} avatar={entry.avatar} size="sm" />
                        <Link href={`/users/${entry.id}`} className="text-[#60a5fa] hover:text-[#3b82f6] font-medium hover:underline">
                          {entry.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-semibold text-[#60a5fa] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {repLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#1e293b]">
                      {formatCount(entry.reputation)}
                    </td>
                    <td className="px-6 py-4 text-right pr-8 text-xs text-[#64748b]">
                      <span className="font-semibold text-[#1e293b]">{entry.posts_count}</span> Q &middot;{" "}
                      <span className="font-semibold text-emerald-600">{entry.accepted_count}</span> A
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* FOOTER PAGINATION */}
      {lastPage > 1 && !isLoading && (
        <div className="flex justify-end pt-6 mt-6 border-t border-blue-100">
          <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={onPageChange} />
        </div>
      )}

    </div>
  );
}
