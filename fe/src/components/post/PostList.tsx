"use client";

import { usePosts, useTrendingPosts } from "@/hooks/usePosts";
import PostCard from "./PostCard";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useState } from "react";

type FeedType = "latest" | "trending";

export default function PostList() {
  const [page, setPage] = useState(1);
  const [feed, setFeed] = useState<FeedType>("latest");

  const { data: latestData, isLoading: latestLoading } = usePosts(page);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingPosts(15);

  const isLoading = feed === "latest" ? latestLoading : trendingLoading;
  const posts = feed === "latest" ? latestData?.data : trendingData;
  const paginatedData = feed === "latest" ? latestData : null;

  const totalQuestions = feed === "latest" ? latestData?.total || posts?.length || 0 : posts?.length || 0;

  return (
    <div className="w-full bg-white font-sans text-[#1e293b]">
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#1e293b]">
            {feed === "latest" ? "Semua Pertanyaan" : "Pertanyaan Terpopuler"}
          </h1>
          <p className="text-[13px] text-[#475569]">
            {totalQuestions.toLocaleString()} pertanyaan
          </p>
        </div>

        <a
          href="/questions/ask"
          className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-blue-200/20 text-center transition-colors whitespace-nowrap"
        >
          Ajukan Pertanyaan
        </a>
      </div>

      {/* FILTER BUTTON GROUP */}
      <div className="flex items-center justify-end px-6 pb-3 border-b border-blue-100">
        <div className="inline-flex rounded-lg border border-blue-200 overflow-hidden text-[12px]">
          {(["latest", "trending"] as FeedType[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFeed(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 font-medium transition-colors border-r border-blue-200 last:border-r-0 ${
                feed === f
                  ? "bg-blue-100 text-[#3b82f6] font-semibold"
                  : "bg-white text-[#64748b] hover:bg-blue-50 hover:text-[#1e293b]"
              }`}
            >
              {f === "latest" ? "Terbaru" : "Trending"}
            </button>
          ))}
        </div>
      </div>

      {/* POST LIST CONTENT */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Spinner size="lg" />
        </div>
      ) : !posts?.length ? (
        <div className="px-6 py-8">
          <EmptyState
            title="Belum ada pertanyaan"
            description="Jadilah yang pertama bertanya kepada komunitas."
            action={
              <a
                href="/questions/ask"
                className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Ajukan Pertanyaan
              </a>
            }
          />
        </div>
      ) : (
        <div className="divide-y divide-blue-100 border-b border-blue-100">
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
