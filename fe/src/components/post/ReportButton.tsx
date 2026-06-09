"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flag, X } from "lucide-react";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createReportSchema, type CreateReportFormData } from "@/lib/schemas";
import type { ReportTargetType } from "@/types";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateReportFormData>({
    resolver: zodResolver(createReportSchema),
  });

  function handleClose() {
    setOpen(false);
    setSuccess(false);
    reset();
  }

  async function onSubmit(data: CreateReportFormData) {
    try {
      await api.post("/reports", {
        target_type: targetType,
        target_id: targetId,
        reason: data.reason,
        description: data.description || undefined,
      });
      setSuccess(true);
      setTimeout(handleClose, 1500);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      setError("root", {
        message: axiosErr?.response?.data?.message || "Terjadi kesalahan",
      });
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-[#6a737c] hover:text-[#c91d2e] transition-colors"
      >
        <Flag className="w-3.5 h-3.5" />
        Laporkan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#232629]">Laporkan Konten</h3>
              <button onClick={handleClose} className="text-[#6a737c] hover:text-[#232629]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <p className="text-sm text-[#2e6d44] text-center py-4">
                ✓ Laporan berhasil dikirim. Terima kasih!
              </p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
                <Input
                  label="Alasan Laporan"
                  placeholder="e.g. Spam, konten tidak pantas..."
                  error={errors.reason?.message}
                  {...register("reason")}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#232629]">
                    Detail Tambahan{" "}
                    <span className="text-[#6a737c] font-normal">(opsional)</span>
                  </label>
                  <textarea
                    placeholder="Ceritakan lebih detail..."
                    rows={3}
                    className={`w-full px-3 py-2 text-sm border rounded resize-none focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20 ${
                      errors.description ? "border-[#c91d2e]" : "border-[#babfc4]"
                    }`}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-[#c91d2e]">{errors.description.message}</p>
                  )}
                </div>

                {errors.root && (
                  <p className="text-xs text-[#c91d2e]">{errors.root.message}</p>
                )}

                <div className="flex gap-2 justify-end mt-1">
                  <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                    Batal
                  </Button>
                  <Button type="submit" variant="danger" size="sm" loading={isSubmitting}>
                    Kirim Laporan
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
