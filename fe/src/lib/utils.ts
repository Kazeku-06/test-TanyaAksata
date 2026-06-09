import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format relative time (e.g. "3 hours ago") */
export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) return `${diffSecs} detik yang lalu`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} hari yang lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} tahun yang lalu`;
}

/** Format number with K/M suffix */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Get avatar URL or fallback to initials-based URL */
export function getAvatarUrl(avatar: string | null | undefined, name: string): string {
  if (avatar) {
    const base = process.env.NEXT_PUBLIC_STORAGE_URL;
    return `${base}/${avatar}`;
  }
  // Use UI Avatars as fallback
  const encoded = encodeURIComponent(name || "?");
  return `https://ui-avatars.com/api/?name=${encoded}&background=e1ecf4&color=0a95ff&size=64`;
}

/** Extract error message from axios error */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || "Terjadi kesalahan";
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan";
}

/** Reputation level label */
export function getReputationLevel(reputation: number): string {
  if (reputation >= 2000) return "Expert";
  if (reputation >= 500) return "Pro";
  if (reputation >= 100) return "Regular";
  return "Newbie";
}
