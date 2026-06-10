"use client";

import { useState } from "react";
import { useNotifications, useMarkRead, useMarkAllRead } from "@/hooks/useNotifications";
import NotificationsView from "./NotificationsView";

export default function NotificationsLogic() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useNotifications(page);
  const { mutate: markRead, isPending: isMarkingOne } = useMarkRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead();

  const notifications = data?.data ?? [];
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleMarkRead(id: string) {
    markRead(id);
  }

  function handleMarkAllRead() {
    markAllRead();
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <NotificationsView
      notifications={notifications}
      isLoading={isLoading}
      isError={isError}
      unreadCount={unreadCount}
      isMarkingAll={isMarkingAll}
      currentPage={currentPage}
      lastPage={lastPage}
      onMarkRead={handleMarkRead}
      onMarkAllRead={handleMarkAllRead}
      onPageChange={handlePageChange}
    />
  );
}
