"use client";

import { useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import {
  useTrashedPosts,
  useTrashedComments,
  useModerationReports,
  useResolveReport,
  useWarnUser,
  useBanUser,
  useUnbanUser,
  usePostEditHistory,
  useCommentEditHistory,
} from "@/hooks/useModeration";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  warnUserSchema,
  banUserSchema,
  resolveReportSchema,
  type WarnUserFormData,
  type BanUserFormData,
  type ResolveReportFormData,
} from "@/lib/schemas";
import type { ReportStatus } from "@/types";
import ModerationView from "./ModerationView";
import Spinner from "@/components/ui/Spinner";

// Tab yang tersedia
export type ModerationTab = "reports" | "trashed_posts" | "trashed_comments" | "users";

export default function ModerationLogic() {
  // Guard: hanya admin atau moderator yang boleh akses
  const { isAllowed, isLoading: isLoadingRole } = useRoleGuard(["admin", "moderator"]);

  const [activeTab, setActiveTab] = useState<ModerationTab>("reports");

  // ── Reports state ──────────────────────────────────────────
  const [reportStatus, setReportStatus] = useState<ReportStatus | undefined>("pending");
  const [reportPage, setReportPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // ── Trashed Posts state ─────────────────────────────────────
  const [trashedPostsPage, setTrashedPostsPage] = useState(1);
  const [selectedPostHistoryId, setSelectedPostHistoryId] = useState<string | null>(null);

  // ── Trashed Comments state ──────────────────────────────────
  const [trashedCommentsPage, setTrashedCommentsPage] = useState(1);
  const [selectedCommentHistoryId, setSelectedCommentHistoryId] = useState<string | null>(null);

  // ── User moderation state ───────────────────────────────────
  // Id user yang sedang di-modal (warn/ban)
  const [warnTargetId, setWarnTargetId] = useState<string | null>(null);
  const [banTargetId, setBanTargetId]   = useState<string | null>(null);

  // ── Data fetching ───────────────────────────────────────────
  const { data: reportsData, isLoading: isLoadingReports } =
    useModerationReports(reportStatus, reportPage);

  const { data: trashedPostsData, isLoading: isLoadingTrashedPosts } =
    useTrashedPosts(trashedPostsPage);

  const { data: trashedCommentsData, isLoading: isLoadingTrashedComments } =
    useTrashedComments(trashedCommentsPage);

  const { data: postHistory } = usePostEditHistory(selectedPostHistoryId ?? "");
  const { data: commentHistory } = useCommentEditHistory(selectedCommentHistoryId ?? "");

  // ── Mutations ───────────────────────────────────────────────
  const { mutate: resolveReport, isPending: isResolvingReport } = useResolveReport();
  const { mutate: warnUser,  isPending: isWarning }  = useWarnUser();
  const { mutate: banUser,   isPending: isBanning }  = useBanUser();
  const { mutate: unbanUser, isPending: isUnbanning } = useUnbanUser();

  // ── Forms ───────────────────────────────────────────────────
  const warnForm = useForm<WarnUserFormData>({
    resolver: zodResolver(warnUserSchema),
    defaultValues: { reason: "" },
  });

  const banForm = useForm<BanUserFormData>({
    resolver: zodResolver(banUserSchema),
    defaultValues: { days: 30, reason: "" },
  });

  const resolveForm = useForm<ResolveReportFormData>({
    resolver: zodResolver(resolveReportSchema),
    defaultValues: { action: "resolve", action_taken: "ignore", resolution_note: "" },
  });

  // ── Handlers ───────────────────────────────────────────────

  function handleWarnSubmit(data: WarnUserFormData) {
    if (!warnTargetId) return;
    warnUser(
      { userId: warnTargetId, reason: data.reason },
      { onSuccess: () => { warnForm.reset(); setWarnTargetId(null); } }
    );
  }

  function handleBanSubmit(data: BanUserFormData) {
    if (!banTargetId) return;
    banUser(
      { userId: banTargetId, days: data.days, reason: data.reason },
      { onSuccess: () => { banForm.reset(); setBanTargetId(null); } }
    );
  }

  function handleUnban(userId: string) {
    if (!confirm("Yakin ingin unban user ini?")) return;
    unbanUser({ userId });
  }

  function handleResolveSubmit(data: ResolveReportFormData) {
    if (!selectedReportId) return;
    resolveReport(
      {
        id: selectedReportId,
        action: data.action,
        action_taken: data.action_taken,
        resolution_note: data.resolution_note,
      },
      { onSuccess: () => { resolveForm.reset(); setSelectedReportId(null); } }
    );
  }

  // Tampilkan spinner saat cek role, atau jika tidak punya akses
  if (isLoadingRole || !isAllowed) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ModerationView
      // Tab
      activeTab={activeTab}
      onTabChange={setActiveTab}

      // Reports
      reports={reportsData?.data ?? []}
      reportTotal={reportsData?.total ?? 0}
      reportPage={reportPage}
      reportLastPage={reportsData?.last_page ?? 1}
      reportStatus={reportStatus}
      isLoadingReports={isLoadingReports}
      selectedReportId={selectedReportId}
      isResolvingReport={isResolvingReport}
      resolveForm={resolveForm}
      onReportStatusChange={(s) => { setReportStatus(s); setReportPage(1); }}
      onReportPageChange={setReportPage}
      onSelectReport={setSelectedReportId}
      onResolveSubmit={resolveForm.handleSubmit(handleResolveSubmit)}

      // Trashed Posts
      trashedPosts={trashedPostsData?.data ?? []}
      trashedPostsPage={trashedPostsPage}
      trashedPostsLastPage={trashedPostsData?.last_page ?? 1}
      isLoadingTrashedPosts={isLoadingTrashedPosts}
      selectedPostHistoryId={selectedPostHistoryId}
      postHistory={postHistory ?? []}
      onTrashedPostsPageChange={setTrashedPostsPage}
      onSelectPostHistory={(id) =>
        setSelectedPostHistoryId((prev) => (prev === id ? null : id))
      }

      // Trashed Comments
      trashedComments={trashedCommentsData?.data ?? []}
      trashedCommentsPage={trashedCommentsPage}
      trashedCommentsLastPage={trashedCommentsData?.last_page ?? 1}
      isLoadingTrashedComments={isLoadingTrashedComments}
      selectedCommentHistoryId={selectedCommentHistoryId}
      commentHistory={commentHistory ?? []}
      onTrashedCommentsPageChange={setTrashedCommentsPage}
      onSelectCommentHistory={(id) =>
        setSelectedCommentHistoryId((prev) => (prev === id ? null : id))
      }

      // User moderation
      warnTargetId={warnTargetId}
      banTargetId={banTargetId}
      isWarning={isWarning}
      isBanning={isBanning}
      isUnbanning={isUnbanning}
      warnForm={warnForm}
      banForm={banForm}
      onSetWarnTarget={setWarnTargetId}
      onSetBanTarget={setBanTargetId}
      onWarnSubmit={warnForm.handleSubmit(handleWarnSubmit)}
      onBanSubmit={banForm.handleSubmit(handleBanSubmit)}
      onUnban={handleUnban}
    />
  );
}
