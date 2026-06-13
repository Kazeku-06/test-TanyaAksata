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

      {/* Search Form */}
      <form onSubmit={onSearch} className="mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              value={localQ}
              onChange={(e) => onLocalQChange(e.target.value)}
              placeholder="Cari pertanyaan, tag, atau pengguna..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg bg-white hover:border-blue-300 focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-blue-200/20"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Header */}
      {hasQuery && (
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#1e293b]">
            {query ? (
              <>Hasil pencarian: <span className="text-[#60a5fa]">&quot;{query}&quot;</span></>
            ) : activeTag ? (
              <>Pertanyaan dengan tag: <span className="text-[#60a5fa]">[{activeTag}]</span></>
            ) : (
              "Hasil Pencarian"
            )}
          </h1>
          {!isLoading && (
            <p className="text-sm text-[#64748b] mt-0.5">
              <span className="font-semibold text-[#1e293b]">{total}</span> pertanyaan ditemukan
            </p>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {(activeTag || activeCategory) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-[#64748b]">Filter aktif:</span>
          {activeTag && (
            <span className="px-2 py-0.5 text-xs rounded-md border border-blue-200 bg-blue-50 text-[#60a5fa] font-medium">
              tag: {activeTag}
            </span>
          )}
          <Link href="/search" className="text-xs text-red-600 hover:underline">
            Hapus filter
          </Link>
        </div>
      )}

      {/* Sort bar */}
      {hasQuery && !isLoading && posts.length > 0 && (
        <div className="flex flex-wrap gap-px border border-blue-200 rounded-lg overflow-hidden w-fit mb-4 text-sm">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                sort === opt.value
                  ? "bg-blue-100 text-[#3b82f6]"
                  : "bg-white text-[#64748b] hover:bg-blue-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
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
        <div className="flex items-center gap-2 py-8 text-sm text-red-600 justify-center">
          <AlertCircle className="w-4 h-4" />
          Terjadi kesalahan saat mencari. Coba lagi.
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Tidak ada hasil"
          description={`Tidak ada pertanyaan yang cocok dengan "${query}".`}
        />
      ) : (
        <div className="border border-blue-200 rounded-xl divide-y divide-blue-100 overflow-hidden">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
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
