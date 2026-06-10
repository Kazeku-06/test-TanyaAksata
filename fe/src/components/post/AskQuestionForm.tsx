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
    <div className="w-full bg-[#f8f9f9] min-h-screen px-4 py-8">
      <div className="max-w-[850px] mx-auto">
        
        {/* Header Halaman Ala Stack Overflow */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#232629] tracking-tight">
              Ajukan Pertanyaan Publik
            </h1>
          </div>
          {/* Ilustrasi background atau tips mini bisa ditaruh di sini jika dibutuhkan di kemudian hari */}
        </div>

        {/* Form Utama */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
          {errors.root && (
            <div className="p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e] font-medium animate-in fade-in-50">
              {errors.root.message}
            </div>
          )}

          {/* Title Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">Judul</h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Bayangkan kamu bertanya kepada seseorang — apa pertanyaan spesifiknya?
            </p>
            <Input
              placeholder="e.g. Kenapa useEffect di React berjalan dua kali?"
              error={errors.title?.message}
              {...register("title")}
              className="focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10"
            />
          </div>

          {/* Body Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">Isi Pertanyaan</h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Jelaskan masalahmu secara detail. Sertakan apa yang sudah kamu coba dan hasil yang diharapkan.
            </p>
            <Textarea
              placeholder="Jelaskan pertanyaan kamu di sini..."
              error={errors.body?.message}
              className="min-h-[220px] focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10 font-mono text-sm"
              {...register("body")}
            />
          </div>

          {/* Category Box */}
          <div className="bg-white border border-[#e3e6eb] rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-[#232629] text-[15px] mb-0.5">Kategori</h2>
            <p className="text-xs text-[#6a737c] mb-3">
              Pilih kategori yang paling relevan dengan pertanyaanmu.
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
              Tambahkan hingga 5 tag. Tekan Enter atau koma untuk menambah.
            </p>
            
            {/* Bagian List Badge Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d] font-medium transition-all"
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
              placeholder="e.g. javascript, react, laravel"
              disabled={tags.length >= 5}
              hint={tags.length >= 5 ? "Maksimal 5 tag" : undefined}
              className="focus:border-[#0a95ff] focus:ring-4 focus:ring-[#0a95ff]/10"
            />
            {errors.tags && (
              <p className="mt-1.5 text-xs text-[#c91d2e] font-medium">{errors.tags.message}</p>
            )}
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              loading={isPending}
              className="bg-[#0a95ff] hover:bg-[#0074cc] text-white font-medium text-sm px-5 py-2.5 rounded shadow-sm transition-colors"
            >
              Review Pertanyaan Anda
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