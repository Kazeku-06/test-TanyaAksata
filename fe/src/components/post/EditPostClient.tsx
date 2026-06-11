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
      <div className="flex justify-center items-center py-16 w-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-4 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e] font-medium max-w-[850px] mx-auto mt-6">
        Pertanyaan tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8f9f9] min-h-screen px-4 py-8">
      <div className="max-w-[850px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-normal text-[#232629] tracking-tight">
            Edit Pertanyaan Anda
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
          {errors.root && (
            <div className="p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e] font-medium">
              {errors.root.message}
            </div>
          )}

          {/* Title Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">Judul</h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Perbarui judul agar tetap ringkas, spesifik, dan mudah dimengerti.
            </p>
            <Input 
              error={errors.title?.message} 
              {...register("title")} 
              className="focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10"
            />
          </div>

          {/* Body Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">Isi Pertanyaan</h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Perjelas masalahmu, tambahkan log kesalahan terbaru jika ada, atau rapihkan blok kode.
            </p>
            <Textarea 
              error={errors.body?.message} 
              className="min-h-[240px] focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10 font-mono text-sm" 
              {...register("body")} 
            />
          </div>

          {/* Category Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">Kategori</h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Ubah kategori jika topik pertanyaan bergeser ke pembahasan lain.
            </p>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full px-3 py-2.5 text-sm border rounded bg-white text-[#232629] transition-all focus:outline-none focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10 ${
                    errors.category_id 
                      ? "border-[#c91d2e] focus:ring-[#c91d2e]/10" 
                      : "border-[#babfc4] hover:border-[#838c95]"
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
              <p className="mt-1.5 text-xs text-[#c91d2e] font-medium">{errors.category_id.message}</p>
            )}
          </div>

          {/* Tags Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">Tag</h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Tambahkan atau sesuaikan tag (maksimal 5). Tekan Enter atau koma untuk konfirmasi.
            </p>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d] font-medium"
                  >
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="hover:bg-[#39739d]/10 p-0.5 rounded text-[#39739d] hover:text-[#c91d2e] transition-colors"
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
              placeholder="e.g. javascript, react, nextjs"
              disabled={tags.length >= 5}
              hint={tags.length >= 5 ? "Maksimal 5 tag" : undefined}
              className="focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10"
            />
          </div>

          {/* Edit Summary Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">
              Ringkasan Edit{" "}
              <span className="text-[#6a737c] font-normal text-xs">(opsional)</span>
            </h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Berikan penjelasan singkat mengenai apa saja yang baru kamu perbaiki.
            </p>
            <Input
              placeholder="e.g. memperbaiki typo pada baris kode, melampirkan error log terbaru"
              error={errors.edit_summary?.message}
              {...register("edit_summary")}
              className="focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10"
            />
          </div>

          {/* Actions Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              loading={isPending}
              className="bg-[#0a95ff] hover:bg-[#0074cc] text-white font-medium text-sm px-5 py-2.5 rounded shadow-sm transition-colors"
            >
              Simpan Perubahan
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="lg" 
              onClick={() => router.back()} 
              disabled={isPending}
              className="text-[#c91d2e] hover:bg-[#fce8e9] font-medium text-sm px-5 py-2.5 rounded transition-colors"
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}