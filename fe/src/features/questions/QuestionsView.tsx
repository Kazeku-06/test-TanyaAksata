import Link from "next/link";
import type { Post, Category } from "@/types";
import type { SortOption } from "./QuestionsLogic";
import { AlertCircle, Clock, CalendarDays, ThumbsUp, MessageSquare } from "lucide-react";
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
  canAsk: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "latest",         label: "Terbaru",                icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "oldest",         label: "Terlama",                icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { value: "most_voted",     label: "Paling Banyak Vote",     icon: <ThumbsUp className="w-3.5 h-3.5" /> },
  { value: "most_commented", label: "Paling Banyak Komentar", icon: <MessageSquare className="w-3.5 h-3.5" /> },
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
  canAsk,
}: QuestionsViewProps) {
  return (
    <div className="px-6 py-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">
            {activeTag
              ? `Pertanyaan: [${activeTag}]`
              : activeCategory
              ? "Pertanyaan per Kategori"
              : "Semua Pertanyaan"}
          </h1>
          {!isLoading && (
            <p className="text-sm text-[#64748b] mt-0.5">
              <span className="font-semibold text-[#1e293b]">{total}</span> pertanyaan
            </p>
          )}
        </div>
        <Link
          href="/questions/ask"
          className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-blue-200/20"
        >
          Ajukan Pertanyaan
        </Link>
      </div>

      {/* Active filters badge */}
      {(activeTag || activeCategory) && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[#64748b]">Filter aktif:</span>
          {activeTag && (
            <span className="px-2 py-0.5 text-xs rounded-md border border-blue-200 bg-blue-50 text-[#60a5fa] font-medium">
              tag: {activeTag}
            </span>
          )}
          <Link
            href="/questions"
            className="text-xs text-red-600 hover:underline"
          >
            Hapus filter
          </Link>
        </div>
      )}

      {/* Sort tabs */}
      <div className="flex flex-wrap gap-px border border-blue-200 rounded-lg overflow-hidden w-fit mb-4 text-sm">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1.5 font-medium transition-colors ${
              sort === option.value
                ? "bg-blue-100 text-[#3b82f6]"
                : "bg-white text-[#64748b] hover:bg-blue-50"
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
        <div className="flex items-center gap-2 py-8 text-sm text-red-600 justify-center">
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
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Ajukan Pertanyaan
            </Link>
          }
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
        <div className="flex justify-center py-4 border-t border-blue-100 mt-2">
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
