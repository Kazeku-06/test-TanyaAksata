"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });
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
    if (!form.email) newErrors.email = "Email wajib diisi";
    if (!form.password) newErrors.password = "Password wajib diisi";
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    login(form, {
      onSuccess: () => router.replace("/"),
      onError: (err: unknown) => {
        const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
        const apiErrors = axiosErr?.response?.data?.errors;
        if (apiErrors) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(apiErrors)) {
            mapped[k] = v[0];
          }
          setErrors(mapped);
        } else {
          setGlobalError(getErrorMessage(err));
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6] px-4">
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
            Masuk ke Akun
          </h1>

          {globalError && (
            <div className="mb-4 p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                required
                autoComplete="current-password"
              />
              <div className="mt-1 text-right">
                <Link href="/forgot-password" className="text-xs text-[#0074cc] hover:underline">
                  Lupa password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={isPending} className="w-full mt-1">
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#6a737c] mt-4">
          Belum punya akun?{" "}
          <Link href="/register" className="text-[#0074cc] hover:underline font-medium">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
