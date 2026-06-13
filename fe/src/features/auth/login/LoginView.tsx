import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { type LoginFormData } from "@/lib/schemas";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, Lock } from "lucide-react";

export default function LoginView({
  form,
  isPending,
  rootError,
  onSubmit,
}: LoginViewProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo & Brand */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-2xl bg-[#60a5fa] flex items-center justify-center shadow-lg shadow-blue-300/20 group-hover:bg-[#3b82f6] transition-colors">
              <span className="text-white font-extrabold text-2xl">T</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[#1e293b] text-2xl tracking-tight">TanyaAksata</span>
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-widest">Komunitas Tanya Jawab</span>
            </div>
          </Link>
        </div>

        <div className="bg-white border border-blue-200 rounded-2xl shadow-xl shadow-blue-200/20 overflow-hidden">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-[#1e293b] mb-2 text-center">
              Selamat Datang Kembali
            </h1>
            <p className="text-[#64748b] text-center text-sm mb-8">
              Masuk ke akun kamu untuk melanjutkan diskusi
            </p>

            {rootError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-3">
                <div className="mt-0.5">⚠️</div>
                <p>{rootError}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                error={errors.email?.message}
                autoComplete="email"
                leftIcon={<Mail size={16} />}
                {...register("email")}
              />

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#1e293b]">Password</label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  autoComplete="current-password"
                  leftIcon={<Lock size={16} />}
                  {...register("password")}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isPending}
                className="w-full mt-2 py-3 rounded-xl shadow-lg shadow-blue-200/20"
              >
                Masuk ke Akun
              </Button>
            </form>
          </div>

          <div className="bg-blue-50/50 border-t border-blue-100 p-6 text-center">
            <p className="text-sm text-[#64748b]">
              Belum punya akun?{" "}
              <Link href="/register" className="text-[#60a5fa] hover:text-[#3b82f6] font-bold">
                Daftar sekarang gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#64748b] mt-8 uppercase tracking-widest opacity-60">
          © 2026 TanyaAksata • Build with Love
        </p>

      </div>
    </div>
  );
}

interface LoginViewProps {
  form: UseFormReturn<LoginFormData>;
  isPending: boolean;
  rootError?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}
