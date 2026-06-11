import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { type RegisterFormData } from "@/lib/schemas";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { User, Mail, Lock } from "lucide-react";

interface RegisterViewProps {
  form: UseFormReturn<RegisterFormData>;
  isPending: boolean;
  rootError?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export default function RegisterView({
  form,
  isPending,
  rootError,
  onSubmit,
}: RegisterViewProps) {
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
              Buat Akun Baru
            </h1>
            <p className="text-[#6a737c] text-center text-sm mb-8">
              Bergabung dengan ribuan pengembang lainnya
            </p>

            {rootError && (
              <div className="mb-6 p-4 bg-[#fce8e9] border border-[#f5b8bc] rounded-xl text-sm text-[#c91d2e] flex items-start gap-3">
                <div className="mt-0.5">⚠️</div>
                <p>{rootError}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Nama Lengkap"
                type="text"
                placeholder="Masukkan nama lengkap kamu"
                error={errors.name?.message}
                autoComplete="name"
                leftIcon={<User size={16} />}
                {...register("name")}
              />
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                error={errors.email?.message}
                autoComplete="email"
                leftIcon={<Mail size={16} />}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Minimal 6 karakter"
                error={errors.password?.message}
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                {...register("password")}
              />
              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password di atas"
                error={errors.password_confirmation?.message}
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                {...register("password_confirmation")}
              />

              <div className="mt-2 p-3 bg-[#f8f9f9] rounded-lg border border-[#e3e6eb]">
                <p className="text-[11px] text-[#6a737c] leading-relaxed">
                  Dengan mendaftar, kamu menyetujui{" "}
                  <Link href="/terms" className="text-[#0074cc] hover:underline font-semibold">
                    Syarat & Ketentuan
                  </Link>
                  {" "}serta{" "}
                  <Link href="/privacy" className="text-[#0074cc] hover:underline font-semibold">
                    Kebijakan Privasi
                  </Link>
                  {" "}kami.
                </p>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                loading={isPending} 
                className="w-full mt-2 py-3 rounded-xl shadow-md shadow-[#0a95ff]/20"
              >
                Daftar Akun Baru
              </Button>
            </form>
          </div>

          <div className="bg-[#f8f9f9] border-t border-[#e3e6eb] p-6 text-center">
            <p className="text-sm text-[#6a737c]">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-[#0074cc] hover:text-[#005999] font-bold">
                Masuk sekarang
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#6a737c] mt-8 uppercase tracking-widest opacity-60">
          © 2026 TanyaAksata • Bergabunglah Bersama Kami
        </p>

      </div>
    </div>
  );
}
