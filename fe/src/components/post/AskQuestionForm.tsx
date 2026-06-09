"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePost } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { getErrorMessage } from "@/lib/utils";
import { X } from "lucide-react";

export default function AskQuestionForm() {
  const router = useRouter();
  const { mutate: createPost, isPending } = useCreatePost();
  const { data: categories } = useCategories(true);

  const [form, setForm] = useState({
    title: "",
    body: "",
    category_id: "",
    tagInput: "",
    tags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
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

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Judul wajib diisi";
    else if (form.title.length < 15) newErrors.title = "Judul minimal 15 karakter";
    if (!form.body.trim()) newErrors.body = "Isi pertanyaan wajib diisi";
    else if (form.body.length < 30) newErrors.body = "Deskripsi minimal 30 karakter";
    if (!form.category_id) newErrors.category_id = "Pilih kategori";
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    createPost(
      { title: form.title, body: form.body, category_id: form.category_id, tags: form.tags },
      {
        onSuccess: (post) => router.push(`/questions/${post.id}`),
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]> } } };
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {globalError && (
        <div className="p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
          {globalError}
        </div>
      )}

      {/* Title */}
      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-1">Judul</h2>
        <p className="text-xs text-[#6a737c] mb-2">
          Bayangkan kamu bertanya kepada seseorang — apa pertanyaan spesifiknya?
        </p>
        <Input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Kenapa useEffect di React berjalan dua kali?"
          error={errors.title}
          required
        />
      </div>

      {/* Body */}
      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-1">Isi Pertanyaan</h2>
        <p className="text-xs text-[#6a737c] mb-2">
          Jelaskan masalahmu secara detail. Sertakan apa yang sudah kamu coba dan hasil yang diharapkan.
        </p>
        <Textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder="Jelaskan pertanyaan kamu di sini..."
          error={errors.body}
          className="min-h-[200px]"
          required
        />
      </div>

      {/* Category */}
      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-1">Kategori</h2>
        <p className="text-xs text-[#6a737c] mb-2">
          Pilih kategori yang paling relevan dengan pertanyaanmu.
        </p>
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className={`w-full px-3 py-2 text-sm border rounded bg-white text-[#232629] focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20 ${
            errors.category_id ? "border-[#c91d2e]" : "border-[#babfc4] hover:border-[#838c95]"
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

      {/* Tags */}
      <div className="bg-white border border-[#e3e6eb] rounded p-4">
        <h2 className="font-semibold text-[#232629] mb-1">Tag</h2>
        <p className="text-xs text-[#6a737c] mb-2">
          Tambahkan hingga 5 tag untuk mendeskripsikan topik pertanyaanmu. Tekan Enter atau koma untuk menambah.
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d]"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-[#c91d2e] transition-colors"
              >
                <X className="w-3 h-3" />
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
          placeholder="e.g. javascript, react, laravel"
          disabled={form.tags.length >= 5}
          hint={form.tags.length >= 5 ? "Maksimal 5 tag" : undefined}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          Posting Pertanyaan
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
