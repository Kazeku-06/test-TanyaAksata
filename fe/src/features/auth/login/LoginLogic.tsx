"use client";

import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { useLoginForm } from "./useLoginForm";
import { type LoginFormData } from "@/lib/schemas";
import LoginView from "./LoginView";

// LoginLogic — mengelola semua logic halaman login
// - Inisialisasi form hook
// - Handle submit dan API call
// - Map error dari API ke field form
// - Tidak ada JSX UI di sini, hanya kirim props ke LoginView
export default function LoginLogic() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const form = useLoginForm();

  const { setError, formState: { errors } } = form;

  // Dipanggil saat form submit dan lolos validasi Zod
  function handleSubmit(data: LoginFormData) {
    login(data, {
      onSuccess: () => {
        router.replace("/");
      },
      onError: (err: unknown) => {
        // Coba ambil error validasi per field dari Laravel
        const axiosErr = err as {
          response?: {
            data?: {
              errors?: Record<string, string[]>;
              message?: string;
            };
          };
        };

        const apiErrors = axiosErr?.response?.data?.errors;

        if (apiErrors) {
          // Map error field dari Laravel ke RHF
          for (const [key, messages] of Object.entries(apiErrors)) {
            setError(key as keyof LoginFormData, { message: messages[0] });
          }
        } else {
          // Error umum (email salah, akun banned, dll) → root error
          setError("root", {
            message:
              axiosErr?.response?.data?.message ||
              "Email atau password salah",
          });
        }
      },
    });
  }

  return (
    <LoginView
      form={form}
      isPending={isPending}
      rootError={errors.root?.message}
      onSubmit={form.handleSubmit(handleSubmit)}
    />
  );
}
