"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  User,
  Report,
  AdminStatistics,
  ActivityTrend,
  ApiResponse,
  PaginatedData,
  ReportStatus,
} from "@/types";

// ── Users & Roles ───────────────────────────────────────────
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>("/admin/users");
      return data.data;
    },
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role_name,
    }: {
      userId: string;
      role_name: string;
    }) => {
      const { data } = await api.post(
        `/admin/users/${userId}/assign-role`,
        { role_name }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useRemoveRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role_name,
    }: {
      userId: string;
      role_name: string;
    }) => {
      const { data } = await api.post(
        `/admin/users/${userId}/remove-role`,
        { role_name }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ── Statistics ──────────────────────────────────────────────
export function useAdminStatistics() {
  return useQuery({
    queryKey: ["admin", "statistics"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminStatistics>>(
        "/admin/statistics"
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useActivityTrend() {
  return useQuery({
    queryKey: ["admin", "statistics", "trend"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ActivityTrend[]>>(
        "/admin/statistics/trend"
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── Admin Reports ───────────────────────────────────────────
export function useAdminReports(status?: ReportStatus, page = 1) {
  return useQuery({
    queryKey: ["admin", "reports", { status, page }],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Report>>>(
        "/admin/reports",
        { params: { status, page } }
      );
      return data.data;
    },
  });
}

export function useAdminReport(id: string) {
  return useQuery({
    queryKey: ["admin", "reports", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Report>>(
        `/admin/reports/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useAdminResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      action_taken,
      resolution_note,
    }: {
      id: string;
      action: "resolve" | "reject";
      action_taken?: string;
      resolution_note?: string;
    }) => {
      const { data } = await api.put<ApiResponse<Report>>(
        `/admin/reports/${id}/resolve`,
        { action, action_taken, resolution_note }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
}

// ── Category Management (admin/moderator) ──────────────────
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      parent_id?: string;
      sort_order?: number;
    }) => {
      const { data } = await api.post("/categories", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      description?: string;
      parent_id?: string;
      sort_order?: number;
    }) => {
      const { data } = await api.patch(`/categories/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
