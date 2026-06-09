"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User, Badge, ApiResponse, UpdateProfilePayload } from "@/types";

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
      // Use FormData when avatar file is included
      if (payload.avatar instanceof File) {
        const form = new FormData();
        for (const [k, v] of Object.entries(payload)) {
          if (v !== undefined && v !== null) form.append(k, v as string | Blob);
        }
        const { data } = await api.patch<ApiResponse<User>>("/profile", form, {
          headers: { "Content-Type": "multipart/form-data" },
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
