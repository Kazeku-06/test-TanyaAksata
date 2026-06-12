import Link from "next/link";
import type { Post } from "@/types";
import type { FeedType } from "./HomeLogic";
import { TrendingUp, Clock, AlertCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import PostCard from "@/components/post/PostCard";

interface HomeViewProps {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  activeFeed: FeedType;
  currentPage: number;
  lastPage: number;
  showPagination: boolean;
  onFeedChange: (feed: FeedType) => void;
  onPageChange: (page: number) => void;
}

const FEED_TABS: { key: FeedType; label: string; icon: React.ReactNode }[] = [
  { key: "latest", label: "Terbaru", icon: <Clock className="w-3.5 h-3.5" /> },
  { key: "trending", label: "Trending", icon: <TrendingUp className="w-3.5 h-3.5" /> },
];

export default function HomeView({
  posts,
  isLoading,
  isError,
  activeFeed,
  currentPage,
  lastPage,
  showPagination,
  onFeedChange,
  onPageChange,
}: HomeViewProps) {
  return (
    <div className="px-6 py-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#1e293b]">
          Pertanyaan {activeFeed === "trending" ? "Trending" : "Terbaru"}
        </h1>
        <Link
          href="/questions/ask"
          className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-blue-200/20"
        >
          Ajukan Pertanyaan
        </Link>
      </div>

      {/* Feed tabs */}
      <div className="flex items-center gap-px mb-0 border-b border-blue-100">
        {FEED_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFeedChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeFeed === tab.key
                ? "border-[#60a5fa] text-[#3b82f6]"
                : "border-transparent text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            {tab.icon}
            {tab.label}
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
          title="Belum ada pertanyaan"
          description="Jadilah yang pertama bertanya kepada komunitas."
          action={
            <Link
              href="/questions/ask"
              className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Ajukan Pertanyaan
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-blue-100">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && lastPage > 1 && !isLoading && (
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
