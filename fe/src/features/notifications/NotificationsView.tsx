import type { Notification } from "@/types";
import { timeAgo, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import {
  Bell, MessageSquare, ThumbsUp, Heart,
  UserPlus, CheckCircle, Award, AlertTriangle,
  Ban, AlertCircle,
} from "lucide-react";

interface NotificationsViewProps {
  notifications: Notification[];
  isLoading: boolean;
  isError: boolean;
  unreadCount: number;
  isMarkingAll: boolean;
  currentPage: number;
  lastPage: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onPageChange: (page: number) => void;
}

// Icon per tipe notifikasi
const NOTIF_ICONS: Record<string, React.ReactNode> = {
  comment:         <MessageSquare className="w-4 h-4 text-[#0a95ff]" />,
  reply:           <MessageSquare className="w-4 h-4 text-[#0a95ff]" />,
  vote:            <ThumbsUp className="w-4 h-4 text-[#f48024]" />,
  like:            <Heart className="w-4 h-4 text-[#c91d2e]" />,
  follow:          <UserPlus className="w-4 h-4 text-[#2e6d44]" />,
  accepted_answer: <CheckCircle className="w-4 h-4 text-[#2e6d44]" />,
  badge:           <Award className="w-4 h-4 text-[#f48024]" />,
  warning:         <AlertTriangle className="w-4 h-4 text-[#a56600]" />,
  ban:             <Ban className="w-4 h-4 text-[#c91d2e]" />,
  unban:           <CheckCircle className="w-4 h-4 text-[#2e6d44]" />,
};

export default function NotificationsView({
  notifications,
  isLoading,
  isError,
  unreadCount,
  isMarkingAll,
  currentPage,
  lastPage,
  onMarkRead,
  onMarkAllRead,
  onPageChange,
}: NotificationsViewProps) {
  return (
    <div className="px-6 py-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-[#232629]">Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#c91d2e] text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            loading={isMarkingAll}
            onClick={onMarkAllRead}
          >
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[#c91d2e] justify-center">
          <AlertCircle className="w-4 h-4" />
          Gagal memuat notifikasi.
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Kamu akan mendapat notifikasi saat ada yang membalas atau memberi vote."
        />
      ) : (
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && onMarkRead(notif.id)}
              className={cn(
                "flex items-start gap-3 p-4 transition-colors",
                !notif.is_read
                  ? "bg-[#f0f8ff] cursor-pointer hover:bg-[#e1ecf4]"
                  : "bg-white"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[#e3e6eb] flex items-center justify-center mt-0.5">
                {NOTIF_ICONS[notif.type] ?? <Bell className="w-4 h-4 text-[#6a737c]" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm",
                  !notif.is_read ? "text-[#232629] font-medium" : "text-[#3b4045]"
                )}>
                  {notif.message}
                </p>
                <p className="text-xs text-[#9199a1] mt-0.5">
                  {timeAgo(notif.created_at)}
                </p>
              </div>

              {/* Unread dot */}
              {!notif.is_read && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#0a95ff] mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && !isLoading && (
        <div className="flex justify-center py-4 mt-2">
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={onPageChange}
          />
        </div>
      )}

    </div>
  );
}
