"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Bookmark, BookmarkCheck } from "lucide-react";
import type { Post } from "@/types";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import { useMe } from "@/hooks/useAuth";
import api from "@/lib/axios";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  // Self-contained bookmark mutation — always POST toggle
  const bookmarkMutation = useMutation({
    mutationFn: async (p: Post) => {
      const { data } = await api.post(`/posts/${p.id}/bookmark`);
      const result = data.data as { is_bookmarked: boolean; bookmark_id?: string };
      return {
        is_bookmarked: result.is_bookmarked,
        bookmark_id: result.bookmark_id ?? null,
      };
    },
    onMutate: async (p) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const nextBookmarked = !p.is_bookmarked;
      queryClient.setQueriesData<any>({ queryKey: ["posts"] }, (old: any) => {
        if (!old) return old;
        if (old.data && Array.isArray(old.data)) {
          return { ...old, data: old.data.map((x: any) => x.id === p.id ? { ...x, is_bookmarked: nextBookmarked } : x) };
        }
        if (Array.isArray(old)) {
          return old.map((x: any) => x.id === p.id ? { ...x, is_bookmarked: nextBookmarked } : x);
        }
        return old;
      });
      queryClient.setQueryData<Post>(["posts", p.id], (old: Post | undefined) =>
        old ? { ...old, is_bookmarked: nextBookmarked } : old
      );
    },
    onSuccess: (res, p) => {
      const updater = (old: Post | undefined) =>
        old ? { ...old, is_bookmarked: res.is_bookmarked, bookmark_id: res.bookmark_id } : old;
      queryClient.setQueriesData<any>({ queryKey: ["posts"] }, (old: any) => {
        if (!old) return old;
        if (old.data && Array.isArray(old.data)) {
          return { ...old, data: old.data.map((x: any) => x.id === p.id ? (updater(x) ?? x) : x) };
        }
        if (Array.isArray(old)) {
          return old.map((x: any) => x.id === p.id ? (updater(x) ?? x) : x);
        }
        return old;
      });
      queryClient.setQueryData<Post>(["posts", p.id], updater);
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  function handleBookmarkClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!me) {
      router.push("/login");
      return;
    }
    bookmarkMutation.mutate(post);
  }
  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-blue-100 last:border-b-0 text-[#1e293b]">
      {/* Stats column */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1 w-[80px] pt-0.5 text-xs text-[#64748b]">
        <StatPill value={post.votes_count} label="vote" />
        <StatPill
          value={post.comments_count}
          label="jawaban"
          highlight={post.is_solved}
          accepted={post.is_solved}
        />
        <StatPill value={post.views_count} label="lihat" muted />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Title */}
          <Link
            href={`/questions/${post.id}`}
            className="text-[#60a5fa] hover:text-[#3b82f6] font-semibold text-base leading-snug block mb-1 line-clamp-2"
          >
            {post.is_solved && (
              <CheckCircle className="inline w-4 h-4 text-emerald-600 mr-1 mb-0.5" />
            )}
            {post.title}
          </Link>

          {/* Body preview */}
          <p className="text-sm text-[#64748b] line-clamp-2 mb-2">
            {post.body.replace(/<[^>]+>/g, "").slice(0, 200)}
          </p>
        </div>

        {/* Tags + Meta User */}
        <div className="flex flex-wrap items-end justify-between gap-y-2 pt-1">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/questions?tag=${tag.name}`}
                className="px-2 py-0.5 text-xs rounded-md border border-blue-200 bg-blue-50 text-[#60a5fa] hover:bg-blue-100 transition-colors font-medium"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          {/* User Meta Card */}
          <div className="flex items-center gap-1.5 text-xs text-[#64748b] ml-auto">
            <Avatar name={post.user.name} avatar={post.user.avatar} size="xs" />
            <Link
              href={`/users/${post.user.id}`}
              className="text-[#60a5fa] hover:underline font-medium"
            >
              {post.user.name}
            </Link>
            <span className="text-[#94a3b8]">{post.user.reputation}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
            <button
              onClick={handleBookmarkClick}
              aria-label={post.is_bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
              disabled={bookmarkMutation.isPending}
              className={cn(
                "flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-md transition-all duration-200",
                post.is_bookmarked
                  ? "text-white bg-[#60a5fa] shadow-sm shadow-blue-200/50"
                  : "text-[#94a3b8] hover:text-[#60a5fa] hover:bg-blue-50",
                bookmarkMutation.isPending && "opacity-50 scale-95"
              )}
            >
              {post.is_bookmarked
                ? <BookmarkCheck className="w-3.5 h-3.5" />
                : <Bookmark className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  value,
  label,
  highlight,
  accepted,
  muted,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  accepted?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-end", muted && "opacity-60")}>
      <span
        className={cn(
          "font-medium text-sm leading-tight",
          accepted
            ? "text-white bg-emerald-600 px-1.5 py-0.5 rounded text-xs"
            : highlight
            ? "text-emerald-600"
            : "text-[#1e293b]"
        )}
      >
        {formatCount(value)}
      </span>
      <span className="text-[10px]">{label}</span>
    </div>
  );
}
