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
          {canAsk ? (
            <Link
              href="/questions/ask"
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-sm transition-colors duration-150 hover:bg-[var(--primary-hover)]"
            >
              Ajukan Pertanyaan
            </Link>
          ) : (
            <div className="group relative">
              <span className="inline-flex items-center justify-center rounded-2xl bg-[#babfc4] px-5 py-3 text-sm font-semibold text-white cursor-not-allowed opacity-60">
                Ajukan Pertanyaan
              </span>
              <div className="absolute right-0 top-full mt-2 hidden w-56 rounded-lg border border-[#e3e6eb] bg-white p-3 text-xs text-[#525960] shadow-md group-hover:block z-10">
                Butuh minimal <span className="font-semibold text-[#232629]">20 poin reputasi</span> untuk membuat postingan.
              </div>
            </div>
          )}
        </div>

        {(activeTag || activeCategory) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#525960]">
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
      </div>

      {/* Sort bar */}
      <div className="mb-4 flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 shadow-sm">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg my-1.5 transition-all duration-150 ${
              sort === option.value
                ? "bg-[var(--primary-light)] text-[var(--primary)]"
                : "text-[#525960] hover:text-[#232629] hover:bg-slate-50"
            }`}
          >
            {option.icon}
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
            canAsk ? (
              <Link
                href="/questions/ask"
                className="inline-flex rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold !text-white shadow-sm transition-colors duration-150 hover:bg-[var(--primary-hover)]"
              >
                Ajukan Pertanyaan
              </Link>
            ) : undefined
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
