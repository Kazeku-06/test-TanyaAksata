"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateComment } from "@/hooks/useComments";
import Button from "@/components/ui/Button";
import { createCommentSchema, type CreateCommentFormData } from "@/lib/schemas";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Tulis jawabanmu di sini...",
}: CommentFormProps) {
  const { mutate: createComment, isPending } = useCreateComment();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
  });

  function onSubmit(data: CreateCommentFormData) {
    createComment(
      { post_id: postId, body: data.body, parent_id: parentId },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string } };
          };
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
        placeholder={placeholder}
        rows={4}
        className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] resize-y
          focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20
          ${errors.body ? "border-[#dc2626]" : "border-blue-200 hover:border-blue-300"}`}
        {...register("body")}
      />
      {errors.body && (
        <p className="text-xs text-[#dc2626]">{errors.body.message}</p>
      )}
      {errors.root && (
        <p className="text-xs text-[#dc2626]">{errors.root.message}</p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" loading={isPending}>
          {parentId ? "Kirim Balasan" : "Kirim Jawaban"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
