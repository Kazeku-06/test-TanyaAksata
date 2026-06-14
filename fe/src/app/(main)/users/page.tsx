"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import Spinner from "@/components/ui/Spinner";
import Pagination from "@/components/ui/Pagination";
import Avatar from "@/components/ui/Avatar";
import { useUsers } from "@/hooks/useProfile";
import { getReputationLevel } from "@/lib/utils";
import { Search, MapPin, Globe, Calendar, Award } from "lucide-react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"reputation" | "newest">("reputation");
  const [page, setPage] = useState(1);

  // Debounce search input to limit API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data, isLoading, isError } = useUsers({
    q: debouncedSearch || undefined,
    sort,
    page,
  });

  const users = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const totalUsers = data?.total ?? 0;

  return (
    <MainLayout>
      <div className="px-6 py-6 font-sans text-[#232629]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#232629] mb-1">Pengguna</h1>
          <p className="text-sm text-[#6a737c]">
            Jelajahi dan temukan anggota komunitas Tanya-Aksata.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#babfc4]" />
            <input
              type="text"
              placeholder="Cari nama pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20 placeholder-[#babfc4]"
            />
          </div>

          {/* Sort Tabs */}
          <div className="flex border border-[#babfc4] rounded overflow-hidden divide-x divide-[#babfc4] text-xs font-medium bg-white w-fit self-start sm:self-auto">
            <button
              onClick={() => {
                setSort("reputation");
                setPage(1);
              }}
              className={`px-4 py-2.5 transition-colors ${
                sort === "reputation"
                  ? "bg-[#e3e6eb] text-[#232629]"
                  : "text-[#525960] hover:bg-[#f8f9f9]"
              }`}
            >
              Reputasi
            </button>
            <button
              onClick={() => {
                setSort("newest");
                setPage(1);
              }}
              className={`px-4 py-2.5 transition-colors ${
                sort === "newest"
                  ? "bg-[#e3e6eb] text-[#232629]"
                  : "text-[#525960] hover:bg-[#f8f9f9]"
              }`}
            >
              Pengguna Baru
            </button>
          </div>
        </div>

        {/* Total info */}
        {!isLoading && !isError && (
          <p className="text-xs text-[#6a737c] mb-4">
            Menampilkan <span className="font-semibold text-[#232629]">{totalUsers}</span> pengguna
          </p>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e] text-center font-medium my-8">
            Gagal memuat daftar pengguna. Silakan coba lagi.
          </div>
        ) : users.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#e3e6eb] rounded bg-[#fafafa]">
            <p className="text-sm text-[#6a737c]">Tidak ada pengguna yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {users.map((u) => {
                const repLevel = getReputationLevel(u.reputation);
                return (
                  <div
                    key={u.id}
                    className="p-4 border border-[#e3e6eb] rounded bg-white flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div>
                      {/* Avatar & Name */}
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar name={u.name} avatar={u.avatar} size="md" />
                        <div className="min-w-0">
                          <Link
                            href={`/users/${u.id}`}
                            className="font-semibold text-sm text-[#0074cc] hover:text-[#0a95ff] hover:underline block truncate"
                          >
                            {u.name}
                          </Link>
                          {/* Level Badge */}
                          <span
                            className={`inline-block px-1.5 py-0.5 mt-1 text-[9px] font-bold rounded-sm uppercase tracking-wider ${
                              repLevel === "Expert"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : repLevel === "Pro"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : repLevel === "Regular"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {repLevel}
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      {u.bio ? (
                        <p className="text-xs text-[#525960] line-clamp-2 mb-3 min-h-[32px] italic">
                          &quot;{u.bio}&quot;
                        </p>
                      ) : (
                        <p className="text-xs text-[#9199a1] mb-3 min-h-[32px] italic">
                          Belum ada biodata.
                        </p>
                      )}
                    </div>

                    {/* Stats & Meta info */}
                    <div className="border-t border-[#f1f2f3] pt-3 mt-1 space-y-1.5 text-[11px] text-[#6a737c]">
                      {/* Reputation */}
                      <div className="flex items-center gap-1.5 font-medium text-[#232629]">
                        <Award className="w-3.5 h-3.5 text-[#0a95ff]" />
                        <span>{u.reputation.toLocaleString()} reputasi</span>
                      </div>

                      {/* Location */}
                      {u.location && (
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{u.location}</span>
                        </div>
                      )}

                      {/* Website */}
                      {u.website && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Globe className="w-3.5 h-3.5" />
                          <a
                            href={u.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0074cc] hover:underline truncate"
                          >
                            {u.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}

                      {/* Join Date */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Bergabung {new Date(u.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={page}
                  lastPage={lastPage}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
