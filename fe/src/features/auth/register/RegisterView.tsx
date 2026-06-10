import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { type RegisterFormData } from "@/lib/schemas";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

          {rootError && (
            <div className="mb-4 p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
              {rootError}
            </div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Nama kamu"
              error={errors.name?.message}
              autoComplete="name"
              {...register("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              error={errors.password?.message}
              autoComplete="new-password"
              {...register("password")}
            />
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              error={errors.password_confirmation?.message}
              autoComplete="new-password"
              {...register("password_confirmation")}
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
