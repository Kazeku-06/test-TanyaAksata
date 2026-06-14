"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User, Badge, ApiResponse, UpdateProfilePayload, PaginatedData } from "@/types";

// ── Public profile ──────────────────────────────────────────
export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "profile"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>(`/users/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
}

export function useUsers(params: { q?: string; sort?: "reputation" | "newest"; page?: number }) {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<User>>>("/users", {
        params,
      });
      return data.data;
    },
  });
}

// ── My badges ───────────────────────────────────────────────
export function useMyBadges() {
  return useQuery({
    queryKey: ["me", "badges"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Badge[]>>("/my-badges");
      return data.data;
    },
  });
}

// ── Update profile ──────────────────────────────────────────
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      if (payload.avatar instanceof File) {
        const form = new FormData();
        // Spoffing method for Laravel to handle multipart/form-data correctly
        form.append("_method", "PATCH");
        for (const [k, v] of Object.entries(payload)) {
          if (v !== undefined && v !== null) form.append(k, v as string | Blob);
        }
        const { data } = await api.post<ApiResponse<User>>("/profile", form, {
          transformRequest: [
            (data, headers) => {
              delete headers["Content-Type"];
              delete headers.post?.["Content-Type"];
              return data;
            },
          ],
        });
        return data.data;
      }
      const { data } = await api.patch<ApiResponse<User>>("/profile", payload);
      return data.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["me"], updated);
    },
  });
}

// ── Follow / Unfollow ───────────────────────────────────────
export function useFollow(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post(`/users/${userId}/follow`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", userId, "profile"] });
      qc.invalidateQueries({ queryKey: ["me", "following"] });
      qc.invalidateQueries({ queryKey: ["users", userId, "is-following"] });
    },
  });
}

export function useUnfollow(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/users/${userId}/unfollow`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", userId, "profile"] });
      qc.invalidateQueries({ queryKey: ["me", "following"] });
      qc.invalidateQueries({ queryKey: ["users", userId, "is-following"] });
    },
  });
}

export function useIsFollowing(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "is-following"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ is_following: boolean }>>(
        `/users/${userId}/is-following`
      );
      return data.data.is_following;
    },
    enabled: !!userId,
  });
}

export function useMyFollowing() {
  return useQuery({
    queryKey: ["me", "following"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>("/users/me/following");
      return data.data;
    },
  });
}

export function useMyFollowers() {
  return useQuery({
    queryKey: ["me", "followers"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>("/users/me/followers");
      return data.data;
    },
  });
}


