"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePost, useUpdatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/utils";
import { X } from "lucide-react";

interface EditPostClientProps {
  postId: string;
}

export default function EditPostClient({ postId }: EditPostClientProps) {
  const router = useRouter();
  const { data: post, isLoading: loadingPost } = usePost(postId);
  const { mutate: updatePost, isPending } = useUpdatePost(postId);
  const { data: categories } = useCategories(true);

  const [form, setForm] = useState({
    title: "",
    body: "",
    category_id: "",
    edit_summary: "",
    tagInput: "",
    tags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  // Populate form once post loads
  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        body: post.body,
        category_id: post.category_id,
        edit_summary: "",
        tagInput: "",
        tags: post.tags.map((t) => t.name),
      });
    }
  }, [post]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    setGlobalError("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  function addTag() {
    const tag = form.tagInput.trim().toLowerCase();
    if (!tag || form.tags.includes(tag) || form.tags.length >= 5) return;
    setForm((p) => ({ ...p, tags: [...p.tags, tag], tagInput: "" }));
  }

  function removeTag(tag: string) {
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Judul wajib diisi";
    if (!form.body.trim()) newErrors.body = "Isi pertanyaan wajib diisi";
    if (!form.category_id) newErrors.category_id = "Pilih kategori";
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    updatePost(
      {
        title: form.title,
        body: form.body,
        category_id: form.category_id,
        tags: form.tags,
        edit_summary: form.edit_summary || undefined,
      },
      {
        onSuccess: () => router.push(`/questions/${postId}`),
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { errors?: Record<string, string[]>; message?: string } };
          };
          const apiErrors = axiosErr?.response?.data?.errors;
          if (apiErrors) {
            const mapped: Record<string, string> = {};
            for (const [k, v] of Object.entries(apiErrors)) mapped[k] = v[0];
            setErrors(mapped);
          } else {
            setGlobalError(getErrorMessage(err));
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
    return (
      <p className="text-[#c91d2e] text-sm">Pertanyaan tidak ditemukan.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {globalError && (
        <div className="p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
          {globalError}
        </div>
      )}

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Judul</h2>
        <Input
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          required
        />
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Isi Pertanyaan</h2>
        <Textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          error={errors.body}
          className="min-h-[200px]"
          required
        />
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Kategori</h2>
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
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
        {errors.category_id && (
          <p className="mt-1 text-xs text-[#c91d2e]">{errors.category_id}</p>
        )}
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">Tag</h2>
        <div className="flex flex-wrap gap-1 mb-2">
          {form.tags.map((tag) => (
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
          name="tagInput"
          value={form.tagInput}
          onChange={handleChange}
          onKeyDown={handleTagKeyDown}
          onBlur={addTag}
          placeholder="Tambah tag..."
          disabled={form.tags.length >= 5}
        />
      </div>

      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-2">
          Ringkasan Edit{" "}
          <span className="text-[#6a737c] font-normal text-sm">(opsional)</span>
        </h2>
        <Input
          name="edit_summary"
          value={form.edit_summary}
          onChange={handleChange}
          placeholder="Jelaskan apa yang kamu ubah..."
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          Simpan Perubahan
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
  );
}
