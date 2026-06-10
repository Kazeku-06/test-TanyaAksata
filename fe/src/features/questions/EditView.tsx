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
      <div className="px-6 py-8 text-center text-sm text-[#c91d2e]">
        Pertanyaan tidak ditemukan atau tidak bisa diakses.
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[860px]">
      <h1 className="text-2xl font-semibold text-[#232629] mb-6">Edit Pertanyaan</h1>

      {/* Sisa quota edit */}
      {remainingEdits <= 1 && (
        <div className="mb-4 p-3 bg-[#fdf3d0] border border-[#f5d67d] rounded text-sm text-[#a56600] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {remainingEdits === 0
            ? "Kamu sudah mencapai batas maksimal 3 kali edit."
            : `Kamu hanya punya ${remainingEdits} kali edit tersisa.`}
        </div>
      )}

      {rootError && (
        <div className="mb-4 p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
          {rootError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>

        {/* Judul */}
        <div className="bg-white border border-[#e3e6eb] rounded p-4">
          <h2 className="font-semibold text-[#232629] mb-2">Judul</h2>
          <Input error={errors.title?.message} {...register("title")} />
        </div>

        {/* Body */}
        <div className="bg-white border border-[#e3e6eb] rounded p-4">
          <h2 className="font-semibold text-[#232629] mb-2">Isi Pertanyaan</h2>
          <Textarea
            error={errors.body?.message}
            className="min-h-[200px]"
            {...register("body")}
          />
        </div>

        {/* Kategori */}
        <div className="bg-white border border-[#e3e6eb] rounded p-4">
          <h2 className="font-semibold text-[#232629] mb-2">Kategori</h2>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={isLoadingCategories}
                className={`w-full px-3 py-2 text-sm border rounded bg-white text-[#232629]
                  focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20
                  disabled:bg-[#f6f6f6]
                  ${errors.category_id ? "border-[#c91d2e]" : "border-[#babfc4]"}`}
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
            <p className="mt-1 text-xs text-[#c91d2e]">{errors.category_id.message}</p>
          )}
        </div>

        {/* Tag */}
        <div className="bg-white border border-[#e3e6eb] rounded p-4">
          <h2 className="font-semibold text-[#232629] mb-2">Tag</h2>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d]"
                >
                  {tag}
                  <button type="button" onClick={() => onTagRemove(tag)}>
                    <X className="w-3 h-3 hover:text-[#c91d2e]" />
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
        <div className="bg-white border border-[#e3e6eb] rounded p-4">
          <h2 className="font-semibold text-[#232629] mb-1">
            Ringkasan Edit{" "}
            <span className="text-[#6a737c] font-normal text-sm">(opsional)</span>
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
