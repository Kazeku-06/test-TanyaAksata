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
    <div className="w-full bg-white font-sans text-[#232629]">
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-normal text-[#232629]">
            {feed === "latest" ? "Semua Pertanyaan" : "Pertanyaan Terpopuler"}
          </h1>
          <p className="text-[13px] text-[#4a4e51]">
            {totalQuestions.toLocaleString()} pertanyaan
          </p>
        </div>

        <a
          href="/questions/ask"
          className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-[13px] font-medium px-3 py-2.5 rounded shadow-sm text-center transition-colors whitespace-nowrap"
        >
          Ajukan Pertanyaan
        </a>
      </div>

      {/* FILTER BUTTON GROUP */}
      <div className="flex items-center justify-end px-6 pb-3 border-b border-[#e3e6eb]">
        <div className="inline-flex rounded border border-[#838c95] overflow-hidden text-[12px]">
          {(["latest", "trending"] as FeedType[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFeed(f);
                setPage(1);
              }}
              className={`px-3 py-1.5 font-normal transition-colors border-r border-[#838c95] last:border-r-0 ${
                feed === f
                  ? "bg-[#e3e6eb] text-[#3b4045] font-medium"
                  : "bg-white text-[#6a737c] hover:bg-[#f8f9f9] hover:text-[#3b4045]"
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
                className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              >
                Ajukan Pertanyaan
              </a>
            }
          />
        </div>
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