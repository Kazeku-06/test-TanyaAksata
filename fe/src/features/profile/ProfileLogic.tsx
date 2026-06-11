"use client";

import { useRef, useState } from "react";
import { useMe } from "@/hooks/useAuth";
import { useUpdateProfile, useMyBadges, useMyFollowing, useMyFollowers } from "@/hooks/useProfile";
import { useProfileForm } from "./useProfileForm";
import { type UpdateProfileFormData } from "@/lib/schemas";
import ProfileView from "./ProfileView";

export type ProfileTab = "info" | "badges" | "following" | "followers";

export default function ProfileLogic() {
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { data: badges, isLoading: isLoadingBadges } = useMyBadges();
  const { data: following, isLoading: isLoadingFollowing } = useMyFollowing();
  const { data: followers, isLoading: isLoadingFollowers } = useMyFollowers();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const form = useProfileForm(user);
  const { setError, formState: { errors } } = form;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [saveSuccess, setSaveSuccess] = useState(false);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type strictly
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("root", { message: "Format gambar tidak didukung. Gunakan JPEG, PNG, atau GIF." });
      e.target.value = "";
      return;
    }

    // Validate file size (2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("root", { message: "Ukuran avatar maksimal 2MB." });
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleSubmit(data: UpdateProfileFormData) {
    const payload = {
      name: data.name,
      bio: data.bio,
      location: data.location,
      website: data.website || undefined,
      current_password: data.current_password || undefined,
      new_password: data.new_password || undefined,
      new_password_confirmation: data.new_password_confirmation || undefined,
      ...(avatarFile ? { avatar: avatarFile } : {}),
    };

    updateProfile(payload, {
      onSuccess: () => {
        setSaveSuccess(true);
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
          const registeredFields = ["name", "bio", "location", "website", "current_password", "new_password", "new_password_confirmation"];
          let hasUnmappedError = false;
          let unmappedMessage = "";

          for (const [key, messages] of Object.entries(apiErrors)) {
            if (registeredFields.includes(key)) {
              setError(key as keyof UpdateProfileFormData, { message: messages[0] });
            } else {
              hasUnmappedError = true;
              unmappedMessage += messages[0] + " ";
            }
          }
          
          if (hasUnmappedError) {
             const backendMessage = axiosErr?.response?.data?.message ? axiosErr.response.data.message + " | " : "";
             setError("root", { message: backendMessage + unmappedMessage.trim() });
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
