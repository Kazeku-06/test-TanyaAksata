import Link from "next/link";
import type { Bookmark } from "@/types";
import { timeAgo } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { Bookmark as BookmarkIcon, Trash2, AlertCircle, Tag } from "lucide-react";

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  isDeleting: boolean;
  currentPage: number;
  lastPage: number;
  onDelete: (bookmarkId: string) => void;
  onPageChange: (page: number) => void;
}

export default function BookmarksView({
  bookmarks,
  total,
  isLoading,
  isError,
  isDeleting,
  currentPage,
  lastPage,
  onDelete,
  onPageChange,
}: BookmarksViewProps) {
  return (
    <div className="px-6 py-4">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookmarkIcon className="w-5 h-5 text-[#60a5fa]" />
        <h1 className="text-xl font-bold text-[#1e293b]">Bookmark Saya</h1>
        {!isLoading && (
          <span className="text-sm text-[#64748b]">({total} item)</span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 py-8 text-sm text-red-600 justify-center">
          <AlertCircle className="w-4 h-4" />
          Gagal memuat bookmark.
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title="Belum ada bookmark"
          description="Bookmark pertanyaan yang ingin kamu simpan untuk dibaca nanti."
        />
      ) : (
        <div className="border border-blue-200 rounded-xl divide-y divide-blue-100 overflow-hidden">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="p-4 hover:bg-blue-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3">

                {/* Post info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/questions/${bookmark.post_id}`}
                    className="font-semibold text-[#60a5fa] hover:text-[#3b82f6] text-sm block mb-1 line-clamp-2"
                  >
                    {bookmark.post.title}
                  </Link>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748b]">
                    <span>{bookmark.post.category?.name}</span>
                    <span>·</span>
                    <span>oleh {bookmark.post.user.name}</span>
                    <span>·</span>
                    <span>disimpan {timeAgo(bookmark.created_at)}</span>
                  </div>

                  {/* Tags */}
                  {bookmark.post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bookmark.post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag.id}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-md border border-blue-200 bg-blue-50 text-[#60a5fa] font-medium"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDelete(bookmark.id)}
                  disabled={isDeleting}
                  aria-label="Hapus bookmark"
                  className="flex-shrink-0 p-1.5 text-[#94a3b8] hover:text-red-600 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

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
