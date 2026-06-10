import type { Post, Category } from "@/types";
import type { SearchSort } from "./SearchLogic";
import { Search, AlertCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import PostCard from "@/components/post/PostCard";
import Link from "next/link";

interface SearchViewProps {
  query: string;
  localQ: string;
  posts: Post[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  sort: SearchSort;
  currentPage: number;
  lastPage: number;
  categories: Category[];
  activeCategory: string;
  activeTag: string;
  onLocalQChange: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onSortChange: (sort: SearchSort) => void;
  onPageChange: (page: number) => void;
}

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "latest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "most_voted", label: "Paling Banyak Vote" },
  { value: "most_commented", label: "Paling Banyak Komentar" },
];

export default function SearchView({
  query,
  localQ,
  posts,
  total,
  isLoading,
  isError,
  sort,
  currentPage,
  lastPage,
  activeCategory,
  activeTag,
  onLocalQChange,
  onSearch,
  onSortChange,
  onPageChange,
}: SearchViewProps) {
  const hasQuery = !!(query || activeCategory || activeTag);

  return (
    <div className="px-6 py-4">

      {/* ── Search Form ── */}
      <form onSubmit={onSearch} className="mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#babfc4]" />
            <input
              type="text"
              value={localQ}
              onChange={(e) => onLocalQChange(e.target.value)}
              placeholder="Cari pertanyaan, tag, atau pengguna..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#babfc4] rounded bg-white hover:border-[#838c95] focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium rounded transition-colors"
          >
            Cari
          </button>
        </div>
      </form>

      {/* ── Header ── */}
      {hasQuery && (
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-[#232629]">
            {query ? (
              <>Hasil pencarian: <span className="text-[#0a95ff]">&quot;{query}&quot;</span></>
            ) : activeTag ? (
              <>Pertanyaan dengan tag: <span className="text-[#39739d]">[{activeTag}]</span></>
            ) : (
              "Hasil Pencarian"
            )}
          </h1>
          {!isLoading && (
            <p className="text-sm text-[#6a737c] mt-0.5">
              <span className="font-medium text-[#232629]">{total}</span> pertanyaan ditemukan
            </p>
          )}
        </div>
      )}

      {/* ── Active filter chips ── */}
      {(activeTag || activeCategory) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-[#6a737c]">Filter aktif:</span>
          {activeTag && (
            <span className="px-2 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d]">
              tag: {activeTag}
            </span>
          )}
          <Link href="/search" className="text-xs text-[#c91d2e] hover:underline">
            Hapus filter
          </Link>
        </div>
      )}

      {/* ── Sort bar ── (hanya tampil jika ada query) */}
      {hasQuery && !isLoading && posts.length > 0 && (
        <div className="flex flex-wrap gap-px border border-[#e3e6eb] rounded overflow-hidden w-fit mb-4 text-sm">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                sort === opt.value
                  ? "bg-[#e3e6eb] text-[#232629]"
                  : "bg-white text-[#6a737c] hover:bg-[#f6f6f6]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      {!hasQuery ? (
        <EmptyState
          title="Cari Pertanyaan"
          description="Ketikkan kata kunci untuk menemukan pertanyaan yang kamu cari."
        />
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#c91d2e] justify-center">
          <AlertCircle className="w-4 h-4" />
          Terjadi kesalahan saat mencari. Coba lagi.
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Tidak ada hasil"
          description={`Tidak ada pertanyaan yang cocok dengan "${query}".`}
        />
      ) : (
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
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
