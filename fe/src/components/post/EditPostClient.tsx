"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePost, useUpdatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import { updatePostSchema, type UpdatePostFormData } from "@/lib/schemas";
import { X } from "lucide-react";

interface EditPostClientProps {
  postId: string;
}

export default function EditPostClient({ postId }: EditPostClientProps) {
  const router = useRouter();
  const { data: post, isLoading: loadingPost } = usePost(postId);
  const { mutate: updatePost, isPending } = useUpdatePost(postId);
  const { data: categories } = useCategories(true);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<UpdatePostFormData>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: { tags: [], tagInput: "", edit_summary: "" },
  });

  const tags = watch("tags") ?? [];

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        body: post.body,
        category_id: post.category_id,
        tags: post.tags.map((t) => t.name),
        edit_summary: "",
        tagInput: "",
      });
    }
  }, [post, reset]);

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= 5) return;
    setValue("tags", [...tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  function onSubmit(data: UpdatePostFormData) {
    updatePost(
      {
        title: data.title,
        body: data.body,
        category_id: data.category_id,
        tags: data.tags,
        edit_summary: data.edit_summary || undefined,
      },
      {
        onSuccess: () => router.push(`/questions/${postId}`),
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { errors?: Record<string, string[]>; message?: string } };
          };
          const apiErrors = axiosErr?.response?.data?.errors;
          if (apiErrors) {
            for (const [key, messages] of Object.entries(apiErrors)) {
              setError(key as keyof UpdatePostFormData, { message: messages[0] });
            }
          } else {
            setError("root", {
              message: axiosErr?.response?.data?.message || "Terjadi kesalahan",
            });
          }
        },
      }
    );
  }

  if (loadingPost) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-[#c91d2e] text-sm">Pertanyaan tidak ditemukan.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {errors.root && (
        <div className="p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
          {errors.root.message}
        </div>
      )}

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Judul</h2>
        <Input error={errors.title?.message} {...register("title")} />
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Isi Pertanyaan</h2>
        <Textarea error={errors.body?.message} className="min-h-[200px]" {...register("body")} />
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Kategori</h2>
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className={`w-full px-3 py-2 text-sm border rounded bg-white text-[#232629] focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20 ${
                errors.category_id ? "border-[#c91d2e]" : "border-[#babfc4]"
              }`}
            >
              <option value="">-- Pilih Kategori --</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        />
        {errors.category_id && (
          <p className="mt-1 text-xs text-[#c91d2e]">{errors.category_id.message}</p>
        )}
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Tag</h2>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d]"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X className="w-3 h-3 hover:text-[#c91d2e]" />
              </button>
            </span>
          ))}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={addTag}
          placeholder="Tambah tag..."
          disabled={tags.length >= 5}
        />
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">
          Ringkasan Edit{" "}
          <span className="text-[#6a737c] font-normal text-sm">(opsional)</span>
        </h2>
        <Input
          placeholder="Jelaskan apa yang kamu ubah..."
          error={errors.edit_summary?.message}
          {...register("edit_summary")}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          Simpan Perubahan
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()} disabled={isPending}>
          Batal
        </Button>
      </div>
    </form>
  );
}
