"use client";

import { useState } from "react";
import { usePosts, useTrendingPosts } from "@/hooks/usePosts";
import HomeView from "./HomeView";

// FeedType: tab yang aktif di halaman home
export type FeedType = "latest" | "trending";

// HomeLogic — mengelola state halaman home
// - Tab aktif (latest/trending)
// - Paginasi untuk latest posts
// - Fetch data dari API
export default function HomeLogic() {
  const [activeFeed, setActiveFeed] = useState<FeedType>("latest");
  const [page, setPage] = useState(1);

  // Fetch latest posts — paginasi 10/halaman
  const {
    data: latestData,
    isLoading: isLatestLoading,
    isError: isLatestError,
  } = usePosts(page);

  // Fetch trending posts — top 15
  const {
    data: trendingPosts,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
  } = useTrendingPosts(15);

  // Tentukan data dan state loading berdasarkan tab aktif
  const posts = activeFeed === "latest" ? latestData?.data : trendingPosts;
  const isLoading = activeFeed === "latest" ? isLatestLoading : isTrendingLoading;
  const isError = activeFeed === "latest" ? isLatestError : isTrendingError;

  // Paginasi hanya untuk tab latest
  const currentPage = latestData?.current_page ?? 1;
  const lastPage = latestData?.last_page ?? 1;

  // Handler ganti tab — reset halaman ke 1
  function handleFeedChange(feed: FeedType) {
    setActiveFeed(feed);
    setPage(1);
  }

  // Handler ganti halaman
  function handlePageChange(newPage: number) {
    setPage(newPage);
    // Scroll ke atas saat ganti halaman
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <HomeView
      posts={posts ?? []}
      isLoading={isLoading}
      isError={isError}
      activeFeed={activeFeed}
      currentPage={currentPage}
      lastPage={lastPage}
      showPagination={activeFeed === "latest"}
      onFeedChange={handleFeedChange}
      onPageChange={handlePageChange}
    />
  );
}
