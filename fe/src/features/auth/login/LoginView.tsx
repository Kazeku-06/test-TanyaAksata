import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { type LoginFormData } from "@/lib/schemas";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, Lock } from "lucide-react";

// Props yang diterima LoginView dari LoginLogic
interface LoginViewProps {
  form: UseFormReturn<LoginFormData>;
  isPending: boolean;
  rootError?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

// LoginView — murni tampilan, tidak ada logic di sini
export default function LoginView({
  form,
  isPending,
  rootError,
  onSubmit,
}: LoginViewProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6f6f6] to-[#e1ecf4] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo & Brand */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-[#0a95ff] flex items-center justify-center shadow-lg group-hover:bg-[#0074cc] transition-colors">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[#232629] text-2xl tracking-tight">TanyaAksata</span>
              <span className="text-xs text-[#6a737c] font-medium uppercase tracking-widest">Komunitas Tanya Jawab</span>
            </div>
          </Link>
        </div>

        <div className="bg-white border border-[#e3e6eb] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-[#232629] mb-2 text-center">
              Selamat Datang Kembali
            </h1>
            <p className="text-[#6a737c] text-center text-sm mb-8">
              Masuk ke akun kamu untuk melanjutkan diskusi
            </p>

            {/* Error umum (bukan per-field) */}
            {rootError && (
              <div className="mb-6 p-4 bg-[#fce8e9] border border-[#f5b8bc] rounded-xl text-sm text-[#c91d2e] flex items-start gap-3">
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
                  <label className="text-sm font-medium text-[#232629]">Password</label>
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
                className="w-full mt-2 py-3 rounded-xl shadow-md shadow-[#0a95ff]/20"
              >
                Masuk ke Akun
              </Button>
            </form>
          </div>

          <div className="bg-[#f8f9f9] border-t border-[#e3e6eb] p-6 text-center">
            <p className="text-sm text-[#6a737c]">
              Belum punya akun?{" "}
              <Link href="/register" className="text-[#0074cc] hover:text-[#005999] font-bold">
                Daftar sekarang gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#6a737c] mt-8 uppercase tracking-widest opacity-60">
          © 2026 TanyaAksata • Build with Love
        </p>

      </div>
    </div>
  );
}
