"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearchPosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import type { PostSearchParams } from "@/types";
import SearchView from "./SearchView";

export type SearchSort = "latest" | "oldest" | "most_voted" | "most_commented";

export default function SearchLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil semua param dari URL
  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("category_id") ?? "";
  const tag = searchParams.get("tag") ?? "";

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SearchSort>(
    (searchParams.get("sort") as SearchSort) ?? "latest"
  );
  const [localQ, setLocalQ] = useState(q);

  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setPage(1);
    setLocalQ(q);
  }

  const searchQuery: PostSearchParams = {
    q: q || undefined,
    category_id: categoryId || undefined,
    tag: tag || undefined,
    sort,
    page,
  };

  const { data, isLoading, isError } = useSearchPosts(searchQuery);
  const { data: categories } = useCategories(true);

  const posts = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;

  // Update URL saat submit form search baru
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!localQ.trim()) return;
    const params = new URLSearchParams();
    params.set("q", localQ.trim());
    if (sort !== "latest") params.set("sort", sort);
    router.push(`/search?${params.toString()}`);
    setPage(1);
  }

  function handleSortChange(newSort: SearchSort) {
    setSort(newSort);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <SearchView
      query={q}
      localQ={localQ}
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
      onLocalQChange={setLocalQ}
      onSearch={handleSearch}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
    />
  );
}
