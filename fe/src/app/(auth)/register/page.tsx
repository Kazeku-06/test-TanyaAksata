"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setGlobalError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!form.email) newErrors.email = "Email wajib diisi";
    if (!form.password) newErrors.password = "Password wajib diisi";
    if (form.password.length < 6) newErrors.password = "Password minimal 6 karakter";
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = "Konfirmasi password tidak cocok";
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    register(form, {
      onSuccess: () => router.replace("/"),
      onError: (err: unknown) => {
        const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
        const apiErrors = axiosErr?.response?.data?.errors;
        if (apiErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(apiErrors)) mapped[k] = v[0];
          setErrors(mapped);
        } else {
          setGlobalError(getErrorMessage(err));
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-lg bg-[#0a95ff] flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-[#232629] text-lg">TanyaAksata</span>
          </Link>
        </div>

        <div className="bg-white border border-[#e3e6eb] rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-semibold text-[#232629] mb-4 text-center">
            Buat Akun Baru
          </h1>

          {globalError && (
            <div className="mb-4 p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama kamu"
              error={errors.name}
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              error={errors.password}
              required
              autoComplete="new-password"
            />
            <Input
              label="Konfirmasi Password"
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Ulangi password"
              error={errors.password_confirmation}
              required
              autoComplete="new-password"
            />

            <p className="text-xs text-[#6a737c]">
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="/terms" className="text-[#0074cc] hover:underline">
                Syarat & Ketentuan
              </Link>
              .
            </p>

            <Button type="submit" variant="primary" size="lg" loading={isPending} className="w-full">
              Daftar
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6a737c] mt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-[#0074cc] hover:underline font-medium">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
