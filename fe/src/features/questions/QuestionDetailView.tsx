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
import CommentSection from "./CommentSection";
import ReportButton from "@/components/post/ReportButton";

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
  userVote: 1 | -1 | null;
  isLiked: boolean;
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
  userVote,
  isLiked,
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
        <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Pertanyaan tidak ditemukan.</span>
        </div>
        <Link href="/" className="text-sm text-[#60a5fa] hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 max-w-[860px]">

      {/* Question Header */}
      <div className="mb-4 pb-4 border-b border-blue-100">
        <h1 className="text-xl font-bold text-[#1e293b] leading-snug mb-2">
          {post.is_solved && (
            <CheckCircle className="inline w-5 h-5 text-emerald-600 mr-1.5 mb-0.5" />
          )}
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748b]">
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

      {/* Post Body + Vote */}
      <div className="flex gap-4 mb-6">

        {/* Vote column */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 pt-1">
          <VoteButton
            count={post.votes_count}
            userVote={userVote}
            onVote={onVotePost}
            disabled={!me || isPostOwner}
          />

          {/* Bookmark */}
          <button
            onClick={onBookmark}
            disabled={!me}
            aria-label={post.is_bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 mt-1",
              post.is_bookmarked
                ? "text-[#60a5fa] bg-blue-50 shadow-sm shadow-blue-200/50"
                : "text-[#94a3b8] hover:text-[#60a5fa] hover:bg-blue-50",
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
          <div
            className="prose max-w-none text-sm text-[#1e293b] mb-4"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
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
          )}

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-[#64748b]">

              {/* Like */}
              <button
                onClick={onLikePost}
                disabled={!me || isPostOwner}
                className={cn(
                  "flex items-center gap-1 hover:text-[#60a5fa] transition-colors",
                  isLiked ? "text-[#60a5fa] font-medium" : "",
                  (!me || isPostOwner) && "opacity-40 cursor-not-allowed"
                )}
              >
                <ThumbsUp className={cn("w-3.5 h-3.5", isLiked && "fill-[#60a5fa]")} />
                {post.likes_count > 0 && <span>{post.likes_count}</span>}
                <span>{isLiked ? "Menyukai" : "Suka"}</span>
              </button>

              {/* Laporan */}
              {me && !isPostOwner && (
                <ReportButton targetType="post" targetId={post.id} />
              )}

              {/* Edit */}
              {canEdit && (
                <Link
                  href={`/questions/${post.id}/edit`}
                  className="flex items-center gap-1 hover:text-[#60a5fa] transition-colors"
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
                  className="flex items-center gap-1 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </button>
              )}
            </div>

            {/* Author card */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] text-[#64748b]">
                  ditanyakan {timeAgo(post.created_at)}
                </p>
              </div>
              <Avatar name={post.user.name} avatar={post.user.avatar} size="sm" />
              <div>
                <Link
                  href={`/users/${post.user.id}`}
                  className="text-xs font-medium text-[#60a5fa] hover:underline block"
                >
                  {post.user.name}
                </Link>
                <span className="text-[10px] text-[#64748b]">{post.user.reputation} rep</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-blue-100 mb-6" />

      {/* Comments / Answers */}
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
