"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    onMutate: async (vote) => {
      await qc.cancelQueries({ queryKey: ["posts"] });
      const updater = (old: Post | undefined) => {
        if (!old) return old;
        const prev = old.user_vote;
        const isUnvote = prev === vote;
        return {
          ...old,
          user_vote: isUnvote ? null : vote,
          votes_count: old.votes_count + (isUnvote ? -vote : prev ? vote - prev : vote),
        };
      };
      qc.setQueriesData<import("@/types").PaginatedData<Post>>({ queryKey: ["posts"] }, (old) =>
        old && Array.isArray(old.data)
          ? { ...old, data: old.data.map((p) => (p.id === postId ? (updater(p) ?? p) : p)) }
          : old
      );
      qc.setQueryData<Post>(["posts", postId], updater);
    },
    onSuccess: (res) => {
      const updater = (old: Post | undefined) =>
        old ? { ...old, votes_count: res.votes_count, user_vote: res.user_vote } : old;
      qc.setQueriesData<import("@/types").PaginatedData<Post>>({ queryKey: ["posts"] }, (old) =>
        old && Array.isArray(old.data)
          ? { ...old, data: old.data.map((p) => (p.id === postId ? (updater(p) ?? p) : p)) }
          : old
      );
      qc.setQueryData<Post>(["posts", postId], updater);
    },
  });
}

export function useUserPostVote(postId: string, enabled = true) {
  return useQuery({
    queryKey: ["posts", postId, "user-vote"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ user_vote: 1 | -1 | null }>>(
        `/posts/${postId}/user-vote`
      );
      return data.data;
    },
    enabled: enabled && !!postId,
  });
}

// ── Like Post ───────────────────────────────────────────────
export function useLikePost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/posts/${postId}/like`);
      console.log("[useLikePost] full data:", JSON.stringify(data));
      return data.data as { likes_count: number; is_liked: boolean };
    },
    onSuccess: (res) => {
      console.log("[useLikePost] onSuccess:", res);
      qc.setQueryData(["posts", postId, "user-like"], { is_liked: res.is_liked });
      const updater = (old: Post | undefined) =>
        old ? { ...old, is_liked: res.is_liked, likes_count: res.likes_count } : old;
      qc.setQueryData<Post>(["posts", postId], updater);
      qc.setQueriesData<import("@/types").PaginatedData<Post>>({ queryKey: ["posts"] }, (old) =>
        old && Array.isArray(old.data) ? { ...old, data: old.data.map((p) => (p.id === postId ? (updater(p) ?? p) : p)) } : old
      );
    },
    onError: (err) => {
      console.error("[useLikePost] error:", err);
    },
  });
}

export function useUserPostLike(postId: string, enabled = true) {
  return useQuery({
    queryKey: ["posts", postId, "user-like"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ is_liked: boolean }>>(
        `/posts/${postId}/user-like`
      );
      console.log("[useUserPostLike]", postId, data);
      return data.data;
    },
    enabled: enabled && !!postId,
    staleTime: 1000 * 30,
  });
}

// ── Bookmark Post ───────────────────────────────────────────
export function useBookmarkPost(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/posts/${postId}/bookmark`);
      const result = data.data as { is_bookmarked: boolean; bookmark_id?: string | null };
      return {
        is_bookmarked: result.is_bookmarked,
        bookmark_id: result.bookmark_id ?? null,
      };
    },
    onMutate: async (currentPost) => {
      await qc.cancelQueries({ queryKey: ["posts"] });
      const nextBookmarked = !currentPost.is_bookmarked;
      const updater = (old: Post | undefined) =>
        old ? { ...old, is_bookmarked: nextBookmarked } : old;
      qc.setQueriesData<import("@/types").PaginatedData<Post>>({ queryKey: ["posts"] }, (old) =>
        old && Array.isArray(old.data)
          ? { ...old, data: old.data.map((p) => (p.id === postId ? (updater(p) ?? p) : p)) }
          : old
      );
      qc.setQueryData<Post>(["posts", postId], updater);
    },
    onSuccess: (res) => {
      const updater = (old: Post | undefined) =>
        old ? { ...old, is_bookmarked: res.is_bookmarked, bookmark_id: res.bookmark_id } : old;
      qc.setQueriesData<import("@/types").PaginatedData<Post>>({ queryKey: ["posts"] }, (old) =>
        old && Array.isArray(old.data)
          ? { ...old, data: old.data.map((p) => (p.id === postId ? (updater(p) ?? p) : p)) }
          : old
      );
      qc.setQueryData<Post>(["posts", postId], updater);
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

// ── Tags (ekstrak dari posts karena tidak ada dedicated /tags endpoint) ─
export function useTags(page = 1, search = "") {
  return useQuery({
    queryKey: ["tags", page, search],
    queryFn: async () => {
      // Ambil banyak posts sekaligus untuk ekstrak tag unik
      const { data } = await api.get<ApiResponse<PaginatedData<Post>>>("/posts/search", {
        params: { per_page: 200, page: 1, tag: search || undefined },
      });

      // Hitung frekuensi setiap tag
      const countMap: Record<string, { tag: import("@/types").Tag; count: number }> = {};
      for (const post of data.data.data) {
        for (const tag of post.tags) {
          if (!countMap[tag.name]) countMap[tag.name] = { tag, count: 0 };
          countMap[tag.name].count++;
        }
      }

      // Filter berdasarkan search
      let entries = Object.values(countMap);
      if (search) {
        entries = entries.filter((e) =>
          e.tag.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Sort by count desc
      entries.sort((a, b) => b.count - a.count);

      // Paginate manual (15 per page)
      const perPage = 15;
      const total = entries.length;
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      const start = (page - 1) * perPage;
      const paged = entries.slice(start, start + perPage);

      return {
        data: paged.map((e) => ({ ...e.tag, posts_count: e.count })),
        total,
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
      } as PaginatedData<import("@/types").Tag & { posts_count: number }>;
    },
    staleTime: 1000 * 60 * 5, // cache 5 menit
  });
}
