import type { RefObject } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { User, Badge } from "@/types";
import type { UpdateProfileFormData } from "@/lib/schemas";
import type { ProfileTab } from "./ProfileLogic";
import { getAvatarUrl, getReputationLevel } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";
import { Camera, CheckCircle2, MapPin, Globe, Users } from "lucide-react";

interface ProfileViewProps {
  user: User | null;
  badges: Badge[];
  following: User[];
  followers: User[];
  isLoadingUser: boolean;
  isLoadingBadges: boolean;
  isLoadingFollowing: boolean;
  isLoadingFollowers: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  activeTab: ProfileTab;
  form: UseFormReturn<UpdateProfileFormData>;
  rootError?: string;
  avatarPreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onTabChange: (tab: ProfileTab) => void;
  onAvatarClick: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "info",      label: "Informasi" },
  { key: "badges",    label: "Badge" },
  { key: "following", label: "Mengikuti" },
  { key: "followers", label: "Pengikut" },
];

export default function ProfileView({
  user,
  badges,
  following,
  followers,
  isLoadingUser,
  isLoadingBadges,
  isLoadingFollowing,
  isLoadingFollowers,
  isSaving,
  saveSuccess,
  activeTab,
  form,
  rootError,
  avatarPreview,
  fileInputRef,
  onSubmit,
  onTabChange,
  onAvatarClick,
  onAvatarChange,
}: ProfileViewProps) {
  const { register, formState: { errors } } = form;

  if (isLoadingUser) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-center text-sm text-[#64748b]">
        Silakan{" "}
        <Link href="/login" className="text-[#60a5fa] hover:underline">
          masuk
        </Link>{" "}
        untuk melihat profil.
      </div>
    );
  }

  const avatarSrc = avatarPreview ?? getAvatarUrl(user.avatar, user.name);

  return (
    <div className="px-6 py-4">

      {/* Header profil */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-blue-100">

            {/* Avatar + tombol upload */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-blue-50 ring-2 ring-blue-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarSrc}
                  alt={user!.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={onAvatarClick}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#60a5fa] text-white flex items-center justify-center hover:bg-[#3b82f6] transition-colors shadow"
                aria-label="Ganti foto profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>

            {/* Info singkat */}
            <div>
              <h1 className="text-xl font-bold text-[#1e293b]">{user!.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#64748b]">
                <span className="font-semibold text-[#1e293b]">{user!.reputation}</span>
                <span>reputasi</span>
                <span className={`px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                  getReputationLevel(user!.reputation) === "Expert"  ? "bg-amber-50 text-amber-700" :
                  getReputationLevel(user!.reputation) === "Pro"     ? "bg-blue-50 text-[#60a5fa]" :
                  getReputationLevel(user!.reputation) === "Regular" ? "bg-emerald-50 text-emerald-700" :
                                                                        "bg-slate-50 text-[#475569]"
                }`}>
                  {getReputationLevel(user!.reputation)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-[#64748b]">
                {user!.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {user!.location}
                  </span>
                )}
                {user!.website && (
                  <a
                    href={user!.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#60a5fa] hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    {user!.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {following.length} mengikuti · {followers.length} pengikut
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-px border-b border-blue-100 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? "border-[#60a5fa] text-[#3b82f6]"
                    : "border-transparent text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Informasi */}
          {activeTab === "info" && (
            <div className="max-w-lg">
              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Profil berhasil disimpan!
                </div>
              )}
              {rootError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {rootError}
                </div>
              )}

              <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                <Input
                  label="Nama Lengkap"
                  error={errors.name?.message}
                  {...register("name")}
                />

                {/* Bio */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-[#1e293b]">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    className={`w-full px-3 py-2 text-sm border rounded-lg resize-y focus:outline-none focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/20 ${
                      errors.bio ? "border-red-400" : "border-blue-200"
                    }`}
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-xs text-red-600">{errors.bio.message}</p>
                  )}
                </div>

                <Input
                  label="Lokasi"
                  placeholder="Jakarta, Indonesia"
                  error={errors.location?.message}
                  {...register("location")}
                />
                <Input
                  label="Website"
                  type="url"
                  placeholder="https://example.com"
                  error={errors.website?.message}
                  {...register("website")}
                />

                {/* Ganti password */}
                <div className="border-t border-blue-100 pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-3">Ganti Password</h3>
                  <div className="flex flex-col gap-3">
                    <Input
                      label="Password Saat Ini"
                      type="password"
                      placeholder="Wajib diisi jika ingin ganti password"
                      error={errors.current_password?.message}
                      autoComplete="current-password"
                      {...register("current_password")}
                    />
                    <Input
                      label="Password Baru"
                      type="password"
                      placeholder="Min. 6 karakter"
                      error={errors.new_password?.message}
                      autoComplete="new-password"
                      {...register("new_password")}
                    />
                    <Input
                      label="Konfirmasi Password Baru"
                      type="password"
                      placeholder="Ulangi password baru"
                      error={errors.new_password_confirmation?.message}
                      autoComplete="new-password"
                      {...register("new_password_confirmation")}
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" loading={isSaving} className="mt-2">
                  Simpan Perubahan
                </Button>
              </form>
            </div>
          )}

          {/* Tab: Badge */}
          {activeTab === "badges" && (
            <div>
              {isLoadingBadges ? (
                <Spinner />
              ) : badges.length === 0 ? (
                <p className="text-sm text-[#64748b]">Belum ada badge.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-white"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-[#1e293b]">{badge.name}</p>
                        <p className="text-xs text-[#64748b]">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Mengikuti */}
          {activeTab === "following" && (
            <UserList
              users={following}
              isLoading={isLoadingFollowing}
              emptyText="Belum mengikuti siapa pun."
            />
          )}

          {/* Tab: Pengikut */}
          {activeTab === "followers" && (
            <UserList
              users={followers}
              isLoading={isLoadingFollowers}
              emptyText="Belum ada pengikut."
            />
          )}

    </div>
  );
}

function UserList({
  users,
  isLoading,
  emptyText,
}: {
  users: User[];
  isLoading: boolean;
  emptyText: string;
}) {
  if (isLoading) return <Spinner />;
  if (users.length === 0) return <p className="text-sm text-[#64748b]">{emptyText}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {users.map((u) => (
        <Link
          key={u.id}
          href={`/users/${u.id}`}
          className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
        >
          <Avatar name={u.name} avatar={u.avatar} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-sm text-[#60a5fa] truncate">{u.name}</p>
            <p className="text-xs text-[#64748b]">{u.reputation} reputasi</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
