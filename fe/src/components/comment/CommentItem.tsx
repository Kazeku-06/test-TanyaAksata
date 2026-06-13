"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ThumbsUp, CornerDownRight, MoreHorizontal } from "lucide-react";
import type { Comment } from "@/types";
import { timeAgo, cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  postOwnerId: string;
  currentUserId?: string;
  onAccept?: (commentId: string) => void;
  depth?: number;
}

export default function CommentItem({
  comment,
  postId,
  postOwnerId,
  currentUserId,
  onAccept,
  depth = 0,
}: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const isOwner = currentUserId === comment.user.id;
  const isPostOwner = currentUserId === postOwnerId;

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-8 mt-2")}>
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1 w-8 flex-shrink-0 pt-1">
        <button
          className={cn(
            "text-[#94a3b8] hover:text-[#60a5fa] transition-colors",
            comment.is_accepted && "text-[#059669]"
          )}
          aria-label="Upvote comment"
        >
          ▲
        </button>
        <span className="text-xs font-medium text-[#64748b]">{comment.votes_count}</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Accepted badge */}
        {comment.is_accepted && (
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-[#059669]" />
            <span className="text-xs font-semibold text-[#059669]">Jawaban Diterima</span>
          </div>
        )}

        {/* Content box */}
        <div
          className={cn(
            "border rounded-lg p-3 text-sm",
            comment.is_accepted
              ? "border-emerald-300 bg-emerald-50"
              : "border-blue-200 bg-white"
          )}
        >
          <p className="text-[#1e293b] whitespace-pre-wrap">{comment.body}</p>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748b]">
          <div className="flex items-center gap-1">
            <Avatar name={comment.user.name} avatar={comment.user.avatar} size="xs" />
            <Link
              href={`/users/${comment.user.id}`}
              className="text-[#60a5fa] hover:underline font-medium"
            >
              {comment.user.name}
            </Link>
            <span className="text-[#94a3b8]">{comment.user.reputation}</span>
          </div>
          <span>{timeAgo(comment.created_at)}</span>
          {comment.is_edited && <span className="text-[#94a3b8]">(diedit)</span>}

          <div className="flex items-center gap-2 ml-auto">
            {/* Like */}
            <button className="flex items-center gap-1 hover:text-[#60a5fa] transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" />
              {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
            </button>

            {/* Reply (only top-level) */}
            {depth === 0 && (
              <button
                onClick={() => setShowReply((v) => !v)}
                className="flex items-center gap-1 hover:text-[#60a5fa] transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Balas
              </button>
            )}

            {/* Accept (post owner, top-level only) */}
            {isPostOwner && depth === 0 && (
              <button
                onClick={() => onAccept?.(comment.id)}
                className={cn(
                  "flex items-center gap-1 transition-colors",
                  comment.is_accepted
                    ? "text-[#059669] font-medium"
                    : "hover:text-[#059669]"
                )}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {comment.is_accepted ? "Diterima" : "Terima"}
              </button>
            )}

            {/* More (owner) */}
            {isOwner && (
              <button className="hover:text-[#1e293b] transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Reply form */}
        {showReply && (
          <div className="mt-2">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSuccess={() => setShowReply(false)}
              onCancel={() => setShowReply(false)}
              placeholder={`Balas @${comment.user.name}...`}
            />
          </div>
        )}

        {/* Nested replies */}
        {comment.replies?.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            postId={postId}
            postOwnerId={postOwnerId}
            currentUserId={currentUserId}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}
