"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePosts, useSearchPosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import type { PostSearchParams } from "@/types";
import QuestionsView from "./QuestionsView";

export type SortOption = "latest" | "oldest" | "most_voted" | "most_commented";

export default function QuestionsLogic() {
  const searchParams = useSearchParams();

  // Ambil filter dari URL query string
  const categoryId = searchParams?.get("category_id") ?? "";
  const tag = searchParams?.get("tag") ?? "";

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("latest");

  // Jika ada filter aktif (category/tag) → pakai search endpoint
  // Jika tidak → pakai list endpoint biasa
  const hasFilter = !!(categoryId || tag);

  const searchQuery: PostSearchParams = {
    category_id: categoryId || undefined,
    tag: tag || undefined,
    sort,
    page,
  };

  const {
    data: allPostsData,
    isLoading: isAllLoading,
    isError: isAllError,
  } = usePosts(page);

  const {
    data: filteredData,
    isLoading: isFilterLoading,
    isError: isFilterError,
  } = useSearchPosts(searchQuery);

  const { data: categories } = useCategories(true);

  // Pilih data yang tepat berdasarkan ada/tidaknya filter
  const paginatedData = hasFilter ? filteredData : allPostsData;
  const isLoading = hasFilter ? isFilterLoading : isAllLoading;
  const isError = hasFilter ? isFilterError : isAllError;

  const posts = paginatedData?.data ?? [];
  const total = paginatedData?.total ?? 0;
  const currentPage = paginatedData?.current_page ?? 1;
  const lastPage = paginatedData?.last_page ?? 1;

  function handleSortChange(newSort: SortOption) {
    setSort(newSort);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <QuestionsView
      posts={posts}
      total={total}
      isLoading={isLoading}
      isError={isError}
      sort={sort}
      currentPage={currentPage}
      lastPage={lastPage}
      categories={categories ?? []}
      activeCategory={categoryId}
      activeTag={tag}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
    />
  );
}
