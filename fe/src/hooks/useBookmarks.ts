"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Bookmark, ApiResponse, PaginatedData } from "@/types";
import Cookies from "js-cookie";

export function useBookmarks(page = 1) {
  return useQuery({
    queryKey: ["bookmarks", page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Bookmark>>>(
        "/bookmarks",
        { params: { page } }
      );
      return data.data;
    },
    enabled: !!Cookies.get("auth_token"),
  });
}

// Fetch ALL bookmarks (no pagination) untuk sync status is_bookmarked di PostCard
export function useMyBookmarkIds() {
  return useQuery({
    queryKey: ["bookmarks", "all-ids"],
    queryFn: async () => {
      // Ambil semua bookmark (per_page besar)
      const { data } = await api.get<ApiResponse<PaginatedData<Bookmark>>>(
        "/bookmarks",
        { params: { per_page: 999 } }
      );
      // Return Map: post_id → bookmark_id
      const map: Record<string, string> = {};
      for (const b of data.data.data) {
        map[b.post_id] = b.id;
      }
      return map;
    },
    enabled: !!Cookies.get("auth_token"),
    staleTime: 1000 * 30,
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookmarkId: string) => {
      await api.delete(`/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
