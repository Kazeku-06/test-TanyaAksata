"use client";

import { useRef, useState } from "react";
import { useMe } from "@/hooks/useAuth";
import { useUpdateProfile, useMyBadges, useMyFollowing, useMyFollowers } from "@/hooks/useProfile";
import { useProfileForm } from "./useProfileForm";
import { type UpdateProfileFormData } from "@/lib/schemas";
import ProfileView from "./ProfileView";

// Tab yang tersedia di halaman profil
export type ProfileTab = "info" | "badges" | "following" | "followers";

export default function ProfileLogic() {
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { data: badges, isLoading: isLoadingBadges } = useMyBadges();
  const { data: following, isLoading: isLoadingFollowing } = useMyFollowing();
  const { data: followers, isLoading: isLoadingFollowers } = useMyFollowers();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const form = useProfileForm(user);
  const { setError, formState: { errors } } = form;

  // Avatar preview
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Tab aktif
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");

  // Success message setelah save
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handler pilih avatar baru
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    // Buat preview URL lokal
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  // Handler submit form profil
  function handleSubmit(data: UpdateProfileFormData) {
    const payload = {
      ...data,
      // Sertakan file avatar hanya jika ada yang dipilih
      avatar: avatarFile ?? undefined,
    };

    updateProfile(payload as Parameters<typeof updateProfile>[0], {
      onSuccess: () => {
        setSaveSuccess(true);
        // Reset password fields
        form.setValue("current_password", "");
        form.setValue("new_password", "");
        form.setValue("new_password_confirmation", "");
        setAvatarFile(null);
        setTimeout(() => setSaveSuccess(false), 3000);
      },
      onError: (err: unknown) => {
        const axiosErr = err as {
          response?: { data?: { errors?: Record<string, string[]>; message?: string } };
        };
        const apiErrors = axiosErr?.response?.data?.errors;
        if (apiErrors) {
          for (const [key, messages] of Object.entries(apiErrors)) {
            setError(key as keyof UpdateProfileFormData, { message: messages[0] });
          }
        } else {
          setError("root", {
            message: axiosErr?.response?.data?.message || "Gagal menyimpan profil",
          });
        }
      },
    });
  }

  return (
    <ProfileView
      user={user ?? null}
      badges={badges ?? []}
      following={following ?? []}
      followers={followers ?? []}
      isLoadingUser={isLoadingUser}
      isLoadingBadges={isLoadingBadges}
      isLoadingFollowing={isLoadingFollowing}
      isLoadingFollowers={isLoadingFollowers}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      activeTab={activeTab}
      form={form}
      rootError={errors.root?.message}
      avatarPreview={avatarPreview}
      fileInputRef={fileInputRef}
      onSubmit={form.handleSubmit(handleSubmit)}
      onTabChange={setActiveTab}
      onAvatarClick={handleAvatarClick}
      onAvatarChange={handleAvatarChange}
    />
  );
}
