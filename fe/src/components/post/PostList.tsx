"use client";

import { usePosts, useTrendingPosts } from "@/hooks/usePosts";
import PostCard from "./PostCard";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useState } from "react";
import Link from "next/link";

type FeedType = "latest" | "trending";

export default function PostList() {
  const [page, setPage] = useState(1);
  const [feed, setFeed] = useState<FeedType>("latest");

  const { data: latestData, isLoading: latestLoading } = usePosts(page);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingPosts(15);

  const isLoading = feed === "latest" ? latestLoading : trendingLoading;
  const posts = feed === "latest" ? latestData?.data : trendingData;
  const paginatedData = feed === "latest" ? latestData : null;

  return (
    <div>
      {/* Feed tabs */}
      <div className="flex items-center gap-px mb-0 border-b border-[#e3e6eb]">
        {(["latest", "trending"] as FeedType[]).map((f) => (
          <button
            key={f}
            onClick={() => { setFeed(f); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 -mb-px ${
              feed === f
                ? "border-[#f48024] text-[#232629]"
                : "border-transparent text-[#525960] hover:text-[#232629] hover:bg-slate-50"
            }`}
          >
            {f === "latest" ? "Terbaru" : "Trending"}
          </button>
        ))}
      </div>

      {/* POST LIST CONTENT */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner size="lg" />
        </div>
      ) : !posts?.length ? (
        <EmptyState
          title="Belum ada pertanyaan"
          description="Jadilah yang pertama bertanya kepada komunitas."
          action={
            <Link
              href="/questions/ask"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium px-4 py-2 rounded transition-colors"
            >
              Ajukan Pertanyaan
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-[#e3e6eb] border-b border-[#e3e6eb]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {feed === "latest" && paginatedData && paginatedData.last_page > 1 && (
        <div className="flex justify-end px-6 py-6 bg-white">
          <Pagination
            currentPage={paginatedData.current_page}
            lastPage={paginatedData.last_page}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}