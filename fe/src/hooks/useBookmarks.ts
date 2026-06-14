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
