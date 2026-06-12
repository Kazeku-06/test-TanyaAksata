import { Controller, UseFormReturn } from "react-hook-form";
import { type CreatePostFormData } from "@/lib/schemas";
import type { Category } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { X } from "lucide-react";

interface AskViewProps {
  form: UseFormReturn<CreatePostFormData>;
  isPending: boolean;
  rootError?: string;
  categories: Category[];
  isLoadingCategories: boolean;
  tags: string[];
  tagInput: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onTagInputChange: (value: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTagBlur: () => void;
  onTagRemove: (tag: string) => void;
  onCancel: () => void;
}

export default function AskView({
  form,
  isPending,
  rootError,
  categories,
  isLoadingCategories,
  tags,
  tagInput,
  onSubmit,
  onTagInputChange,
  onTagKeyDown,
  onTagBlur,
  onTagRemove,
  onCancel,
}: AskViewProps) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="px-6 py-6 max-w-[860px]">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1e293b] mb-1">
          Ajukan Pertanyaan Publik
        </h1>
        <p className="text-sm text-[#64748b]">
          Tuliskan masalah kamu dengan jelas agar mudah dijawab oleh komunitas.
        </p>
      </div>

      {rootError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#dc2626]">
          {rootError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>

        {/* Judul */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-1">Judul</h2>
          <p className="text-xs text-[#64748b] mb-2">
            Tulis pertanyaan spesifikmu dalam satu kalimat.
          </p>
          <Input
            placeholder="e.g. Kenapa useEffect di React berjalan dua kali?"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        {/* Isi pertanyaan */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-1">Isi Pertanyaan</h2>
          <p className="text-xs text-[#64748b] mb-2">
            Jelaskan masalahmu, apa yang sudah dicoba, dan hasil yang diharapkan.
          </p>
          <Textarea
            placeholder="Jelaskan pertanyaan kamu di sini..."
            error={errors.body?.message}
            className="min-h-[200px]"
            {...register("body")}
          />
        </div>

        {/* Kategori */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-1">Kategori</h2>
          <p className="text-xs text-[#64748b] mb-2">
            Pilih kategori yang paling relevan.
          </p>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={isLoadingCategories}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#1e293b]
                  focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20
                  disabled:bg-blue-50/50 disabled:cursor-not-allowed
                  ${errors.category_id ? "border-[#dc2626]" : "border-blue-200 hover:border-blue-300"}`}
              >
                <option value="">
                  {isLoadingCategories ? "Memuat kategori..." : "-- Pilih Kategori --"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.category_id && (
            <p className="mt-1 text-xs text-[#dc2626]">{errors.category_id.message}</p>
          )}
        </div>

        {/* Tag */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-1">Tag</h2>
          <p className="text-xs text-[#64748b] mb-2">
            Tambahkan hingga 5 tag. Tekan <kbd className="px-1 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px]">Enter</kbd> atau koma untuk menambah.
          </p>

          {/* Tag badges */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-blue-200 bg-blue-50 text-[#60a5fa]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onTagRemove(tag)}
                    className="hover:text-[#dc2626] transition-colors"
                    aria-label={`Hapus tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Input
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={onTagBlur}
            placeholder="e.g. javascript, react, laravel"
            disabled={tags.length >= 5}
            hint={tags.length >= 5 ? "Maksimal 5 tag sudah tercapai" : undefined}
          />
          {errors.tags && (
            <p className="mt-1 text-xs text-[#dc2626]">{errors.tags.message}</p>
          )}
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
            onClick={onCancel}
            disabled={isPending}
          >
            Batal
          </Button>
        </div>

      </form>
    </div>
  );
}
