"use client";

import Link from "next/link";
import { CheckCircle, Bookmark } from "lucide-react";
import type { Post } from "@/types";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
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
            {post.is_bookmarked && (
              <Bookmark className="w-3 h-3 text-[#60a5fa] fill-[#60a5fa]" />
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
