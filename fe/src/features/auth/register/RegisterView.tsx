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
    <div className="relative min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Decorative Blobs / Ilustrasi Abstrak Modern */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-200/40 to-sky-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-100/50 to-blue-200/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[460px] z-10">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex flex-col items-center group transition-transform duration-300 hover:scale-102">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_8px_30px_rgb(59,130,246,0.3)] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_8px_40px_rgb(59,130,246,0.5)]">
              <span className="text-white text-2xl font-bold tracking-wider">T</span>
            </div>

            <h1 className="mt-4 text-gray-900 text-2xl font-extrabold tracking-tight">
              Tanya<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Aksata</span>
            </h1>
            
            <p className="text-gray-500 text-sm mt-1 font-medium">
              Mulai perjalanan belajarmu di sini
            </p>
          </Link>
        </div>

        {/* Card Register */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-8 md:p-10 border border-gray-100/80">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Buat Akun Baru
            </h2>
            <p className="text-gray-500 text-sm mt-1.5">
              Isi data di bawah untuk mendaftarkan akun Anda.
            </p>
          </div>

          {/* Root Error Alert */}
          {rootError && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50/70 p-4 text-red-600 text-sm flex items-start gap-3 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <span className="font-medium">{rootError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Nama lengkap kamu"
              error={errors.name?.message}
              autoComplete="name"
              className="rounded-xl transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              {...register("name")}
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              error={errors.email?.message}
              autoComplete="email"
              className="rounded-xl transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              {...register("email")}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              error={errors.password?.message}
              autoComplete="new-password"
              className="rounded-xl transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              {...register("password")}
            />
            
            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password kamu"
              error={errors.password_confirmation?.message}
              autoComplete="new-password"
              className="rounded-xl transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              {...register("password_confirmation")}
            />

            <div className="pt-1">
              <p className="text-xs text-gray-500 leading-relaxed">
                Dengan mendaftar, kamu menyetujui{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 transition-colors">
                  Syarat & Ketentuan
                </Link>
                {" "}yang berlaku.
              </p>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              loading={isPending} 
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-[0_4px_14px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all duration-200 transform active:scale-[0.99] mt-2"
            >
              Daftar Sekarang
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-8 text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4 transition-colors">
            Masuk Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
}