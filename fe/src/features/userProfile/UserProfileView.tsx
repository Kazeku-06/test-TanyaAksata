import Link from "next/link";
import type { Post, User } from "@/types";
import { timeAgo, getReputationLevel, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import PostCard from "@/components/post/PostCard";
import Pagination from "@/components/ui/Pagination";
import { MapPin, Globe, Calendar, Users, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface UserProfileViewProps {
  user: User | null;
  posts: Post[];
  postsTotal: number;
  postsCurrentPage: number;
  postsLastPage: number;
  isLoadingUser: boolean;
  isLoadingPosts: boolean;
  isUserError: boolean;
  isSelf: boolean;
  isLoggedIn: boolean;
  isFollowing: boolean;
  isCheckingFollow: boolean;
  isFollowPending: boolean;
  onFollowToggle: () => void;
  onPostsPageChange: (page: number) => void;
}

export default function UserProfileView({
  user,
  posts,
  postsTotal,
  postsCurrentPage,
  postsLastPage,
  isLoadingUser,
  isLoadingPosts,
  isUserError,
  isSelf,
  isLoggedIn,
  isFollowing,
  isCheckingFollow,
  isFollowPending,
  onFollowToggle,
  onPostsPageChange,
}: UserProfileViewProps) {

  if (isLoadingUser) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isUserError || !user) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-[#dc2626] mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Pengguna tidak ditemukan.</span>
        </div>
        <Link href="/users" className="text-sm text-[#60a5fa] hover:underline">
          ← Kembali ke Daftar Pengguna
        </Link>
      </div>
    );
  }

  const level = getReputationLevel(user.reputation);

  return (
    <div className="px-6 py-4">

      {/* ── Profile Header ── */}
      <div className="flex flex-col sm:flex-row gap-5 mb-6 pb-6 border-b border-blue-200">
        <Avatar name={user.name} avatar={user.avatar} size="xl" />

        <div className="flex-1 min-w-0">
          {/* Name + follow button */}
          <div className="flex flex-wrap items-start gap-3 mb-1.5">
            <h1 className="text-2xl font-bold text-[#1e293b]">{user.name}</h1>
            {/* Badge level reputasi */}
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-semibold mt-1",
              level === "Expert" ? "bg-amber-100 text-amber-700" :
              level === "Pro"    ? "bg-blue-100 text-blue-700" :
              level === "Regular"? "bg-emerald-100 text-emerald-700" :
                                   "bg-slate-100 text-slate-500"
            )}>
              {level}
            </span>
            {/* Follow button — hanya tampil jika bukan diri sendiri & sudah login */}
            {isLoggedIn && !isSelf && (
              <Button
                variant={isFollowing ? "outline" : "secondary"}
                size="sm"
                loading={isFollowPending || isCheckingFollow}
                onClick={onFollowToggle}
              >
                {isFollowing ? "Berhenti Mengikuti" : "Ikuti"}
              </Button>
            )}
            {/* Tombol edit profil jika ini profil sendiri */}
            {isSelf && (
              <Link href="/profile">
                <Button variant="outline" size="sm">Edit Profil</Button>
              </Link>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-[#475569] mb-2">{user.bio}</p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748b]">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#60a5fa] hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Bergabung {timeAgo(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<span className="text-[#60a5fa] font-bold text-base">{user.reputation}</span>}
          label="Reputasi"
        />
        <StatCard
          icon={<FileText className="w-5 h-5 text-[#60a5fa]" />}
          label="Pertanyaan"
          value={user.posts_count ?? 0}
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-[#059669]" />}
          label="Pengikut"
          value={user.followers_count ?? 0}
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-[#64748b]" />}
          label="Mengikuti"
          value={user.following_count ?? 0}
        />
      </div>

      {/* ── Badges ── */}
      {user.badges && user.badges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#1e293b] mb-2">Badge</h2>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <span
                key={badge.id}
                title={badge.description}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border border-blue-200 bg-white text-[#1e293b] hover:border-blue-300 transition-colors"
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Posts ── */}
      <div>
        <h2 className="text-base font-semibold text-[#1e293b] mb-3">
          Pertanyaan oleh {user.name}
          {postsTotal > 0 && (
            <span className="ml-2 text-sm font-normal text-[#64748b]">
              ({postsTotal})
            </span>
          )}
        </h2>

        {isLoadingPosts ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-[#64748b]">Belum ada pertanyaan.</p>
        ) : (
          <>
            <div className="border border-blue-200 rounded-lg divide-y divide-blue-100">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {postsLastPage > 1 && (
              <div className="flex justify-center py-4 mt-2">
                <Pagination
                  currentPage={postsCurrentPage}
                  lastPage={postsLastPage}
                  onPageChange={onPostsPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

// Komponen kecil stat card
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-[#f0f7ff]">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        {value !== undefined && (
          <p className="font-semibold text-[#1e293b] text-sm">{value}</p>
        )}
        <p className="text-xs text-[#64748b]">{label}</p>
      </div>
    </div>
  );
}
