import Link from "next/link";
import type { Post, Category } from "@/types";
import type { SortOption } from "./QuestionsLogic";
import { AlertCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import PostCard from "@/components/post/PostCard";

interface QuestionsViewProps {
  posts: Post[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  sort: SortOption;
  currentPage: number;
  lastPage: number;
  categories: Category[];
  activeCategory: string;
  activeTag: string;
  onSortChange: (sort: SortOption) => void;
  onPageChange: (page: number) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "most_voted", label: "Paling Banyak Vote" },
  { value: "most_commented", label: "Paling Banyak Komentar" },
];

export default function QuestionsView({
  posts,
  total,
  isLoading,
  isError,
  sort,
  currentPage,
  lastPage,
  activeCategory,
  activeTag,
  onSortChange,
  onPageChange,
}: QuestionsViewProps) {
  return (
    <div className="px-6 py-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#232629]">
            {activeTag
              ? `Pertanyaan: [${activeTag}]`
              : activeCategory
              ? "Pertanyaan per Kategori"
              : "Semua Pertanyaan"}
          </h1>
          {!isLoading && (
            <p className="text-sm text-[#6a737c] mt-0.5">
              <span className="font-medium text-[#232629]">{total}</span> pertanyaan
            </p>
          )}
        </div>
        <Link
          href="/questions/ask"
          className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium px-3 py-2 rounded transition-colors"
        >
          Ajukan Pertanyaan
        </Link>
      </div>

      {/* Active filters badge */}
      {(activeTag || activeCategory) && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[#6a737c]">Filter aktif:</span>
          {activeTag && (
            <span className="px-2 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d]">
              tag: {activeTag}
            </span>
          )}
          <Link
            href="/questions"
            className="text-xs text-[#c91d2e] hover:underline"
          >
            Hapus filter
          </Link>
        </div>
      )}

      {/* Sort tabs */}
      <div className="flex flex-wrap gap-px border border-[#e3e6eb] rounded overflow-hidden w-fit mb-4 text-sm">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1.5 font-medium transition-colors ${
              sort === option.value
                ? "bg-[#e3e6eb] text-[#232629]"
                : "bg-white text-[#6a737c] hover:bg-[#f6f6f6]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#c91d2e] justify-center">
          <AlertCircle className="w-4 h-4" />
          Gagal memuat pertanyaan. Coba refresh halaman.
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Tidak ada pertanyaan"
          description={
            activeTag || activeCategory
              ? "Tidak ada pertanyaan dengan filter ini."
              : "Belum ada pertanyaan. Jadilah yang pertama!"
          }
          action={
            <Link
              href="/questions/ask"
              className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium px-4 py-2 rounded"
            >
              Ajukan Pertanyaan
            </Link>
          }
        />
      ) : (
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && !isLoading && (
        <div className="flex justify-center py-4 border-t border-[#e3e6eb] mt-2">
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
