"use client";

import { usePost, useVotePost, useLikePost, useBookmarkPost, useDeletePost } from "@/hooks/usePosts";
import { useMe } from "@/hooks/useAuth";
import CommentList from "@/components/comment/CommentList";
import VoteButton from "./VoteButton";
import ReportButton from "./ReportButton";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  Pencil,
  Trash2,
  Clock,
  Eye,
  CheckCircle,
} from "lucide-react";
import { timeAgo, formatCount, cn } from "@/lib/utils";

interface PostDetailClientProps {
  postId: string;
}

export default function PostDetailClient({ postId }: PostDetailClientProps) {
  const router = useRouter();
  const { data: post, isLoading, isError } = usePost(postId);
  const { data: me } = useMe();
  const { mutate: vote } = useVotePost(postId);
  const { mutate: like } = useLikePost(postId);
  const { mutate: bookmark } = useBookmarkPost(postId);
  const { mutate: deletePost, isPending: deleting } = useDeletePost();

  const isOwner = me?.id === post?.user_id;
  const canModerate = me?.roles?.some(
    (r) => r.name === "admin" || r.name === "moderator"
  );

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    deletePost(postId, {
      onSuccess: () => router.replace("/"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-[#c91d2e] font-medium mb-2">Pertanyaan tidak ditemukan.</p>
        <Link href="/" className="text-[#0074cc] text-sm hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 max-w-[860px]">
      {/* Question header */}
      <div className="mb-4 border-b border-[#e3e6eb] pb-4">
        <h1 className="text-xl font-semibold text-[#232629] leading-snug mb-2">
          {post.is_solved && (
            <CheckCircle className="inline w-5 h-5 text-[#2e6d44] mr-1.5 mb-0.5" />
          )}
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#6a737c]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Ditanyakan {timeAgo(post.created_at)}
          </span>
          {post.is_edited && (
            <span className="flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" />
              Diedit
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatCount(post.views_count)} kali dilihat
          </span>
        </div>
      </div>

      {/* Post body + vote */}
      <div className="flex gap-4 mb-6">
        {/* Vote */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
          <VoteButton
            count={post.votes_count}
            userVote={null}
            onVote={(v) => vote(v)}
            disabled={!me || isOwner}
          />

          {/* Bookmark */}
          <button
            onClick={() => bookmark()}
            disabled={!me}
            aria-label={post.is_bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
            className={cn(
              "p-1 rounded transition-colors mt-1",
              post.is_bookmarked
                ? "text-[#f48024]"
                : "text-[#babfc4] hover:text-[#6a737c]",
              !me && "opacity-40 cursor-not-allowed"
            )}
          >
            {post.is_bookmarked ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="prose text-sm text-[#232629] mb-4 whitespace-pre-wrap">
            {post.body}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
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
          )}

          {/* Actions row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 text-[#6a737c]">
              {/* Like */}
              <button
                onClick={() => like()}
                disabled={!me || isOwner}
                className={cn(
                  "flex items-center gap-1 hover:text-[#0a95ff] transition-colors",
                  !me && "opacity-40 cursor-not-allowed"
                )}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {post.likes_count > 0 && post.likes_count}
                <span>Suka</span>
              </button>

              <ReportButton targetType="post" targetId={post.id} />

              {(isOwner || canModerate) && (
                <>
                  <Link
                    href={`/questions/${post.id}/edit`}
                    className="flex items-center gap-1 hover:text-[#0a95ff] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1 text-[#6a737c] hover:text-[#c91d2e] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </>
              )}
            </div>

            {/* Author card */}
            <div className="bg-[#e1ecf4] rounded p-2 flex items-start gap-2">
              <div className="text-[#6a737c] text-right">
                <p className="text-[10px] mb-0.5">ditanyakan {timeAgo(post.created_at)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Avatar name={post.user.name} avatar={post.user.avatar} size="sm" />
                <div>
                  <Link
                    href={`/users/${post.user.id}`}
                    className="text-[#0074cc] hover:underline font-medium text-xs block"
                  >
                    {post.user.name}
                  </Link>
                  <span className="text-[10px] text-[#6a737c]">
                    {post.user.reputation} rep
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[#e3e6eb] mb-6" />

      {/* Comments / Answers */}
      <CommentList postId={post.id} postOwnerId={post.user_id} />
    </div>
  );
}
