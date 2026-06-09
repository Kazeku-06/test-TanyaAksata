"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  Post,
  Comment,
  Report,
  PostEditHistory,
  CommentEditHistory,
  ApiResponse,
  PaginatedData,
  ReportStatus,
} from "@/types";

// ── Trashed Posts ───────────────────────────────────────────
export function useTrashedPosts(page = 1) {
  return useQuery({
    queryKey: ["moderation", "posts", "trashed", page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Post>>>(
        "/moderation/posts/trashed",
        { params: { page } }
      );
      return data.data;
    },
  });
}

export function useTrashedPost(id: string) {
  return useQuery({
    queryKey: ["moderation", "posts", "trashed", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Post>>(
        `/moderation/posts/${id}/trashed`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function usePostEditHistory(postId: string) {
  return useQuery({
    queryKey: ["moderation", "posts", postId, "history"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PostEditHistory[]>>(
        `/moderation/posts/${postId}/history`
      );
      return data.data;
    },
    enabled: !!postId,
  });
}

// ── Trashed Comments ────────────────────────────────────────
export function useTrashedComments(page = 1) {
  return useQuery({
    queryKey: ["moderation", "comments", "trashed", page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Comment>>>(
        "/moderation/comments/trashed",
        { params: { page } }
      );
      return data.data;
    },
  });
}

export function useCommentEditHistory(commentId: string) {
  return useQuery({
    queryKey: ["moderation", "comments", commentId, "history"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CommentEditHistory[]>>(
        `/moderation/comments/${commentId}/history`
      );
      return data.data;
    },
    enabled: !!commentId,
  });
}

// ── Reports ─────────────────────────────────────────────────
export function useModerationReports(status?: ReportStatus, page = 1) {
  return useQuery({
    queryKey: ["moderation", "reports", { status, page }],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Report>>>(
        "/moderation/reports",
        { params: { status, page } }
      );
      return data.data;
    },
  });
}

export function useModerationReport(id: string) {
  return useQuery({
    queryKey: ["moderation", "reports", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Report>>(
        `/moderation/reports/${id}`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useResolveReport() {
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
        `/moderation/reports/${id}/resolve`,
        { action, action_taken, resolution_note }
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moderation", "reports"] });
    },
  });
}

// ── User Moderation ─────────────────────────────────────────
export function useWarnUser() {
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { data } = await api.post(`/moderation/users/${userId}/warn`, { reason });
      return data;
    },
  });
}

export function useBanUser() {
  return useMutation({
    mutationFn: async ({
      userId,
      days = 30,
      reason,
    }: {
      userId: string;
      days?: number;
      reason?: string;
    }) => {
      const { data } = await api.post(`/moderation/users/${userId}/ban`, {
        days,
        reason,
      });
      return data;
    },
  });
}

export function useUnbanUser() {
  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason?: string;
    }) => {
      const { data } = await api.post(`/moderation/users/${userId}/unban`, {
        reason,
      });
      return data;
    },
  });
}
