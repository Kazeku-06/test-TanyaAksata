import { Controller, UseFormReturn } from "react-hook-form";
import { type UpdatePostFormData } from "@/lib/schemas";
import type { Category } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import { X, AlertTriangle } from "lucide-react";

interface EditViewProps {
  form: UseFormReturn<UpdatePostFormData>;
  isPending: boolean;
  rootError?: string;
  isLoadingPost: boolean;
  isPostError: boolean;
  categories: Category[];
  isLoadingCategories: boolean;
  tags: string[];
  tagInput: string;
  editCount: number;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onTagInputChange: (value: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTagBlur: () => void;
  onTagRemove: (tag: string) => void;
  onCancel: () => void;
}

export default function EditView({
  form,
  isPending,
  rootError,
  isLoadingPost,
  isPostError,
  categories,
  isLoadingCategories,
  tags,
  tagInput,
  editCount,
  onSubmit,
  onTagInputChange,
  onTagKeyDown,
  onTagBlur,
  onTagRemove,
  onCancel,
}: EditViewProps) {
  const { register, control, formState: { errors } } = form;
  const remainingEdits = 3 - editCount;

  if (isLoadingPost) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isPostError) {
    return (
      <div className="px-6 py-8 text-center text-sm text-[#dc2626]">
        Pertanyaan tidak ditemukan atau tidak bisa diakses.
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[860px]">
      <h1 className="text-2xl font-semibold text-[#1e293b] mb-6">Edit Pertanyaan</h1>

      {/* Sisa quota edit */}
      {remainingEdits <= 1 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {remainingEdits === 0
            ? "Kamu sudah mencapai batas maksimal 3 kali edit."
            : `Kamu hanya punya ${remainingEdits} kali edit tersisa.`}
        </div>
      )}

      {rootError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#dc2626]">
          {rootError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>

        {/* Judul */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-2">Judul</h2>
          <Input error={errors.title?.message} {...register("title")} />
        </div>

        {/* Body */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-2">Isi Pertanyaan</h2>
          <Textarea
            error={errors.body?.message}
            className="min-h-[200px]"
            {...register("body")}
          />
        </div>

        {/* Kategori */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-2">Kategori</h2>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={isLoadingCategories}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white text-[#1e293b]
                  focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20
                  disabled:bg-blue-50/50
                  ${errors.category_id ? "border-[#dc2626]" : "border-blue-200"}`}
              >
                <option value="">-- Pilih Kategori --</option>
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
          <h2 className="font-semibold text-[#1e293b] mb-2">Tag</h2>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-blue-200 bg-blue-50 text-[#60a5fa]"
                >
                  {tag}
                  <button type="button" onClick={() => onTagRemove(tag)}>
                    <X className="w-3 h-3 hover:text-[#dc2626]" />
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
            placeholder="Tambah tag..."
            disabled={tags.length >= 5}
          />
        </div>

        {/* Ringkasan edit */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-[#1e293b] mb-1">
            Ringkasan Edit{" "}
            <span className="text-[#64748b] font-normal text-sm">(opsional)</span>
          </h2>
          <Input
            placeholder="Apa yang kamu ubah?"
            error={errors.edit_summary?.message}
            {...register("edit_summary")}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="lg" loading={isPending}>
            Simpan Perubahan
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={isPending}>
            Batal
          </Button>
        </div>

      </form>
    </div>
  );
}
