"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { loginSchema, type LoginFormData } from "@/lib/schemas";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginFormData) {
    login(data, {
      onSuccess: () => router.replace("/"),
      onError: (err: unknown) => {
        const axiosErr = err as {
          response?: { data?: { errors?: Record<string, string[]>; message?: string } };
        };
        const apiErrors = axiosErr?.response?.data?.errors;
        if (apiErrors) {
          for (const [key, messages] of Object.entries(apiErrors)) {
            setError(key as keyof LoginFormData, { message: messages[0] });
          }
        } else {
          setError("root", {
            message: axiosErr?.response?.data?.message || "Email atau password salah",
          });
        }
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6] px-4">
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
            Masuk ke Akun
          </h1>

          {errors.root && (
            <div className="mb-4 p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register("email")}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                autoComplete="current-password"
                {...register("password")}
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
