import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, type CreatePostFormData } from "@/lib/schemas";

// Form hook untuk halaman "Ajukan Pertanyaan"
// Memisahkan konfigurasi form dari logic API call
export function useAskForm() {
  // State untuk tag input (field terpisah, tidak masuk schema langsung)
  const [tagInput, setTagInput] = useState("");

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      body: "",
      category_id: "",
      tags: [],
      tagInput: "",
    },
  });

  const tags = form.watch("tags") ?? [];

  // Tambah tag ke list
  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    form.setValue("tags", [...tags, tag]);
    setTagInput("");
  }

  // Hapus tag dari list
  function removeTag(tag: string) {
    form.setValue("tags", tags.filter((t) => t !== tag));
  }

  // Handler keyboard: Enter atau koma → tambah tag
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
