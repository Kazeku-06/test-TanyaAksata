import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileFormData } from "@/lib/schemas";
import type { User } from "@/types";

// Form hook untuk halaman "Profil Sendiri"
// Pre-fill dari data user yang sedang login
export function useProfileForm(user: User | undefined) {
  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
      location: "",
      website: "",
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  // Reset form saat data user tersedia
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    }
  }, [user, form]);

  return form;
}
