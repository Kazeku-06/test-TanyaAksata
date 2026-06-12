"use client";

import Link from "next/link";
import {
  CheckCircle,
  MessageSquare,
  Eye,
  ThumbsUp,
  Bookmark,
} from "lucide-react";
import type { Post } from "@/types";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex-shrink-0 grid gap-2 text-[#64748b] text-sm w-full lg:w-[128px]">
          <StatChip
            icon={<ThumbsUp className="w-4 h-4" />}
            value={post.votes_count}
            label="Votes"
          />
          <StatChip
            icon={<MessageSquare className="w-4 h-4" />}
            value={post.comments_count}
            label="Jawaban"
            highlight={post.is_solved}
          />
          <StatChip
            icon={<Eye className="w-4 h-4" />}
            value={post.views_count}
            label="Views"
            muted
          />
        </div>

        <div className="flex-1 min-w-0">
          <Link
            href={`/questions/${post.id}`}
            className="inline-flex items-center gap-2 text-[#232629] hover:text-[var(--primary)] font-semibold text-xl leading-7 transition-colors line-clamp-2"
          >
            {post.is_solved && (
              <CheckCircle className="w-5 h-5 text-[#16a34a]" />
            )}
            {post.title}
          </Link>

          <p className="mt-3 text-sm leading-6 text-[#232629] line-clamp-2">
            {post.body.replace(/<[^>]+>/g, "").slice(0, 220)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/questions?tag=${tag.name}`}
                className="rounded-full border border-[var(--primary-light)] bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)] transition duration-200 hover:bg-[#d0e3f1]"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#525960]">
            <Avatar
              name={post.user?.name || "Deleted"}
              avatar={post.user?.avatar}
              size="sm"
            />
            {post.user ? (
              <>
                <Link
                  href={`/users/${post.user.id}`}
                  className="font-medium text-[var(--text-link)] hover:text-[var(--primary)]"
                >
                  {post.user.name}
                </Link>
                <span className="text-[#9199a1]">·</span>
                <span className="text-[#232629] font-medium">{post.user.reputation ?? 0}</span>
                <span className="text-[#525960]"> reputasi</span>
              </>
            ) : (
              <span className="italic text-[#525960]">Deleted User</span>
            )}
            <span className="text-[#9199a1]">·</span>
            <span className="text-[#525960]">{timeAgo(post.created_at)}</span>
            {post.is_bookmarked && (
              <Bookmark className="w-4 h-4 text-[#f97316]" />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatChip({
  icon,
  value,
  label,
  highlight,
  muted,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-3 py-2",
        highlight
          ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
          : muted
            ? "border-slate-200 bg-slate-50 text-[#525960] opacity-80"
            : "border-slate-200 bg-white text-[#232629]",
      )}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-[#eff6ff] p-1 text-[#525960]">
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-[#232629]">
          {formatCount(value)}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-[#525960]">
          {label}
        </p>
      </div>
    </div>
  );
}
