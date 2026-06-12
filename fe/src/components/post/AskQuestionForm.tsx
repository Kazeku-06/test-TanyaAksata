"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { createPostSchema, type CreatePostFormData } from "@/lib/schemas";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AskQuestionForm() {
  const router = useRouter();
  const { mutate: createPost, isPending } = useCreatePost();
  const { data: categories } = useCategories(true);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", body: "", category_id: "", tags: [], tagInput: "" },
  });

  const tags = watch("tags") ?? [];

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

  function onSubmit(data: CreatePostFormData) {
    createPost(
      { title: data.title, body: data.body, category_id: data.category_id, tags: data.tags },
      {
        onSuccess: (post) => router.push(`/questions/${post.id}`),
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { errors?: Record<string, string[]>; message?: string } };
          };
          const apiErrors = axiosErr?.response?.data?.errors;
          if (apiErrors) {
            for (const [key, messages] of Object.entries(apiErrors)) {
              setError(key as keyof CreatePostFormData, { message: messages[0] });
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

  return (
    <div className="w-full bg-[#f0f7ff] min-h-screen px-4 py-8">
      <div className="max-w-[850px] mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#1e293b] tracking-tight">
              Ajukan Pertanyaan Publik
            </h1>
          </div>
        </div>

        {/* Form Utama */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#dc2626] font-medium animate-in fade-in-50">
              {errors.root.message}
            </div>
          )}

          {/* 1. Title Box */}
          <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-[#1e293b] text-[15px] mb-0.5">Judul</h2>
            <p className="text-xs text-[#64748b] mb-3">
              Bayangkan kamu bertanya kepada seseorang — apa pertanyaan spesifiknya?
            </p>
            <Input
              placeholder="e.g. Kenapa useEffect di React berjalan dua kali?"
              {...register("title")}
              className={cn(
                "focus:border-[#60a5fa] focus:ring-4 focus:ring-[#60a5fa]/10",
                errors.title && "border-[#dc2626]"
              )}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-[#dc2626] font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* 2. Body Box */}
          <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-[#1e293b] text-[15px] mb-0.5">Isi Pertanyaan</h2>
            <p className="text-xs text-[#64748b] mb-3">
              Jelaskan masalahmu secara detail. Sertakan apa yang sudah kamu coba dan hasil yang diharapkan.
            </p>
            <Textarea
              placeholder="Jelaskan pertanyaan kamu di sini..."
              className={cn(
                "min-h-[220px] focus:border-[#60a5fa] focus:ring-4 focus:ring-[#60a5fa]/10 font-mono text-sm",
                errors.body && "border-[#dc2626]"
              )}
              {...register("body")}
            />
            {errors.body && (
              <p className="mt-1.5 text-xs text-[#dc2626] font-medium">{errors.body.message}</p>
            )}
          </div>

          {/* Category Box */}
          <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-[#1e293b] text-[15px] mb-0.5">Kategori</h2>
            <p className="text-xs text-[#64748b] mb-3">
              Pilih kategori yang paling relevan dengan pertanyaanmu.
            </p>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-[#1e293b] transition-all focus:outline-none focus:border-[#60a5fa] focus:ring-4 focus:ring-[#60a5fa]/10 ${errors.category_id
                      ? "border-[#dc2626] focus:ring-[#dc2626]/10"
                      : "border-blue-200 hover:border-blue-300"
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
              <p className="mt-1.5 text-xs text-[#dc2626] font-medium">{errors.category_id.message}</p>
            )}
          </div>

          {/* Tags Box */}
          <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm">
            <h2 className="font-semibold text-[#1e293b] text-[15px] mb-0.5">Tag</h2>
            <p className="text-xs text-[#64748b] mb-3">
              Tambahkan hingga 5 tag. Tekan Enter atau koma untuk menambah.
            </p>

            {/* Bagian List Badge Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded border border-blue-200 bg-blue-50 text-[#60a5fa] font-medium transition-all"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-100 p-0.5 rounded text-[#60a5fa] hover:text-[#dc2626] transition-colors"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="e.g. javascript, react, laravel"
              disabled={tags.length >= 5}
              hint={tags.length >= 5 ? "Maksimal 5 tag" : undefined}
              className="focus:border-[#60a5fa] focus:ring-4 focus:ring-[#60a5fa]/10"
            />
            {errors.tags && (
              <p className="mt-1.5 text-xs text-[#dc2626] font-medium">{errors.tags.message}</p>
            )}
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
            >
              Review Pertanyaan Anda
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
