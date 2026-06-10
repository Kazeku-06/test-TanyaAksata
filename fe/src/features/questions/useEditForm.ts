import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePostSchema, type UpdatePostFormData } from "@/lib/schemas";
import type { Post } from "@/types";

// Form hook untuk halaman "Edit Pertanyaan"
// Mengisi ulang form (reset) saat data post selesai di-fetch
export function useEditForm(post: Post | undefined) {
  const [tagInput, setTagInput] = useState("");

  const form = useForm<UpdatePostFormData>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      title: "",
      body: "",
      category_id: "",
      tags: [],
      edit_summary: "",
      tagInput: "",
    },
  });

  // Reset form dengan data post saat post berhasil di-load
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        body: post.body,
        category_id: post.category_id,
        tags: post.tags.map((t) => t.name),
        edit_summary: "",
        tagInput: "",
      });
    }
  }, [post, form]);

  const tags = form.watch("tags") ?? [];

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    form.setValue("tags", [...tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    form.setValue("tags", tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  return {
    form,
    tags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown,
  };
}
