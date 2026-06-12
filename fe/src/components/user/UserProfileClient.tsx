"use client";

import { usePublicProfile } from "@/hooks/useProfile";
import { useFollow, useUnfollow, useIsFollowing } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/usePosts";
import { useMe } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import PostCard from "@/components/post/PostCard";
import ReputationBadge from "./ReputationBadge";
import Spinner from "@/components/ui/Spinner";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Users,
  FileText,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface UserProfileClientProps {
  userId: string;
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const { data: user, isLoading } = usePublicProfile(userId);
  const { data: me } = useMe();
  const { data: posts, isLoading: postsLoading } = useUserPosts(userId);
  const { data: isFollowing } = useIsFollowing(userId);
  const { mutate: follow, isPending: following } = useFollow(userId);
  const { mutate: unfollow, isPending: unfollowing } = useUnfollow(userId);

  const isSelf = me?.id === userId;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-6 py-8 text-center text-[#dc2626] text-sm font-medium">
        Pengguna tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Avatar name={user.name} avatar={user.avatar} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <h1 className="text-xl font-bold text-[#1e293b]">{user.name}</h1>
            <ReputationBadge reputation={user.reputation} />
            {me && !isSelf && (
              <Button
                variant={isFollowing ? "outline" : "secondary"}
                size="sm"
                loading={following || unfollowing}
                onClick={() => (isFollowing ? unfollow() : follow())}
              >
                {isFollowing ? "Berhenti Mengikuti" : "Ikuti"}
              </Button>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-[#1e293b] mb-2">{user.bio}</p>
          )}

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
                <LinkIcon className="w-3.5 h-3.5" />
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

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-[#f0f7ff] border border-blue-200 rounded-lg mb-6 text-sm">
        <StatItem icon={<FileText className="w-4 h-4" />} value={user.posts_count ?? 0} label="Pertanyaan" />
        <StatItem icon={<Users className="w-4 h-4" />} value={user.followers_count ?? 0} label="Pengikut" />
        <StatItem icon={<Users className="w-4 h-4" />} value={user.following_count ?? 0} label="Mengikuti" />
      </div>

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-[#1e293b] mb-2 text-sm">Badge</h2>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <span
                key={badge.id}
                title={badge.description}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-blue-200 bg-white text-[#1e293b]"
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div>
        <h2 className="font-semibold text-[#1e293b] mb-3">
          Pertanyaan oleh {user.name}
        </h2>
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !posts?.data.length ? (
          <p className="text-sm text-[#64748b]">Belum ada pertanyaan.</p>
        ) : (
          <div className="border border-blue-200 rounded-lg divide-y divide-blue-100">
            {posts.data.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[#64748b]">
      {icon}
      <span className="font-semibold text-[#1e293b]">{value}</span>
      <span>{label}</span>
    </div>
  );
}
