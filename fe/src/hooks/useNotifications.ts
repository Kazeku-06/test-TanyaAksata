"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Notification, ApiResponse, PaginatedData } from "@/types";
import Cookies from "js-cookie";

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Notification>>>(
        "/notifications",
        { params: { page } }
      );
      return data.data;
    },
    enabled: !!Cookies.get("auth_token"),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Notification>>>(
        "/notifications",
        { params: { page: 1, per_page: 999, is_read: 0 } }
      );
      // Coba dari total field dulu, fallback ke filter manual
      return data.data.total ?? data.data.data.filter((n) => !n.is_read).length;
    },
    enabled: !!Cookies.get("auth_token"),
    refetchInterval: 30_000,
  });
}
