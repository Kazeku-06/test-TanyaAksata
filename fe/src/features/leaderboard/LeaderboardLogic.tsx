"use client";

import { useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import LeaderboardView from "./LeaderboardView";

export default function LeaderboardLogic() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useLeaderboard(page);

  const entries = data?.data ?? [];
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <LeaderboardView
      entries={entries}
      total={total}
      isLoading={isLoading}
      isError={isError}
      currentPage={currentPage}
      lastPage={lastPage}
      onPageChange={handlePageChange}
    />
  );
}
