"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePost, useVotePost, useLikePost, useBookmarkPost, useDeletePost } from "@/hooks/usePosts";
import { useComments, useAcceptAnswer } from "@/hooks/useComments";
import { useMe } from "@/hooks/useAuth";
import { usePostEditHistory } from "@/hooks/useModeration";
import QuestionDetailView from "./QuestionDetailView";

interface QuestionDetailLogicProps {
  postId: string;
}

export default function QuestionDetailLogic({ postId }: QuestionDetailLogicProps) {
  const router = useRouter();

  // ── Data fetching ───────────────────────────────────────────
  const { data: post, isLoading: isLoadingPost, isError: isPostError } = usePost(postId);
  const { data: comments, isLoading: isLoadingComments } = useComments(postId);
  const { data: me } = useMe();

  // ── Post mutations ──────────────────────────────────────────
  const { mutate: votePost }     = useVotePost(postId);
  const { mutate: likePost }     = useLikePost(postId);
  const { mutate: bookmarkPost } = useBookmarkPost(postId);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: acceptAnswer } = useAcceptAnswer(postId);

  // ── Permission checks ───────────────────────────────────────
  const isPostOwner = !!me && !!post && me.id === post.user_id;
  const canModerate = !!me?.roles?.some(
    (r) => r.name === "admin" || r.name === "moderator"
  );
  const canEdit = isPostOwner || canModerate;

  const { data: postHistory } = usePostEditHistory(canModerate ? postId : "");

  // ── Local state ─────────────────────────────────────────────
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────
  function handleVotePost(vote: 1 | -1) {
    if (!me) { router.push("/login"); return; }
    votePost(vote);
  }

  function handleLikePost() {
    if (!me) { router.push("/login"); return; }
    likePost();
  }

  function handleBookmark() {
    if (!me) { router.push("/login"); return; }
    if (post) bookmarkPost(post);
  }

  function handleDeletePost() {
    if (!confirm("Yakin ingin menghapus pertanyaan ini?")) return;
    deletePost(postId, {
      onSuccess: () => router.replace("/"),
    });
  }

  function handleAcceptAnswer(commentId: string) {
    acceptAnswer(commentId);
  }

  return (
    <QuestionDetailView
      post={post}
      comments={comments ?? []}
      me={me ?? null}
      isLoadingPost={isLoadingPost}
      isLoadingComments={isLoadingComments}
      isPostError={isPostError}
      isDeleting={isDeleting}
      isPostOwner={isPostOwner}
      canEdit={canEdit}
      canModerate={canModerate}
      postHistory={postHistory ?? []}
      replyingToId={replyingToId}
      postId={postId}
      onVotePost={handleVotePost}
      onLikePost={handleLikePost}
      onBookmark={handleBookmark}
      onDeletePost={handleDeletePost}
      onAcceptAnswer={handleAcceptAnswer}
      onSetReplyingTo={setReplyingToId}
    />
  );
}
