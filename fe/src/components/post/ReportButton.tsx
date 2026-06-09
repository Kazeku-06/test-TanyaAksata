"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";
import type { ReportTargetType } from "@/types";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return setError("Alasan wajib diisi");

    setLoading(true);
    setError("");
    try {
      await api.post("/reports", {
        target_type: targetType,
        target_id: targetId,
        reason: reason.trim(),
        description: description.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => { setOpen(false); setSuccess(false); }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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
              <button onClick={() => setOpen(false)} className="text-[#6a737c] hover:text-[#232629]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <p className="text-sm text-[#2e6d44] text-center py-4">
                ✓ Laporan berhasil dikirim. Terima kasih!
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input
                  label="Alasan Laporan"
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError(""); }}
                  placeholder="e.g. Spam, konten tidak pantas..."
                  error={error && !description ? error : undefined}
                  required
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#232629]">
                    Detail Tambahan <span className="text-[#6a737c] font-normal">(opsional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ceritakan lebih detail..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-[#babfc4] rounded resize-none focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20"
                  />
                </div>
                {error && <p className="text-xs text-[#c91d2e]">{error}</p>}
                <div className="flex gap-2 justify-end mt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="danger" size="sm" loading={loading}>
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
