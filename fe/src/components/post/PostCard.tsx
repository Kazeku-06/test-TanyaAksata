"use client";

import Link from "next/link";
import { CheckCircle, MessageSquare, Eye, ThumbsUp, Bookmark } from "lucide-react";
import type { Post } from "@/types";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors border-b border-[#e3e6eb] last:border-b-0">
      {/* Stats column */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1 w-[80px] pt-0.5 text-xs text-[#6a737c]">
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
      <div className="flex-1 min-w-0">
        {/* Title */}
        <Link
          href={`/questions/${post.id}`}
          className="text-[#0074cc] hover:text-[#0a95ff] font-medium text-base leading-snug block mb-1 line-clamp-2"
        >
          {post.is_solved && (
            <CheckCircle className="inline w-4 h-4 text-[#2e6d44] mr-1 mb-0.5" />
          )}
          {post.title}
        </Link>

        {/* Body preview */}
        <p className="text-sm text-[#6a737c] line-clamp-2 mb-2">
          {post.body.replace(/<[^>]+>/g, "").slice(0, 200)}
        </p>

        {/* Tags + meta */}
        <div className="flex flex-wrap items-center justify-between gap-y-1">
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/questions?tag=${tag.name}`}
                className="px-1.5 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d] hover:bg-[#d0e3f0] transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6a737c]">
            <Avatar name={post.user?.name || "Deleted"} avatar={post.user?.avatar} size="xs" />
            {post.user ? (
              <Link
                href={`/users/${post.user.id}`}
                className="text-[#0074cc] hover:underline font-medium"
              >
                {post.user.name}
              </Link>
            ) : (
              <span className="italic">Deleted User</span>
            )}
            <span className="text-[#9199a1]">{post.user?.reputation ?? 0}</span>
            <span>·</span>
            <span>{timeAgo(post.created_at)}</span>
            {post.is_bookmarked && (
              <Bookmark className="w-3 h-3 text-[#f48024] fill-[#f48024]" />
            )}
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
    <div
      className={cn(
        "flex flex-col items-end",
        muted && "opacity-60"
      )}
    >
      <span
        className={cn(
          "font-medium text-sm leading-tight",
          accepted
            ? "text-white bg-[#2e6d44] px-1.5 py-0.5 rounded text-xs"
            : highlight
            ? "text-[#2e6d44]"
            : "text-[#232629]"
        )}
      >
        {formatCount(value)}
      </span>
      <span className="text-[10px]">{label}</span>
    </div>
  );
}
