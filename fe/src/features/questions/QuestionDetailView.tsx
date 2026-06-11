import Link from "next/link";
import type { Post, Comment, User } from "@/types";
import {
  CheckCircle, Clock, Eye, Pencil, Trash2,
  Bookmark, BookmarkCheck, ThumbsUp, Flag,
  AlertCircle,
} from "lucide-react";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import VoteButton from "@/components/post/VoteButton";
import ReportButton from "@/components/post/ReportButton";
import CommentSection from "./CommentSection";

interface QuestionDetailViewProps {
  post: Post | undefined;
  comments: Comment[];
  me: User | null;
  isLoadingPost: boolean;
  isLoadingComments: boolean;
  isPostError: boolean;
  isDeleting: boolean;
  isPostOwner: boolean;
  canEdit: boolean;
  replyingToId: string | null;
  postId: string;
  onVotePost: (vote: 1 | -1) => void;
  onLikePost: () => void;
  onBookmark: () => void;
  onDeletePost: () => void;
  onAcceptAnswer: (commentId: string) => void;
  onSetReplyingTo: (id: string | null) => void;
}

export default function QuestionDetailView({
  post,
  comments,
  me,
  isLoadingPost,
  isLoadingComments,
  isPostError,
  isDeleting,
  isPostOwner,
  canEdit,
  replyingToId,
  postId,
  onVotePost,
  onLikePost,
  onBookmark,
  onDeletePost,
  onAcceptAnswer,
  onSetReplyingTo,
}: QuestionDetailViewProps) {

  if (isLoadingPost) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isPostError || !post) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-[#c91d2e] mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Pertanyaan tidak ditemukan.</span>
        </div>
        <Link href="/" className="text-sm text-[#0074cc] hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 max-w-[860px]">

      {/* ── Question Header ── */}
      <div className="mb-4 pb-4 border-b border-[#e3e6eb]">
        <h1 className="text-xl font-semibold text-[#232629] leading-snug mb-2">
          {post.is_solved && (
            <CheckCircle className="inline w-5 h-5 text-[#2e6d44] mr-1.5 mb-0.5" />
          )}
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6a737c]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Ditanyakan {timeAgo(post.created_at)}
          </span>
          {post.is_edited && (
            <span className="flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" />
              Pernah diedit
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatCount(post.views_count)} kali dilihat
          </span>
        </div>
      </div>

      {/* ── Post Body + Vote ── */}
      <div className="flex gap-4 mb-6">

        {/* Vote column */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
          <VoteButton
            count={post.votes_count}
            userVote={null}
            onVote={onVotePost}
            disabled={!me || isPostOwner}
          />

          {/* Bookmark */}
          <button
            onClick={onBookmark}
            disabled={!me}
            aria-label={post.is_bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
            className={cn(
              "p-1 rounded transition-colors mt-1",
              post.is_bookmarked ? "text-[#f48024]" : "text-[#babfc4] hover:text-[#6a737c]",
              !me && "opacity-40 cursor-not-allowed"
            )}
          >
            {post.is_bookmarked
              ? <BookmarkCheck className="w-5 h-5" />
              : <Bookmark className="w-5 h-5" />
            }
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Body */}
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

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-[#6a737c]">

              {/* Like */}
              <button
                onClick={onLikePost}
                disabled={!me || isPostOwner}
                className={cn(
                  "flex items-center gap-1 hover:text-[#0a95ff] transition-colors",
                  (!me || isPostOwner) && "opacity-40 cursor-not-allowed"
                )}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {post.likes_count > 0 && <span>{post.likes_count}</span>}
                <span>Suka</span>
              </button>

              {/* Laporan */}
              {me && !isPostOwner && (
                <ReportButton targetType="post" targetId={post.id} />
              )}

              {/* Edit */}
              {canEdit && (
                <Link
                  href={`/questions/${post.id}/edit`}
                  className="flex items-center gap-1 hover:text-[#0a95ff] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
              )}

              {/* Hapus */}
              {canEdit && (
                <button
                  onClick={onDeletePost}
                  disabled={isDeleting}
                  className="flex items-center gap-1 hover:text-[#c91d2e] transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </button>
              )}
            </div>

            {/* Author card */}
            <div className="bg-[#e1ecf4] rounded p-2.5 flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] text-[#6a737c]">
                  ditanyakan {timeAgo(post.created_at)}
                </p>
              </div>
              <Avatar name={post.user.name} avatar={post.user.avatar} size="sm" />
              <div>
                <Link
                  href={`/users/${post.user.id}`}
                  className="text-xs font-medium text-[#0074cc] hover:underline block"
                >
                  {post.user.name}
                </Link>
                <span className="text-[10px] text-[#6a737c]">{post.user.reputation} rep</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <hr className="border-[#e3e6eb] mb-6" />

      {/* ── Comments / Answers ── */}
      <CommentSection
        postId={postId}
        postOwnerId={post.user_id}
        comments={comments}
        me={me}
        isLoading={isLoadingComments}
        isPostOwner={isPostOwner}
        replyingToId={replyingToId}
        onAcceptAnswer={onAcceptAnswer}
        onSetReplyingTo={onSetReplyingTo}
      />

    </div>
  );
}
