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

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  comment:         <MessageSquare className="w-4 h-4 text-[#60a5fa]" />,
  reply:           <MessageSquare className="w-4 h-4 text-[#60a5fa]" />,
  vote:            <ThumbsUp className="w-4 h-4 text-[#3b82f6]" />,
  like:            <Heart className="w-4 h-4 text-red-500" />,
  follow:          <UserPlus className="w-4 h-4 text-emerald-600" />,
  accepted_answer: <CheckCircle className="w-4 h-4 text-emerald-600" />,
  badge:           <Award className="w-4 h-4 text-[#60a5fa]" />,
  warning:         <AlertTriangle className="w-4 h-4 text-amber-600" />,
  ban:             <Ban className="w-4 h-4 text-red-600" />,
  unban:           <CheckCircle className="w-4 h-4 text-emerald-600" />,
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
          <h1 className="text-xl font-bold text-[#1e293b]">Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#60a5fa] text-white rounded-full">
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
        <div className="flex items-center gap-2 py-8 text-sm text-red-600 justify-center">
          <AlertCircle className="w-4 h-4" />
          Gagal memuat notifikasi.
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Kamu akan mendapat notifikasi saat ada yang membalas atau memberi vote."
        />
      ) : (
        <div className="border border-blue-200 rounded-xl divide-y divide-blue-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && onMarkRead(notif.id)}
              className={cn(
                "flex items-start gap-3 p-4 transition-colors",
                !notif.is_read
                  ? "bg-blue-50 cursor-pointer hover:bg-blue-100"
                  : "bg-white"
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mt-0.5">
                {NOTIF_ICONS[notif.type] ?? <Bell className="w-4 h-4 text-[#64748b]" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm",
                  !notif.is_read ? "text-[#1e293b] font-semibold" : "text-[#475569]"
                )}>
                  {notif.message}
                </p>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  {timeAgo(notif.created_at)}
                </p>
              </div>

              {/* Unread dot */}
              {!notif.is_read && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#60a5fa] mt-1.5" />
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
