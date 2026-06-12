import { useState } from "react";
import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import type { Post, Comment, Report, PostEditHistory, CommentEditHistory, ReportStatus } from "@/types";
import type { ModerationTab } from "./ModerationLogic";
import type {
  WarnUserFormData,
  BanUserFormData,
  ResolveReportFormData,
} from "@/lib/schemas";
import { timeAgo, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import {
  ShieldAlert, Trash2, FileText, Users,
  ChevronDown, ChevronRight, X, AlertTriangle,
  CheckCircle, Clock, Ban,
} from "lucide-react";

// ── Props ─────────────────────────────────────────────────────
interface ModerationViewProps {
  activeTab: ModerationTab;
  onTabChange: (tab: ModerationTab) => void;
  // Reports
  reports: Report[];
  reportTotal: number;
  reportPage: number;
  reportLastPage: number;
  reportStatus: ReportStatus | undefined;
  isLoadingReports: boolean;
  selectedReportId: string | null;
  isResolvingReport: boolean;
  resolveForm: UseFormReturn<ResolveReportFormData>;
  onReportStatusChange: (s: ReportStatus | undefined) => void;
  onReportPageChange: (p: number) => void;
  onSelectReport: (id: string | null) => void;
  onResolveSubmit: React.FormEventHandler;
  // Trashed Posts
  trashedPosts: Post[];
  trashedPostsPage: number;
  trashedPostsLastPage: number;
  isLoadingTrashedPosts: boolean;
  selectedPostHistoryId: string | null;
  postHistory: PostEditHistory[];
  onTrashedPostsPageChange: (p: number) => void;
  onSelectPostHistory: (id: string) => void;
  // Trashed Comments
  trashedComments: Comment[];
  trashedCommentsPage: number;
  trashedCommentsLastPage: number;
  isLoadingTrashedComments: boolean;
  selectedCommentHistoryId: string | null;
  commentHistory: CommentEditHistory[];
  onTrashedCommentsPageChange: (p: number) => void;
  onSelectCommentHistory: (id: string) => void;
  // User moderation
  warnTargetId: string | null;
  banTargetId: string | null;
  isWarning: boolean;
  isBanning: boolean;
  isUnbanning: boolean;
  warnForm: UseFormReturn<WarnUserFormData>;
  banForm: UseFormReturn<BanUserFormData>;
  onSetWarnTarget: (id: string | null) => void;
  onSetBanTarget: (id: string | null) => void;
  onWarnSubmit: React.FormEventHandler;
  onBanSubmit: React.FormEventHandler;
  onUnban: (userId: string) => void;
}

const TABS: { key: ModerationTab; label: string; icon: React.ReactNode }[] = [
  { key: "reports",          label: "Laporan",          icon: <ShieldAlert className="w-4 h-4" /> },
  { key: "trashed_posts",    label: "Post Dihapus",      icon: <Trash2 className="w-4 h-4" /> },
  { key: "trashed_comments", label: "Komentar Dihapus",  icon: <FileText className="w-4 h-4" /> },
  { key: "users",            label: "Manajemen User",    icon: <Users className="w-4 h-4" /> },
];

const STATUS_TABS: { value: ReportStatus | undefined; label: string }[] = [
  { value: "pending",  label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
  { value: undefined,  label: "Semua" },
];

export default function ModerationView(props: ModerationViewProps) {
  const { activeTab, onTabChange } = props;

  return (
    <div className="px-6 py-4">
      <h1 className="text-xl font-semibold text-[#232629] mb-4">Dashboard Moderasi</h1>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-px border border-[#e3e6eb] rounded overflow-hidden w-fit mb-6 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 font-medium transition-colors",
              activeTab === tab.key
                ? "bg-[#e3e6eb] text-[#232629]"
                : "bg-white text-[#6a737c] hover:bg-[#f6f6f6]"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "reports"          && <ReportsTab {...props} />}
      {activeTab === "trashed_posts"    && <TrashedPostsTab {...props} />}
      {activeTab === "trashed_comments" && <TrashedCommentsTab {...props} />}
      {activeTab === "users"            && <UsersTab {...props} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Reports
// ─────────────────────────────────────────────────────────────
function ReportsTab({
  reports, reportTotal, reportPage, reportLastPage,
  reportStatus, isLoadingReports, selectedReportId,
  isResolvingReport, resolveForm,
  onReportStatusChange, onReportPageChange,
  onSelectReport, onResolveSubmit,
}: ModerationViewProps) {
  const { register, formState: { errors } } = resolveForm;

  return (
    <div>
      {/* Status filter */}
      <div className="flex gap-px border border-[#e3e6eb] rounded overflow-hidden w-fit mb-4 text-xs">
        {STATUS_TABS.map((s) => (
          <button
            key={String(s.value)}
            onClick={() => onReportStatusChange(s.value)}
            className={cn(
              "px-3 py-1.5 font-medium transition-colors",
              reportStatus === s.value
                ? "bg-[#0a95ff] text-white"
                : "bg-white text-[#6a737c] hover:bg-[#f6f6f6]"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-[#6a737c] mb-3">
        <span className="font-medium text-[#232629]">{reportTotal}</span> laporan
      </p>

      {isLoadingReports ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-[#6a737c]">Tidak ada laporan.</p>
      ) : (
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
          {reports.map((report) => (
            <div key={report.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {/* Status badge */}
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full font-medium",
                      report.status === "pending"  && "bg-[#fdf3d0] text-[#a56600]",
                      report.status === "resolved" && "bg-[#d4edda] text-[#2e6d44]",
                      report.status === "rejected" && "bg-[#e4e6e8] text-[#6a737c]"
                    )}>
                      {report.status}
                    </span>
                    <span className="text-xs text-[#6a737c]">
                      Target: <strong>{report.target_type.split("\\").pop()}</strong>
                    </span>
                    <span className="text-xs text-[#6a737c]">{timeAgo(report.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-[#232629]">{report.reason}</p>
                  {report.reporter && (
                    <p className="text-xs text-[#6a737c] mt-0.5 mb-2">
                      Dilaporkan oleh: {report.reporter.name}
                    </p>
                  )}
                  {/* Reported Target Preview */}
                  {report.target ? (
                    <div className="mt-3 p-3 bg-[#f8f9fa] border border-[#e3e6eb] rounded text-xs text-[#232629] max-w-3xl">
                      <div className="font-semibold text-[#6a737c] mb-1.5 uppercase tracking-wider text-[10px]">
                        Konten yang Dilaporkan:
                      </div>
                      {(() => {
                        const targetType = report.target_type.split("\\").pop()?.toLowerCase();
                        if (targetType === "post") {
                          return (
                            <div className="space-y-1">
                              <div className="font-medium text-[#0074cc] hover:underline">
                                <Link href={`/questions/${report.target.id}`} target="_blank">
                                  Post: {report.target.title}
                                </Link>
                              </div>
                              <p className="text-[#3b4045] line-clamp-3 whitespace-pre-line bg-white p-2 border border-[#e3e6eb] rounded mt-1">
                                {report.target.body}
                              </p>
                              {report.target.user && (
                                <p className="text-[#6a737c] mt-1 text-[11px]">
                                  Ditulis oleh: <span className="font-medium text-[#3b4045]">{report.target.user.name}</span>
                                </p>
                              )}
                            </div>
                          );
                        } else if (targetType === "comment") {
                          return (
                            <div className="space-y-1">
                              {report.target.post && (
                                <div className="text-[#6a737c] mb-1">
                                  Komentar pada post:{" "}
                                  <Link href={`/questions/${report.target.post.id}`} target="_blank" className="text-[#0074cc] hover:underline font-medium">
                                    {report.target.post.title}
                                  </Link>
                                </div>
                              )}
                              <p className="text-[#3b4045] line-clamp-3 whitespace-pre-line bg-white p-2 border border-[#e3e6eb] rounded">
                                {report.target.body}
                              </p>
                              {report.target.user && (
                                <p className="text-[#6a737c] mt-1 text-[11px]">
                                  Ditulis oleh: <span className="font-medium text-[#3b4045]">{report.target.user.name}</span>
                                </p>
                              )}
                            </div>
                          );
                        } else if (targetType === "user") {
                          return (
                            <div className="space-y-1">
                              <div className="font-medium text-[#3b4045]">
                                User: <span className="text-[#232629] font-bold">{report.target.name}</span> ({report.target.email})
                              </div>
                              {report.target.bio && (
                                <p className="text-[#6a737c] italic mt-1 bg-white p-2 border border-[#e3e6eb] rounded">
                                  "{report.target.bio}"
                                </p>
                              )}
                              <div className="text-[11px] text-[#6a737c] mt-1">
                                Reputasi: <span className="font-medium text-[#232629]">{report.target.reputation}</span> | Terdaftar: {new Date(report.target.created_at).toLocaleDateString("id-ID")}
                              </div>
                            </div>
                          );
                        }
                        return <p className="text-[#6a737c]">Tipe target tidak dikenal</p>;
                      })()}
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-[#fdf2f2] border border-[#f5c6cb] text-[#721c24] rounded text-xs max-w-3xl">
                      Konten telah dihapus secara permanen atau tidak ditemukan.
                    </div>
                  )}
                </div>

                {/* Resolve button hanya untuk pending */}
                {report.status === "pending" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelectReport(
                      selectedReportId === report.id ? null : report.id
                    )}
                  >
                    {selectedReportId === report.id ? "Tutup" : "Proses"}
                  </Button>
                )}
              </div>

              {/* Resolve form — expand in-place */}
              {selectedReportId === report.id && (
                <form onSubmit={onResolveSubmit} className="mt-3 border-t border-[#e3e6eb] pt-3 flex flex-col gap-3" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Action */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#232629]">Tindakan</label>
                      <select
                        className="px-3 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff]"
                        {...register("action")}
                      >
                        <option value="resolve">Resolve</option>
                        <option value="reject">Reject</option>
                      </select>
                    </div>

                    {/* Action taken */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#232629]">Tindak Lanjut</label>
                      <select
                        className="px-3 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff]"
                        {...register("action_taken")}
                      >
                        <option value="ignore">Ignore (tidak ada tindakan)</option>
                        <option value="warn">Peringatan ke pemilik konten</option>
                        <option value="delete_content">Hapus konten</option>
                        <option value="ban_user">Ban user</option>
                      </select>
                    </div>
                  </div>

                  {/* Resolution note */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#232629]">
                      Catatan <span className="text-[#6a737c] font-normal">(opsional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Catatan resolusi..."
                      className="px-3 py-2 text-sm border border-[#babfc4] rounded resize-none focus:outline-none focus:border-[#0a95ff]"
                      {...register("resolution_note")}
                    />
                  </div>

                  {errors.root && (
                    <p className="text-xs text-[#c91d2e]">{errors.root.message}</p>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" loading={isResolvingReport}>
                      Simpan
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onSelectReport(null)}>
                      Batal
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {reportLastPage > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={reportPage} lastPage={reportLastPage} onPageChange={onReportPageChange} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Trashed Posts
// ─────────────────────────────────────────────────────────────
function TrashedPostsTab({
  trashedPosts, trashedPostsPage, trashedPostsLastPage,
  isLoadingTrashedPosts, selectedPostHistoryId, postHistory,
  onTrashedPostsPageChange, onSelectPostHistory,
}: ModerationViewProps) {
  return (
    <div>
      <p className="text-sm text-[#6a737c] mb-3">Post yang telah di-soft delete.</p>

      {isLoadingTrashedPosts ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : trashedPosts.length === 0 ? (
        <p className="text-sm text-[#6a737c]">Tidak ada post terhapus.</p>
      ) : (
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
          {trashedPosts.map((post) => (
            <div key={post.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#232629] line-clamp-1">{post.title}</p>
                  <p className="text-xs text-[#6a737c] mt-0.5">
                    oleh {post.user.name} · dihapus {timeAgo(post.deleted_at ?? post.updated_at)}
                  </p>
                </div>
                <button
                  onClick={() => onSelectPostHistory(post.id)}
                  className="flex items-center gap-1 text-xs text-[#0074cc] hover:underline flex-shrink-0"
                >
                  {selectedPostHistoryId === post.id
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />
                  }
                  Riwayat Edit
                </button>
              </div>

              {/* History expand */}
              {selectedPostHistoryId === post.id && (
                <div className="mt-3 border-t border-[#e3e6eb] pt-3">
                  {postHistory.length === 0 ? (
                    <p className="text-xs text-[#6a737c]">Tidak ada riwayat edit.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {postHistory.map((h) => (
                        <div key={h.id} className="text-xs bg-[#f6f6f6] rounded p-2">
                          <div className="flex items-center gap-2 mb-1 text-[#6a737c]">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(h.created_at)}</span>
                            {h.editor && <span>oleh <strong>{h.editor.name}</strong></span>}
                          </div>
                          {h.title_before !== h.title_after && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[#c91d2e] font-medium mb-0.5">Sebelum:</p>
                                <p className="text-[#232629]">{h.title_before}</p>
                              </div>
                              <div>
                                <p className="text-[#2e6d44] font-medium mb-0.5">Sesudah:</p>
                                <p className="text-[#232629]">{h.title_after}</p>
                              </div>
                            </div>
                          )}
                          {h.edit_summary && (
                            <p className="text-[#6a737c] mt-1 italic">&quot;{h.edit_summary}&quot;</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {trashedPostsLastPage > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={trashedPostsPage} lastPage={trashedPostsLastPage} onPageChange={onTrashedPostsPageChange} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Trashed Comments
// ─────────────────────────────────────────────────────────────
function TrashedCommentsTab({
  trashedComments, trashedCommentsPage, trashedCommentsLastPage,
  isLoadingTrashedComments, selectedCommentHistoryId, commentHistory,
  onTrashedCommentsPageChange, onSelectCommentHistory,
}: ModerationViewProps) {
  return (
    <div>
      <p className="text-sm text-[#6a737c] mb-3">Komentar yang telah di-soft delete.</p>

      {isLoadingTrashedComments ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : trashedComments.length === 0 ? (
        <p className="text-sm text-[#6a737c]">Tidak ada komentar terhapus.</p>
      ) : (
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
          {trashedComments.map((comment) => (
            <div key={comment.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#232629] line-clamp-2">{comment.body}</p>
                  <p className="text-xs text-[#6a737c] mt-0.5">
                    oleh {comment.user.name} · dihapus {timeAgo(comment.deleted_at ?? comment.updated_at)}
                  </p>
                </div>
                <button
                  onClick={() => onSelectCommentHistory(comment.id)}
                  className="flex items-center gap-1 text-xs text-[#0074cc] hover:underline flex-shrink-0"
                >
                  {selectedCommentHistoryId === comment.id
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />
                  }
                  Riwayat Edit
                </button>
              </div>

              {selectedCommentHistoryId === comment.id && (
                <div className="mt-3 border-t border-[#e3e6eb] pt-3">
                  {commentHistory.length === 0 ? (
                    <p className="text-xs text-[#6a737c]">Tidak ada riwayat edit.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {commentHistory.map((h) => (
                        <div key={h.id} className="text-xs bg-[#f6f6f6] rounded p-2">
                          <div className="flex items-center gap-2 mb-1 text-[#6a737c]">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(h.created_at)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[#c91d2e] font-medium mb-0.5">Sebelum:</p>
                              <p className="text-[#232629] line-clamp-3">{h.body_before}</p>
                            </div>
                            <div>
                              <p className="text-[#2e6d44] font-medium mb-0.5">Sesudah:</p>
                              <p className="text-[#232629] line-clamp-3">{h.body_after}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {trashedCommentsLastPage > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination currentPage={trashedCommentsPage} lastPage={trashedCommentsLastPage} onPageChange={onTrashedCommentsPageChange} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: User Moderation
// ─────────────────────────────────────────────────────────────
function UsersTab({
  warnTargetId, banTargetId,
  isWarning, isBanning,
  warnForm, banForm,
  onSetWarnTarget, onSetBanTarget,
  onWarnSubmit, onBanSubmit, onUnban,
}: ModerationViewProps) {
  const { register: regWarn, formState: { errors: warnErrors } } = warnForm;
  const { register: regBan, formState: { errors: banErrors } } = banForm;

  return (
    <div>
      <p className="text-sm text-[#6a737c] mb-4">
        Masukkan UUID user untuk memberikan tindakan moderasi.
      </p>

      {/* ── Warn User ── */}
      <div className="border border-[#e3e6eb] rounded p-4 mb-4">
        <h3 className="font-semibold text-sm text-[#232629] mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#a56600]" />
          Beri Peringatan (Warn)
        </h3>
        <p className="text-xs text-[#6a737c] mb-3">
          Setelah 3 kali peringatan, user otomatis di-ban 30 hari.
        </p>

        {warnTargetId ? (
          <form onSubmit={onWarnSubmit} className="flex flex-col gap-3" noValidate>
            <Input
              label="Alasan Peringatan"
              placeholder="Jelaskan alasan peringatan..."
              error={regWarn("reason") ? warnErrors.reason?.message : undefined}
              {...regWarn("reason")}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" size="sm" loading={isWarning}>
                Kirim Peringatan
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onSetWarnTarget(null)}>
                Batal
              </Button>
            </div>
          </form>
        ) : (
          <WarnBanInput
            placeholder="UUID user yang akan diperingatkan..."
            buttonLabel="Warn User"
            buttonVariant="secondary"
            onSubmit={(userId) => onSetWarnTarget(userId)}
          />
        )}
      </div>

      {/* ── Ban User ── */}
      <div className="border border-[#e3e6eb] rounded p-4 mb-4">
        <h3 className="font-semibold text-sm text-[#232629] mb-3 flex items-center gap-2">
          <Ban className="w-4 h-4 text-[#c91d2e]" />
          Ban User
        </h3>

        {banTargetId ? (
          <form onSubmit={onBanSubmit} className="flex flex-col gap-3" noValidate>
            <Input
              label="Durasi (hari)"
              type="number"
              placeholder="30"
              error={banErrors.days?.message}
              {...regBan("days", { valueAsNumber: true })}
            />
            <Input
              label="Alasan"
              placeholder="Alasan ban (opsional)..."
              {...regBan("reason")}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="danger" size="sm" loading={isBanning}>
                Ban User
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onSetBanTarget(null)}>
                Batal
              </Button>
            </div>
          </form>
        ) : (
          <WarnBanInput
            placeholder="UUID user yang akan di-ban..."
            buttonLabel="Ban User"
            buttonVariant="danger"
            onSubmit={(userId) => onSetBanTarget(userId)}
          />
        )}
      </div>

      {/* ── Unban User ── */}
      <div className="border border-[#e3e6eb] rounded p-4">
        <h3 className="font-semibold text-sm text-[#232629] mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2e6d44]" />
          Unban User
        </h3>
        <WarnBanInput
          placeholder="UUID user yang akan di-unban..."
          buttonLabel="Unban User"
          buttonVariant="primary"
          onSubmit={(userId) => onUnban(userId)}
        />
      </div>
    </div>
  );
}

// ── Helper: input + button untuk warn/ban/unban ───────────────
function WarnBanInput({
  placeholder,
  buttonLabel,
  buttonVariant,
  onSubmit,
}: {
  placeholder: string;
  buttonLabel: string;
  buttonVariant: "primary" | "secondary" | "danger" | "ghost" | "outline";
  onSubmit: (userId: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff]"
      />
      <Button
        variant={buttonVariant}
        size="sm"
        onClick={() => { if (value.trim()) onSubmit(value.trim()); }}
        disabled={!value.trim()}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
