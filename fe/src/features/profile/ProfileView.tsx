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

  // Komponen ini tidak di-SSR (ssr: false di page.tsx), jadi early return aman.
  if (isLoadingUser) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-center text-sm text-[#6a737c]">
        Silakan{" "}
        <Link href="/login" className="text-[#0074cc] hover:underline">
          masuk
        </Link>{" "}
        untuk melihat profil.
      </div>
    );
  }

  const avatarSrc = avatarPreview ?? getAvatarUrl(user.avatar, user.name);

  return (
    <div className="px-6 py-4">

      {/* ── Header profil ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-[#e3e6eb]">

            {/* Avatar + tombol upload */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-sm overflow-hidden bg-[#e1ecf4]">
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
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0a95ff] text-white flex items-center justify-center hover:bg-[#0074cc] transition-colors shadow"
                aria-label="Ganti foto profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              {/* Input file tersembunyi — dipicu oleh tombol kamera */}
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
              <h1 className="text-xl font-bold text-[#232629]">{user!.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[#6a737c]">
                <span className="font-semibold text-[#232629]">{user!.reputation}</span>
                <span>reputasi</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  getReputationLevel(user!.reputation) === "Expert"  ? "bg-[#fdf3d0] text-[#a56600]" :
                  getReputationLevel(user!.reputation) === "Pro"     ? "bg-[#e1ecf4] text-[#39739d]" :
                  getReputationLevel(user!.reputation) === "Regular" ? "bg-[#d4edda] text-[#2e6d44]" :
                                                                        "bg-[#e4e6e8] text-[#6a737c]"
                }`}>
                  {getReputationLevel(user!.reputation)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-[#6a737c]">
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
                    className="flex items-center gap-1 text-[#0074cc] hover:underline"
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

          {/* ── Tabs ── */}
          <div className="flex gap-px border-b border-[#e3e6eb] mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.key
                    ? "border-[#f48024] text-[#3b4045]"
                    : "border-transparent text-[#6a737c] hover:text-[#3b4045]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Informasi ── */}
          {activeTab === "info" && (
            <div className="max-w-lg">
              {saveSuccess && (
                <div className="mb-4 p-3 bg-[#d4edda] border border-[#9cd4b0] rounded text-sm text-[#2e6d44] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Profil berhasil disimpan!
                </div>
              )}
              {rootError && (
                <div className="mb-4 p-3 bg-[#fce8e9] border border-[#f5b8bc] rounded text-sm text-[#c91d2e]">
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
                  <label className="text-sm font-medium text-[#232629]">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    className={`w-full px-3 py-2 text-sm border rounded resize-y focus:outline-none focus:border-[#0a95ff] focus:ring-2 focus:ring-[#0a95ff]/20 ${
                      errors.bio ? "border-[#c91d2e]" : "border-[#babfc4]"
                    }`}
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-xs text-[#c91d2e]">{errors.bio.message}</p>
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
                <div className="border-t border-[#e3e6eb] pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-[#232629] mb-3">Ganti Password</h3>
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

          {/* ── Tab: Badge ── */}
          {activeTab === "badges" && (
            <div>
              {isLoadingBadges ? (
                <Spinner />
              ) : badges.length === 0 ? (
                <p className="text-sm text-[#6a737c]">Belum ada badge.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-3 border border-[#e3e6eb] rounded bg-white"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-[#232629]">{badge.name}</p>
                        <p className="text-xs text-[#6a737c]">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Mengikuti ── */}
          {activeTab === "following" && (
            <UserList
              users={following}
              isLoading={isLoadingFollowing}
              emptyText="Belum mengikuti siapa pun."
            />
          )}

          {/* ── Tab: Pengikut ── */}
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

// ── UserList ───────────────────────────────────────────────────
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
  if (users.length === 0) return <p className="text-sm text-[#6a737c]">{emptyText}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {users.map((u) => (
        <Link
          key={u.id}
          href={`/users/${u.id}`}
          className="flex items-center gap-3 p-3 border border-[#e3e6eb] rounded hover:border-[#babfc4] transition-colors bg-white"
        >
          <Avatar name={u.name} avatar={u.avatar} size="sm" />
          <div className="min-w-0">
            <p className="font-medium text-sm text-[#0074cc] truncate">{u.name}</p>
            <p className="text-xs text-[#6a737c]">{u.reputation} reputasi</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
