"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Eye,
  Pencil,
  Trash2,
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  Share2,
  AlertCircle,
} from "lucide-react";
import {
  usePost,
  useVotePost,
  useLikePost,
  useBookmarkPost,
  useDeletePost,
  useUserPostVote,
  useUserPostLike,
} from "@/hooks/usePosts";
import { useComments, useAcceptAnswer } from "@/hooks/useComments";
import { useMe } from "@/hooks/useAuth";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import VoteButton from "@/components/post/VoteButton";
import ReportButton from "@/components/post/ReportButton";
import CommentSection from "@/features/questions/CommentSection";
import type { Post } from "@/types";

interface PostDetailClientProps {
  postId: string;
}

export default function PostDetailClient({ postId }: PostDetailClientProps) {
  const router = useRouter();

  // ── Data fetching ──────────────────────────────────────────
  const { data: post, isLoading: isLoadingPost, isError: isPostError } = usePost(postId);
  const { data: comments, isLoading: isLoadingComments } = useComments(postId);
  const { data: me } = useMe();

  // ── User interaction state ─────────────────────────────────
  const isLoggedIn = !!me;
  const { data: userVoteData } = useUserPostVote(postId, isLoggedIn);
  const { data: likeData } = useUserPostLike(postId, isLoggedIn);
  const userVote = userVoteData?.user_vote ?? null;
  const isLiked = likeData?.is_liked ?? false;

  // ── Mutations ──────────────────────────────────────────────
  const { mutate: votePost } = useVotePost(postId);
  const { mutate: likePost } = useLikePost(postId);
  const { mutate: bookmarkPost } = useBookmarkPost(postId);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: acceptAnswer } = useAcceptAnswer(postId);

  // ── Permission checks ──────────────────────────────────────
  const isPostOwner = !!me && !!post && me.id === post.user_id;
  const canModerate = !!me?.roles?.some(
    (r) => r.name === "admin" || r.name === "moderator"
  );
  const canEdit = isPostOwner || canModerate;

  // ── Local state ────────────────────────────────────────────
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Handlers ───────────────────────────────────────────────
  function handleVote(vote: 1 | -1) {
    if (!me) { router.push("/login"); return; }
    votePost(vote);
  }

  function handleLike() {
    if (!me) { router.push("/login"); return; }
    likePost();
  }

  function handleBookmark() {
    if (!me) { router.push("/login"); return; }
    if (!post) return;
    bookmarkPost(post);
  }

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    deletePost(postId, {
      onSuccess: () => router.replace("/"),
    });
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleAcceptAnswer(commentId: string) {
    acceptAnswer(commentId);
  }

  // ── Loading ────────────────────────────────────────────────
  if (isLoadingPost) {
    return (
      <div className="flex justify-center items-center py-24 w-full">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────
  if (isPostError || !post) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium max-w-[1100px] mx-auto mt-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Pertanyaan tidak ditemukan.
        </div>
        <Link href="/" className="text-sm text-[#60a5fa] hover:underline mt-2 inline-block">
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto px-6 py-6 font-sans text-[#1e293b]">

      {/* ── 1. HEADER ── */}
      <div className="border-b border-blue-200 pb-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-normal text-[#1e293b] leading-snug flex-1">
            {post.is_solved && (
              <CheckCircle className="inline w-5 h-5 text-emerald-600 mr-1.5 mb-0.5" />
            )}
            {post.title}
          </h1>
          <Link
            href="/questions/ask"
            className="bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm shadow-blue-200/30 transition whitespace-nowrap self-start"
          >
            Ask Question
          </Link>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b] mt-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Ditanyakan <span className="text-[#1e293b] font-medium">{timeAgo(post.created_at)}</span>
          </span>
          {post.is_edited && (
            <span className="flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" />
              Diedit
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            Dilihat <span className="text-[#1e293b] font-medium">{formatCount(post.views_count)} kali</span>
          </span>
        </div>
      </div>

      {/* ── 2. MAIN CONTENT + SIDEBAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_300px] gap-6 items-start">

        {/* LEFT: Vote column */}
        <div className="flex flex-col items-center gap-1 w-12 pt-1">
          <VoteButton
            count={post.votes_count}
            userVote={userVote}
            onVote={handleVote}
            disabled={!me || isPostOwner}
          />

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            disabled={!me}
            aria-label={post.is_bookmarked ? "Hapus bookmark" : "Tambah bookmark"}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 mt-2",
              post.is_bookmarked
                ? "text-white bg-[#60a5fa] shadow-sm shadow-blue-200/50"
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

        {/* CENTER: Post body + actions */}
        <div className="min-w-0 flex flex-col justify-between">

          {/* Body */}
          <div
            className="text-[15px] leading-relaxed break-words mb-6 prose max-w-none text-[#1e293b]"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
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
          <div className="flex flex-wrap items-start justify-between gap-4 pt-4 border-t border-blue-100">

            {/* Left actions */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b] font-medium pt-1">
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-[#60a5fa] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? "Tersalin!" : "Bagikan"}
              </button>

              <button
                onClick={handleLike}
                disabled={!me || isPostOwner}
                className={cn(
                  "flex items-center gap-1 hover:text-[#60a5fa] transition-colors",
                  isLiked ? "text-[#60a5fa] font-medium" : "",
                  (!me || isPostOwner) && "opacity-40 cursor-not-allowed"
                )}
              >
                <ThumbsUp className={cn("w-3.5 h-3.5", isLiked && "fill-[#60a5fa]")} />
                <span>{isLiked ? "Menyukai" : "Suka"}</span>
                {post.likes_count > 0 && (
                  <span className={cn("font-semibold", isLiked ? "text-[#60a5fa]" : "text-[#1e293b]")}>
                    ({post.likes_count})
                  </span>
                )}
              </button>

              {me && !isPostOwner && (
                <ReportButton targetType="post" targetId={post.id} />
              )}

              {canEdit && (
                <>
                  <Link
                    href={`/questions/${post.id}/edit`}
                    className="flex items-center gap-1 hover:text-[#60a5fa] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isDeleting ? "Menghapus..." : "Hapus"}
                  </button>
                </>
              )}
            </div>

            {/* Author card */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 w-[200px] text-xs text-[#64748b]">
              <p className="text-[11px] text-[#64748b] mb-1.5">
                ditanyakan {timeAgo(post.created_at)}
              </p>
              <div className="flex items-center gap-2">
                <Avatar name={post.user.name} avatar={post.user.avatar} size="sm" />
                <div className="flex flex-col min-w-0">
                  <Link
                    href={`/users/${post.user.id}`}
                    className="text-[#60a5fa] hover:text-[#3b82f6] font-medium block truncate"
                  >
                    {post.user.name}
                  </Link>
                  <span className="text-[11px] font-bold text-[#525960]">
                    {post.user.reputation?.toLocaleString() || 0} <span className="font-normal text-[#94a3b8]">rep</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="hidden lg:block space-y-4 w-full">
          <div className="bg-[#fdf7e2] border border-[#f1e5bc] rounded text-xs text-[#3b3a36]">
            <div className="bg-[#fbf3d5] px-3 py-2 font-bold border-b border-[#f1e5bc] text-[#232629]">
              The Overflow Blog
            </div>
            <ul className="p-3 space-y-2.5 list-disc list-inside text-[#3b3a36]">
              <li className="hover:underline cursor-pointer">Panduan menulis pertanyaan yang baik dan mudah dipahami.</li>
              <li className="hover:underline cursor-pointer">Mengapa reputasi poin itu penting di dalam forum?</li>
            </ul>
          </div>

          <div className="border border-blue-200 rounded-lg p-4 text-xs">
            <h3 className="font-semibold text-[#1e293b] mb-3 text-[13px]">Aturan Forum</h3>
            <p className="text-[#64748b] leading-relaxed">
              Pastikan sebelum bertanya kamu sudah melakukan pencarian terlebih dahulu agar tidak terjadi duplikasi pertanyaan. Jaga kesantunan dalam berdiskusi.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. COMMENTS / ANSWERS ── */}
      <div className="mt-8 pt-6 border-t border-blue-100">
        <CommentSection
          postId={postId}
          postOwnerId={post.user_id}
          comments={comments ?? []}
          me={me ?? null}
          isLoading={isLoadingComments}
          isPostOwner={isPostOwner}
          replyingToId={replyingToId}
          onAcceptAnswer={handleAcceptAnswer}
          onSetReplyingTo={setReplyingToId}
        />
      </div>
    </div>
  );
}
