"use client";

import { usePublicProfile, useFollow, useUnfollow, useIsFollowing } from "@/hooks/useProfile";
import { useUserPosts } from "@/hooks/usePosts";
import { useMe } from "@/hooks/useAuth";
import { useState } from "react";
import UserProfileView from "./UserProfileView";

interface UserProfileLogicProps {
  userId: string;
}

export default function UserProfileLogic({ userId }: UserProfileLogicProps) {
  const [postsPage, setPostsPage] = useState(1);

  // Data fetching
  const { data: user, isLoading: isLoadingUser, isError: isUserError } = usePublicProfile(userId);
  const { data: posts, isLoading: isLoadingPosts } = useUserPosts(userId, postsPage);
  const { data: me } = useMe();
  const { data: isFollowing, isLoading: isCheckingFollow } = useIsFollowing(userId);

  // Mutations
  const { mutate: follow, isPending: isFollowingPending } = useFollow(userId);
  const { mutate: unfollow, isPending: isUnfollowingPending } = useUnfollow(userId);

  // Derived state
  const isSelf = !!me && me.id === userId;
  const isLoggedIn = !!me;

  function handleFollowToggle() {
    if (isFollowing) {
      unfollow();
    } else {
      follow();
    }
  }

  function handlePostsPageChange(page: number) {
    setPostsPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <UserProfileView
      user={user ?? null}
      posts={posts?.data ?? []}
      postsTotal={posts?.total ?? 0}
      postsCurrentPage={posts?.current_page ?? 1}
      postsLastPage={posts?.last_page ?? 1}
      isLoadingUser={isLoadingUser}
      isLoadingPosts={isLoadingPosts}
      isUserError={isUserError}
      isSelf={isSelf}
      isLoggedIn={isLoggedIn}
      isFollowing={isFollowing ?? false}
      isCheckingFollow={isCheckingFollow}
      isFollowPending={isFollowingPending || isUnfollowingPending}
      onFollowToggle={handleFollowToggle}
      onPostsPageChange={handlePostsPageChange}
    />
  );
}
