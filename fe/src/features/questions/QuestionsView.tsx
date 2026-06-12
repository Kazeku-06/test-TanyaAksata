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
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#232629] tracking-tight">
              {activeTag
                ? `Pertanyaan: [${activeTag}]`
                : activeCategory
                  ? "Pertanyaan per Kategori"
                  : "Semua Pertanyaan"}
            </h1>
            {!isLoading && (
              <p className="text-sm text-[#525960] mt-2">
                <span className="font-semibold text-[#232629]">{total}</span>{" "}
                pertanyaan
              </p>
            )}
          </div>
          <Link
            href="/questions/ask"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-sm transition-colors duration-150 hover:bg-[var(--primary-hover)]"
          >
            Ajukan Pertanyaan
          </Link>
        </div>

        {(activeTag || activeCategory) && (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#525960]">
            <span className="font-medium text-[#232629]">Filter aktif:</span>
            {activeTag && (
              <span className="rounded-full border border-[var(--primary-light)] bg-[var(--primary-light)] px-3 py-1 text-[var(--primary)] font-medium">
                tag: {activeTag}
              </span>
            )}
            <Link
              href="/questions"
              className="rounded-full px-3 py-1 text-sm text-[var(--danger)] transition-colors duration-150 hover:bg-[#fee2e2] font-medium"
            >
              Hapus filter
            </Link>
          </div>
        )}

        <div className="mt-6 inline-flex flex-wrap gap-2 rounded-full bg-[var(--primary-light)] p-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
                sort === option.value
                  ? "bg-[var(--primary)] !text-white shadow-sm"
                  : "text-[#232629] hover:bg-white/80 hover:text-[var(--primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#ef4444] justify-center">
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
              className="inline-flex rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-sm transition-colors duration-150 hover:bg-[var(--primary-hover)]"
            >
              Ajukan Pertanyaan
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
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
