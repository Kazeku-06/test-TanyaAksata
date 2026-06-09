"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { LeaderboardEntry, ApiResponse, PaginatedData } from "@/types";

export function useLeaderboard(page = 1) {
  return useQuery({
    queryKey: ["leaderboard", page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<LeaderboardEntry>>>(
        "/leaderboard",
        { params: { page } }
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
