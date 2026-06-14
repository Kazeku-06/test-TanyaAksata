"use client";

import { useState } from "react";
import { useTags } from "@/hooks/usePosts";
import TagsView from "./TagsView";

export default function TagsLogic() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search 400ms
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    clearTimeout((handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  }

  const { data, isLoading, isError } = useTags(page, debouncedSearch);

  const tags = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;

  return (
    <TagsView
      tags={tags}
      total={total}
      isLoading={isLoading}
      isError={isError}
      search={search}
      currentPage={page}
      lastPage={lastPage}
      onSearchChange={handleSearchChange}
      onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
    />
  );
}
