"use client";

import { useState } from "react";
import { useCreateComment } from "@/hooks/useComments";
import Button from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/utils";

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
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return setError("Komentar tidak boleh kosong");
    if (body.trim().length < 10) return setError("Komentar minimal 10 karakter");

    createComment(
      { post_id: postId, body: body.trim(), parent_id: parentId },
      {
        onSuccess: () => {
          setBody("");
          setError("");
          onSuccess?.();
        },
        onError: (err: unknown) => setError(getErrorMessage(err)),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => { setBody(e.target.value); setError(""); }}
        placeholder={placeholder}
        rows={4}
        className={`w-full px-3 py-2 text-sm border rounded bg-white text-[#232629] placeholder-[#babfc4] resize-y
          focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20
          ${error ? "border-[#c91d2e]" : "border-[#babfc4] hover:border-[#838c95]"}`}
      />
      {error && <p className="text-xs text-[#c91d2e]">{error}</p>}
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
