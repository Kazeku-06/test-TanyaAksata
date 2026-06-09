"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(data: RegisterFormData) {
    register(data, {
      onSuccess: () => router.replace("/"),
      onError: (err: unknown) => {
        const axiosErr = err as {
          response?: { data?: { errors?: Record<string, string[]>; message?: string } };
        };
        const apiErrors = axiosErr?.response?.data?.errors;
        if (apiErrors) {
          for (const [key, messages] of Object.entries(apiErrors)) {
            setError(key as keyof RegisterFormData, { message: messages[0] });
          }
        } else {
          setError("root", {
            message: axiosErr?.response?.data?.message || "Terjadi kesalahan saat mendaftar",
          });
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6] px-4 py-8">
      <div className="w-full max-w-sm">
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

          {errors.root && (
            <div className="mb-4 p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Nama kamu"
              error={errors.name?.message}
              autoComplete="name"
              {...registerField("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              error={errors.email?.message}
              autoComplete="email"
              {...registerField("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              error={errors.password?.message}
              autoComplete="new-password"
              {...registerField("password")}
            />
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              error={errors.password_confirmation?.message}
              autoComplete="new-password"
              {...registerField("password_confirmation")}
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
