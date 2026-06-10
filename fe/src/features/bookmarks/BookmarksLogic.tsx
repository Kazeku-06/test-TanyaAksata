"use client";

import { useState } from "react";
import { useBookmarks, useDeleteBookmark } from "@/hooks/useBookmarks";
import BookmarksView from "./BookmarksView";

export default function BookmarksLogic() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useBookmarks(page);
  const { mutate: deleteBookmark, isPending: isDeleting } = useDeleteBookmark();

  const bookmarks = data?.data ?? [];
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  function handleDelete(bookmarkId: string) {
    if (!confirm("Hapus bookmark ini?")) return;
    deleteBookmark(bookmarkId);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <BookmarksView
      bookmarks={bookmarks}
      total={total}
      isLoading={isLoading}
      isError={isError}
      isDeleting={isDeleting}
      currentPage={currentPage}
      lastPage={lastPage}
      onDelete={handleDelete}
      onPageChange={handlePageChange}
    />
  );
}
