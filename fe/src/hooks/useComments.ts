"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  Comment,
  ApiResponse,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "@/types";

// ── List Comments ───────────────────────────────────────────
export function useComments(postId: string) {
  return useQuery({
    queryKey: ["posts", postId, "comments"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Comment[]>>(
        `/posts/${postId}/comments`
      );
      return data.data;
    },
    enabled: !!postId,
  });
}

// ── Create Comment / Reply ──────────────────────────────────
export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCommentPayload) => {
      const { data } = await api.post<ApiResponse<Comment>>("/comments", payload);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["posts", variables.post_id, "comments"] });
      qc.invalidateQueries({ queryKey: ["posts", variables.post_id] });
    },
  });
}

// ── Update Comment ──────────────────────────────────────────
export function useUpdateComment(commentId: string, postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateCommentPayload) => {
      const { data } = await api.patch<ApiResponse<Comment>>(
        `/comments/${commentId}`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
    },
  });
}

// ── Delete Comment ──────────────────────────────────────────
export function useDeleteComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

// ── Accept Answer ───────────────────────────────────────────
export function useAcceptAnswer(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await api.post(`/comments/${commentId}/accept`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
    },
  });
}

// ── Vote Comment ────────────────────────────────────────────
export function useVoteComment(commentId: string, postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vote: 1 | -1) => {
      const { data } = await api.post(`/comments/${commentId}/vote`, { vote });
      return data.data as { votes_count: number; user_vote: 1 | -1 | null };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
    },
  });
}

// ── Like Comment ────────────────────────────────────────────
export function useLikeComment(commentId: string, postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/comments/${commentId}/like`);
      return data.data as { likes_count: number; is_liked: boolean };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId, "comments"] });
    },
  });
}
