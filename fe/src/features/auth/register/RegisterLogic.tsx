"use client";

import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useAuth";
import { useRegisterForm } from "./useRegisterForm";
import { type RegisterFormData } from "@/lib/schemas";
import RegisterView from "./RegisterView";

export default function RegisterLogic() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const form = useRegisterForm();

  const { setError, formState: { errors } } = form;

  function handleSubmit(data: RegisterFormData) {
    register(data, {
      onSuccess: () => {
        router.replace("/");
      },
      onError: (err: unknown) => {
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
          for (const [key, messages] of Object.entries(apiErrors)) {
            setError(key as keyof RegisterFormData, { message: messages[0] });
          }
        } else {
          setError("root", {
            message:
              axiosErr?.response?.data?.message ||
              "Terjadi kesalahan saat mendaftar",
          });
        }
      },
    });
  }

  return (
    <RegisterView
      form={form}
      isPending={isPending}
      rootError={errors.root?.message}
      onSubmit={form.handleSubmit(handleSubmit)}
    />
  );
}
