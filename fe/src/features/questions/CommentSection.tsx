"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateComment, useVoteComment, useLikeComment } from "@/hooks/useComments";
import { createCommentSchema, type CreateCommentFormData } from "@/lib/schemas";
import type { Comment, User } from "@/types";
import { CheckCircle, ThumbsUp, CornerDownRight } from "lucide-react";
import { timeAgo, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
  postOwnerId: string;
  comments: Comment[];
  me: User | null;
  isLoading: boolean;
  isPostOwner: boolean;
  replyingToId: string | null;
  onAcceptAnswer: (commentId: string) => void;
  onSetReplyingTo: (id: string | null) => void;
}

export default function CommentSection({
  postId,
  postOwnerId,
  comments,
  me,
  isLoading,
  isPostOwner,
  replyingToId,
  onAcceptAnswer,
  onSetReplyingTo,
}: CommentSectionProps) {
  return (
    <div>
      {/* Header */}
      <h2 className="text-lg font-bold text-[#1e293b] mb-4">
        {comments.length} Jawaban
      </h2>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[#64748b] mb-6">
          Belum ada jawaban. Jadilah yang pertama!
        </p>
      ) : (
        <div className="flex flex-col gap-4 mb-8">
          {comments.map((comment) => (
            <CommentItemWithActions
              key={comment.id}
              comment={comment}
              postId={postId}
              me={me}
              isPostOwner={isPostOwner}
              isReplying={replyingToId === comment.id}
              onAccept={() => onAcceptAnswer(comment.id)}
              onToggleReply={() =>
                onSetReplyingTo(replyingToId === comment.id ? null : comment.id)
              }
            />
          ))}
        </div>
      )}

      {/* Form jawaban baru */}
      {me ? (
        <div>
          <h3 className="text-base font-bold text-[#1e293b] mb-3">
            Tulis Jawaban
          </h3>
          <AnswerForm postId={postId} />
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-[#3b82f6]">
          <Link href="/login" className="text-[#60a5fa] font-medium hover:underline">
            Masuk
          </Link>{" "}
          atau{" "}
          <Link href="/register" className="text-[#60a5fa] font-medium hover:underline">
            daftar
          </Link>{" "}
          untuk menambahkan jawaban.
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  me: User | null;
  isPostOwner: boolean;
  isReplying: boolean;
  onAccept: () => void;
  onToggleReply: () => void;
}

function CommentItemWithActions({
  comment,
  postId,
  me,
  isPostOwner,
  isReplying,
  onAccept,
  onToggleReply,
}: CommentItemProps) {
  const isOwner = me?.id === comment.user.id;
  const { mutate: voteComment } = useVoteComment(comment.id, postId);
  const { mutate: likeComment } = useLikeComment(comment.id, postId);

  return (
    <div className="flex gap-3">
      {/* Vote */}
      <div className="flex flex-col items-center gap-1 w-8 flex-shrink-0 pt-1">
        <button
          onClick={() => voteComment(1)}
          disabled={!me || isOwner}
          className={cn(
            "text-[#94a3b8] hover:text-[#60a5fa] transition-colors text-sm",
            (!me || isOwner) && "opacity-40 cursor-not-allowed"
          )}
        >
          ▲
        </button>
        <span className="text-xs font-medium text-[#64748b]">{comment.votes_count}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Accepted badge */}
        {comment.is_accepted && (
          <div className="flex items-center gap-1 mb-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600">Jawaban Diterima</span>
          </div>
        )}

        {/* Body */}
        <div
          className={cn(
            "border rounded-lg p-3 text-sm whitespace-pre-wrap",
            comment.is_accepted
              ? "border-emerald-300 bg-emerald-50 text-[#1e293b]"
              : "border-blue-100 bg-white text-[#1e293b]"
          )}
        >
          {comment.body}
        </div>

        {/* Meta & actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-xs text-[#64748b]">
          {/* Author */}
          <div className="flex items-center gap-1.5">
            <Avatar name={comment.user.name} avatar={comment.user.avatar} size="xs" />
            <Link href={`/users/${comment.user.id}`} className="text-[#60a5fa] hover:underline font-medium">
              {comment.user.name}
            </Link>
            <span className="text-[#94a3b8]">{comment.user.reputation}</span>
            <span>·</span>
            <span>{timeAgo(comment.created_at)}</span>
            {comment.is_edited && <span className="text-[#94a3b8]">(diedit)</span>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => likeComment()}
              disabled={!me || isOwner}
              className={cn(
                "flex items-center gap-1 hover:text-[#60a5fa] transition-colors",
                (!me || isOwner) && "opacity-40 cursor-not-allowed"
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
            </button>

            {/* Reply button (hanya top-level) */}
            {!comment.parent_id && me && (
              <button
                onClick={onToggleReply}
                className="flex items-center gap-1 hover:text-[#60a5fa] transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                {isReplying ? "Batal" : "Balas"}
              </button>
            )}

            {/* Accept button (pemilik post, top-level) */}
            {isPostOwner && !comment.parent_id && (
              <button
                onClick={onAccept}
                className={cn(
                  "flex items-center gap-1 transition-colors",
                  comment.is_accepted
                    ? "text-emerald-600 font-medium"
                    : "hover:text-emerald-600"
                )}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {comment.is_accepted ? "Diterima" : "Terima Jawaban"}
              </button>
            )}
          </div>
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="mt-2">
            <ReplyForm
              postId={postId}
              parentId={comment.id}
              replyToName={comment.user.name}
              onSuccess={() => onToggleReply()}
            />
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-6 mt-3 flex flex-col gap-3">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2 border-l-2 border-blue-200 pl-3">
                <Avatar name={reply.user.name} avatar={reply.user.avatar} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="border border-blue-100 rounded-lg p-2.5 text-sm bg-white text-[#1e293b]">
                    {reply.body}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[#64748b]">
                    <Link href={`/users/${reply.user.id}`} className="text-[#60a5fa] hover:underline font-medium">
                      {reply.user.name}
                    </Link>
                    <span>·</span>
                    <span>{timeAgo(reply.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerForm({ postId }: { postId: string }) {
  const { mutate: createComment, isPending } = useCreateComment();
  const { register, handleSubmit, reset, setError, formState: { errors } } =
    useForm<CreateCommentFormData>({
      resolver: zodResolver(createCommentSchema),
    });

  function onSubmit(data: CreateCommentFormData) {
    createComment(
      { post_id: postId, body: data.body },
      {
        onSuccess: () => reset(),
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setError("root", {
            message: axiosErr?.response?.data?.message || "Terjadi kesalahan",
          });
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2" noValidate>
      <textarea
        placeholder="Tulis jawabanmu di sini..."
        rows={5}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] resize-y",
          "focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20",
          errors.body ? "border-red-400" : "border-blue-200 hover:border-blue-300"
        )}
        {...register("body")}
      />
      {errors.body && <p className="text-xs text-red-600">{errors.body.message}</p>}
      {errors.root && <p className="text-xs text-red-600">{errors.root.message}</p>}
      <div>
        <Button type="submit" variant="primary" size="md" loading={isPending}>
          Kirim Jawaban
        </Button>
      </div>
    </form>
  );
}

function ReplyForm({
  postId,
  parentId,
  replyToName,
  onSuccess,
}: {
  postId: string;
  parentId: string;
  replyToName: string;
  onSuccess: () => void;
}) {
  const { mutate: createComment, isPending } = useCreateComment();
  const { register, handleSubmit, reset, setError, formState: { errors } } =
    useForm<CreateCommentFormData>({
      resolver: zodResolver(createCommentSchema),
    });

  function onSubmit(data: CreateCommentFormData) {
    createComment(
      { post_id: postId, body: data.body, parent_id: parentId },
      {
        onSuccess: () => { reset(); onSuccess(); },
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setError("root", {
            message: axiosErr?.response?.data?.message || "Terjadi kesalahan",
          });
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2" noValidate>
      <textarea
        placeholder={`Balas @${replyToName}...`}
        rows={3}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-lg bg-white resize-y",
          "focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20",
          errors.body ? "border-red-400" : "border-blue-200"
        )}
        {...register("body")}
      />
      {errors.body && <p className="text-xs text-red-600">{errors.body.message}</p>}
      {errors.root && <p className="text-xs text-red-600">{errors.root.message}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          Kirim Balasan
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onSuccess}>
          Batal
        </Button>
      </div>
    </form>
  );
}
