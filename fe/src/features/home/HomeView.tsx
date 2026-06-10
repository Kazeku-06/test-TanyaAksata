import Link from "next/link";
import type { Post } from "@/types";
import type { FeedType } from "./HomeLogic";
import { TrendingUp, Clock, AlertCircle } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import PostCard from "@/components/post/PostCard";

// Props yang diterima HomeView dari HomeLogic
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

// Tab config untuk DRY
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
        <h1 className="text-xl font-semibold text-[#232629]">
          Pertanyaan {activeFeed === "trending" ? "Trending" : "Terbaru"}
        </h1>
        <Link
          href="/questions/ask"
          className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium px-3 py-2 rounded transition-colors"
        >
          Ajukan Pertanyaan
        </Link>
      </div>

      {/* Feed tabs */}
      <div className="flex items-center gap-px mb-0 border-b border-[#e3e6eb]">
        {FEED_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFeedChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeFeed === tab.key
                ? "border-[#f48024] text-[#3b4045]"
                : "border-transparent text-[#6a737c] hover:text-[#3b4045]"
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
        <div className="flex items-center gap-2 py-8 text-sm text-[#c91d2e] justify-center">
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
              className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              Ajukan Pertanyaan
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-[#e3e6eb]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination — hanya untuk tab latest */}
      {showPagination && lastPage > 1 && !isLoading && (
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
