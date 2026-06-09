"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  Post,
  ApiResponse,
  PaginatedData,
  CreatePostPayload,
  UpdatePostPayload,
  PostSearchParams,
} from "@/types";

// ── List Posts ──────────────────────────────────────────────
export function usePosts(page = 1) {
  return useQuery({
    queryKey: ["posts", page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Post>>>("/posts", {
        params: { page },
      });
      return data.data;
    },
  });
}

// ── Trending Posts ──────────────────────────────────────────
export function useTrendingPosts(limit = 10) {
  return useQuery({
    queryKey: ["posts", "trending", limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Post[]>>("/posts/trending", {
        params: { limit },
      });
      return data.data;
    },
  });
}

// ── Search Posts ────────────────────────────────────────────
export function useSearchPosts(params: PostSearchParams) {
  return useQuery({
    queryKey: ["posts", "search", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Post>>>("/posts/search", {
        params,
      });
      return data.data;
    },
    enabled: !!(params.q || params.category_id || params.tag || params.user_id),
  });
}

// ── Post Detail ─────────────────────────────────────────────
export function usePost(id: string) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Post>>(`/posts/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ── Posts by User ───────────────────────────────────────────
export function useUserPosts(userId: string, page = 1) {
  return useQuery({
    queryKey: ["users", userId, "posts", page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Post>>>(
        `/users/${userId}/posts`,
        { params: { page } }
      );
      return data.data;
    },
    enabled: !!userId,
  });
}

// ── Create Post ─────────────────────────────────────────────
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const { data } = await api.post<ApiResponse<Post>>("/posts", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ── Update Post ─────────────────────────────────────────────
export function useUpdatePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePostPayload) => {
      const { data } = await api.patch<ApiResponse<Post>>(`/posts/${postId}`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ── Delete Post ─────────────────────────────────────────────
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ── Vote Post ───────────────────────────────────────────────
export function useVotePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vote: 1 | -1) => {
      const { data } = await api.post(`/posts/${postId}/vote`, { vote });
      return data.data as { votes_count: number; user_vote: 1 | -1 | null };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

// ── Like Post ───────────────────────────────────────────────
export function useLikePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/posts/${postId}/like`);
      return data.data as { likes_count: number; is_liked: boolean };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
    },
  });
}

// ── Bookmark Post ───────────────────────────────────────────
export function useBookmarkPost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/posts/${postId}/bookmark`);
      return data.data as { is_bookmarked: boolean };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", postId] });
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
