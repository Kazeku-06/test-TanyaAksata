"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Category, ApiResponse } from "@/types";

export function useCategories(flat = false) {
  return useQuery({
    queryKey: ["categories", { flat }],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category[]>>("/categories", {
        params: flat ? { flat: 1 } : undefined,
      });
      return data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes — categories don't change often
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
