"use client";

import { useComments } from "@/hooks/useComments";
import { useAcceptAnswer } from "@/hooks/useComments";
import { useMe } from "@/hooks/useAuth";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";

interface CommentListProps {
  postId: string;
  postOwnerId: string;
}

export default function CommentList({ postId, postOwnerId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(postId);
  const { data: me } = useMe();
  const { mutate: acceptAnswer } = useAcceptAnswer(postId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#232629] mb-4">
        {comments?.length ?? 0} Jawaban
      </h2>

      {!comments?.length ? (
        <EmptyState
          title="Belum ada jawaban"
          description="Jadilah yang pertama menjawab pertanyaan ini."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              postOwnerId={postOwnerId}
              currentUserId={me?.id}
              onAccept={(id) => acceptAnswer(id)}
            />
          ))}
        </div>
      )}

      {/* Answer form */}
      {me ? (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-[#232629] mb-3">
            Tulis Jawaban
          </h3>
          <CommentForm postId={postId} />
        </div>
      ) : (
        <div className="mt-8 p-4 bg-[#fdf7e2] border border-[#f1b600] rounded text-sm text-[#3b3229]">
          <a href="/login" className="text-[#0074cc] font-medium hover:underline">
            Masuk
          </a>{" "}
          atau{" "}
          <a href="/register" className="text-[#0074cc] font-medium hover:underline">
            daftar
          </a>{" "}
          untuk menambahkan jawaban.
        </div>
      )}
    </div>
  );
}
