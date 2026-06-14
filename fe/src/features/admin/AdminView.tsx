import type { UseFormReturn } from "react-hook-form";
import type { User, Report, AdminStatistics, ActivityTrend, Category, ReportStatus, PostEditHistory, CommentEditHistory } from "@/types";
import type { AdminTab, RoleFormData, CategoryFormData } from "./AdminLogic";
import type { ResolveReportFormData } from "@/lib/schemas";
import { timeAgo, formatCount, cn } from "@/lib/utils";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import {
  BarChart2, Users, FileText, ShieldAlert,
  Tag, TrendingUp, Plus, Pencil, Trash2,
  X, CheckCircle, Clock,
} from "lucide-react";

// ── Props ─────────────────────────────────────────────────────
interface AdminViewProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  // Statistics
  statistics: AdminStatistics | null;
  trend: ActivityTrend[];
  isLoadingStats: boolean;
  isLoadingTrend: boolean;
  // Users & Roles
  users: User[];
  isLoadingUsers: boolean;
  isAssigning: boolean;
  isRemoving: boolean;
  assignForm: UseFormReturn<RoleFormData>;
  removeForm: UseFormReturn<RoleFormData>;
  onAssignRole: React.FormEventHandler;
  onRemoveRole: React.FormEventHandler;
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
  // Edit history for reported targets
  selectedPostHistoryId: string | null;
  selectedCommentHistoryId: string | null;
  postHistory: PostEditHistory[];
  commentHistory: CommentEditHistory[];
  onSelectPostHistory: (id: string) => void;
  onSelectCommentHistory: (id: string) => void;
  // Categories
  categories: Category[];
  isLoadingCategories: boolean;
  editingCategoryId: string | null;
  showCreateCategory: boolean;
  isCreatingCategory: boolean;
  isUpdatingCategory: boolean;
  createCategoryForm: UseFormReturn<CategoryFormData>;
  editCategoryForm: UseFormReturn<CategoryFormData>;
  onShowCreateCategory: (show: boolean) => void;
  onSetEditingCategory: (id: string | null) => void;
  onCreateCategory: React.FormEventHandler;
  onUpdateCategory: React.FormEventHandler;
  onDeleteCategory: (id: string) => void;
}

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: "statistics", label: "Statistik",      icon: <BarChart2 className="w-4 h-4" /> },
  { key: "users",      label: "Pengguna & Role", icon: <Users className="w-4 h-4" /> },
  { key: "reports",    label: "Laporan",          icon: <ShieldAlert className="w-4 h-4" /> },
  { key: "categories", label: "Kategori",         icon: <Tag className="w-4 h-4" /> },
];

const REPORT_STATUS_TABS: { value: ReportStatus | undefined; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
  { value: undefined, label: "Semua" },
];

export default function AdminView(props: AdminViewProps) {
  const { activeTab, onTabChange } = props;

  return (
    <div className="px-6 py-4">
      <h1 className="text-xl font-semibold text-[#1e293b] mb-4">Dashboard Admin</h1>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-px border border-blue-200 rounded-lg overflow-hidden w-fit mb-6 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 font-medium transition-colors",
              activeTab === tab.key
                ? "bg-blue-100 text-[#1e293b]"
                : "bg-white text-[#64748b] hover:bg-blue-50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "statistics" && <StatisticsTab {...props} />}
      {activeTab === "users"      && <UsersTab {...props} />}
      {activeTab === "reports"    && <ReportsTab {...props} />}
      {activeTab === "categories" && <CategoriesTab {...props} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Statistics
// ─────────────────────────────────────────────────────────────
function StatisticsTab({ statistics, trend, isLoadingStats, isLoadingTrend }: AdminViewProps) {
  if (isLoadingStats) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (!statistics) return <p className="text-sm text-[#64748b]">Tidak ada data statistik.</p>;

  const statCards = [
    { label: "Total User",      value: statistics.users.total,      sub: `+${statistics.users.new_this_week} minggu ini`,      icon: <Users className="w-5 h-5 text-[#60a5fa]" /> },
    { label: "Total Post",      value: statistics.posts.total,      sub: `${statistics.posts.solved} terjawab`,                icon: <FileText className="w-5 h-5 text-[#059669]" /> },
    { label: "Total Komentar",  value: statistics.comments.total,   sub: `+${statistics.comments.this_week} minggu ini`,       icon: <FileText className="w-5 h-5 text-[#3b82f6]" /> },
    { label: "Laporan Pending", value: statistics.reports.pending,  sub: `${statistics.reports.total} total`,                  icon: <ShieldAlert className="w-5 h-5 text-[#dc2626]" /> },
    { label: "Total Vote",      value: statistics.votes.total,      sub: `${statistics.votes.upvotes} up / ${statistics.votes.downvotes} down`, icon: <TrendingUp className="w-5 h-5 text-[#64748b]" /> },
    { label: "Total Like",      value: statistics.likes.total,      sub: `+${statistics.likes.this_week} minggu ini`,          icon: <CheckCircle className="w-5 h-5 text-[#d97706]" /> },
    { label: "Kategori",        value: statistics.categories.total, sub: "",                                                   icon: <Tag className="w-5 h-5 text-[#60a5fa]" /> },
    { label: "User Dibanned",   value: statistics.users.banned,     sub: "",                                                   icon: <X className="w-5 h-5 text-[#dc2626]" /> },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="border border-blue-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <span className="text-xs text-[#64748b]">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#1e293b]">{formatCount(card.value)}</p>
            {card.sub && <p className="text-xs text-[#64748b] mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Engagement */}
      <div className="border border-blue-200 rounded-lg p-4 mb-6 bg-white">
        <h3 className="font-semibold text-sm text-[#1e293b] mb-3">Engagement</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-lg font-bold text-[#1e293b]">{formatCount(statistics.engagement.total_interactions)}</p>
            <p className="text-xs text-[#64748b]">Total Interaksi</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#1e293b]">{statistics.engagement.avg_comments_per_post.toFixed(1)}</p>
            <p className="text-xs text-[#64748b]">Rata-rata Komentar/Post</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#1e293b]">{statistics.engagement.avg_votes_per_post.toFixed(1)}</p>
            <p className="text-xs text-[#64748b]">Rata-rata Vote/Post</p>
          </div>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="border border-blue-200 rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-sm text-[#1e293b] mb-3">Aktivitas 7 Hari Terakhir</h3>
        {isLoadingTrend ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-blue-200 text-[#64748b]">
                  <th className="pb-2 pr-4 font-medium">Tanggal</th>
                  <th className="pb-2 pr-4 font-medium">Post</th>
                  <th className="pb-2 pr-4 font-medium">Komentar</th>
                  <th className="pb-2 pr-4 font-medium">User Baru</th>
                  <th className="pb-2 pr-4 font-medium">Vote</th>
                  <th className="pb-2 font-medium">Like</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((row) => (
                  <tr key={row.date} className="border-b border-blue-100 last:border-0">
                    <td className="py-2 pr-4 text-[#1e293b]">{row.date}</td>
                    <td className="py-2 pr-4 font-medium text-[#60a5fa]">{row.posts}</td>
                    <td className="py-2 pr-4 font-medium text-[#3b82f6]">{row.comments}</td>
                    <td className="py-2 pr-4 font-medium text-[#059669]">{row.users}</td>
                    <td className="py-2 pr-4 text-[#64748b]">{row.votes}</td>
                    <td className="py-2 text-[#64748b]">{row.likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Users & Roles
// ─────────────────────────────────────────────────────────────
function UsersTab({ users, isLoadingUsers, isAssigning, isRemoving, assignForm, removeForm, onAssignRole, onRemoveRole }: AdminViewProps) {
  const { register: regAssign, formState: { errors: assignErrors } } = assignForm;
  const { register: regRemove, formState: { errors: removeErrors } } = removeForm;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Assign Role Form ── */}
      <div className="border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-[#1e293b] mb-3">Tambah Role</h3>
        <form onSubmit={onAssignRole} className="flex flex-col sm:flex-row gap-3" noValidate>
          <div className="flex-1">
            <Input placeholder="UUID user" error={assignErrors.userId?.message} {...regAssign("userId")} />
          </div>
          <select
            className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:border-[#60a5fa]"
            {...regAssign("role_name")}
          >
            <option value="user">user</option>
            <option value="moderator">moderator</option>
            <option value="admin">admin</option>
          </select>
          <Button type="submit" variant="primary" size="sm" loading={isAssigning}>
            Assign Role
          </Button>
        </form>
      </div>

      {/* ── Remove Role Form ── */}
      <div className="border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm text-[#1e293b] mb-3">Hapus Role</h3>
        <form onSubmit={onRemoveRole} className="flex flex-col sm:flex-row gap-3" noValidate>
          <div className="flex-1">
            <Input placeholder="UUID user" error={removeErrors.userId?.message} {...regRemove("userId")} />
          </div>
          <select
            className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:border-[#60a5fa]"
            {...regRemove("role_name")}
          >
            <option value="user">user</option>
            <option value="moderator">moderator</option>
            <option value="admin">admin</option>
          </select>
          <Button type="submit" variant="danger" size="sm" loading={isRemoving}>
            Remove Role
          </Button>
        </form>
      </div>

      {/* ── User List ── */}
      <div>
        <h3 className="font-semibold text-sm text-[#1e293b] mb-3">
          Semua Pengguna ({users.length})
        </h3>
        {isLoadingUsers ? (
          <Spinner />
        ) : (
          <div className="border border-blue-200 rounded-lg divide-y divide-blue-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f0f7ff] text-xs text-[#64748b]">
                  <th className="px-4 py-3 text-left font-medium">Nama</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-right font-medium">Rep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/50">
                    <td className="px-4 py-3 font-medium text-[#1e293b]">{user.name}</td>
                    <td className="px-4 py-3 text-[#64748b]">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((r) => (
                          <span
                            key={r.id}
                            className={cn(
                              "px-1.5 py-0.5 text-xs rounded font-medium",
                              r.name === "admin"     && "bg-red-50 text-[#dc2626]",
                              r.name === "moderator" && "bg-amber-100 text-amber-700",
                              r.name === "user"      && "bg-slate-100 text-slate-500"
                            )}
                          >
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[#64748b]">{formatCount(user.reputation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Reports (Admin)
// ─────────────────────────────────────────────────────────────
function ReportsTab({
  reports, reportTotal, reportPage, reportLastPage,
  reportStatus, isLoadingReports, selectedReportId,
  isResolvingReport, resolveForm,
  onReportStatusChange, onReportPageChange,
  onSelectReport, onResolveSubmit,
  selectedPostHistoryId, selectedCommentHistoryId,
  postHistory, commentHistory,
  onSelectPostHistory, onSelectCommentHistory,
}: AdminViewProps) {
  const { register, formState: { errors } } = resolveForm;

  return (
    <div>
      <div className="flex gap-px border border-blue-200 rounded-lg overflow-hidden w-fit mb-4 text-xs">
        {REPORT_STATUS_TABS.map((s) => (
          <button
            key={String(s.value)}
            onClick={() => onReportStatusChange(s.value)}
            className={cn(
              "px-3 py-1.5 font-medium transition-colors",
              reportStatus === s.value
                ? "bg-[#60a5fa] text-white"
                : "bg-white text-[#64748b] hover:bg-blue-50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-[#64748b] mb-3">
        <span className="font-medium text-[#1e293b]">{reportTotal}</span> laporan
      </p>

      {isLoadingReports ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-[#64748b]">Tidak ada laporan.</p>
      ) : (
        <div className="border border-blue-200 rounded-lg divide-y divide-blue-100">
          {reports.map((report) => (
            <div key={report.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full font-medium",
                      report.status === "pending"  && "bg-amber-100 text-amber-700",
                      report.status === "resolved" && "bg-emerald-100 text-emerald-700",
                      report.status === "rejected" && "bg-slate-100 text-slate-500"
                    )}>
                      {report.status}
                    </span>
                    <span className="text-xs text-[#64748b]">
                      Target: <strong>{report.target_type.split("\\").pop()}</strong>
                    </span>
                    <span className="text-xs text-[#64748b]">{timeAgo(report.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-[#1e293b]">{report.reason}</p>
                  {report.description && (
                    <p className="text-xs text-[#475569] mt-0.5 italic">
                      Detail: &quot;{report.description}&quot;
                    </p>
                  )}
                  {report.reporter && (
                    <p className="text-xs text-[#64748b] mt-1">oleh: {report.reporter.name}</p>
                  )}
                </div>
                {report.status === "pending" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelectReport(selectedReportId === report.id ? null : report.id)}
                  >
                    {selectedReportId === report.id ? "Tutup" : "Proses"}
                  </Button>
                )}
              </div>

              {/* Render Target Content Details */}
              {report.target && (
                <div className="mt-3 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
                    <span className="font-semibold text-slate-700">
                      Konten Dilaporkan ({report.target_type.split("\\").pop()}):
                    </span>
                    {/* Riwayat Edit Button */}
                    {(report.target_type.includes("Post") || report.target_type.includes("Comment")) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (report.target_type.includes("Post")) {
                            onSelectPostHistory(report.target_id);
                          } else {
                            onSelectCommentHistory(report.target_id);
                          }
                        }}
                        className="text-[#60a5fa] hover:underline flex items-center gap-1 font-medium text-[11px]"
                      >
                        <Clock className="w-3 h-3" />
                        {report.target_type.includes("Post")
                          ? (selectedPostHistoryId === report.target_id ? "Sembunyikan Riwayat" : "Riwayat Edit")
                          : (selectedCommentHistoryId === report.target_id ? "Sembunyikan Riwayat" : "Riwayat Edit")
                        }
                      </button>
                    )}
                  </div>

                  {report.target_type.includes("Post") && (
                    <div>
                      <div className="font-bold text-[#1e293b] text-sm mb-1">{report.target.title}</div>
                      <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">{report.target.body}</div>
                    </div>
                  )}
                  {report.target_type.includes("Comment") && (
                    <div>
                      <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">{report.target.body}</div>
                      {report.target.post && (
                        <div className="text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
                          Pada post: <span className="font-medium text-slate-500">{report.target.post.title}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {report.target_type.includes("User") && (
                    <div className="text-slate-600 space-y-1">
                      <div>Nama: <span className="font-medium text-slate-700">{report.target.name}</span></div>
                      <div>Email: <span className="font-medium text-slate-700">{report.target.email}</span></div>
                      {report.target.bio && <div>Bio: <span className="text-slate-500 italic">{report.target.bio}</span></div>}
                    </div>
                  )}

                  {/* Render Post Edit History Inline */}
                  {report.target_type.includes("Post") && selectedPostHistoryId === report.target_id && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="font-semibold text-slate-700 mb-2">Riwayat Perubahan:</div>
                      {postHistory.length === 0 ? (
                        <p className="text-[10px] text-slate-500">Tidak ada riwayat edit.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {postHistory.map((h) => (
                            <div key={h.id} className="bg-blue-50/70 p-2.5 rounded border border-blue-100 text-[11px] space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-500 border-b border-blue-100/50 pb-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{timeAgo(h.created_at)}</span>
                                {h.editor && <span>oleh <strong>{h.editor.name}</strong></span>}
                              </div>
                              {h.title_before !== h.title_after && (
                                <div className="grid grid-cols-2 gap-3 mb-1 bg-white/50 p-1.5 rounded border border-slate-100">
                                  <div>
                                    <p className="text-[#dc2626] font-semibold">Judul Sebelum:</p>
                                    <p className="text-slate-700">{h.title_before}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#059669] font-semibold">Judul Sesudah:</p>
                                    <p className="text-slate-700">{h.title_after}</p>
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-3 bg-white/50 p-1.5 rounded border border-slate-100">
                                <div>
                                  <p className="text-[#dc2626] font-semibold">Isi Sebelum:</p>
                                  <p className="text-slate-600 whitespace-pre-wrap">{h.body_before}</p>
                                </div>
                                <div>
                                  <p className="text-[#059669] font-semibold">Isi Sesudah:</p>
                                  <p className="text-slate-600 whitespace-pre-wrap">{h.body_after}</p>
                                </div>
                              </div>
                              {h.edit_summary && (
                                <p className="text-slate-500 italic mt-1 bg-slate-100/50 p-1 rounded">&quot;Alasan: {h.edit_summary}&quot;</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render Comment Edit History Inline */}
                  {report.target_type.includes("Comment") && selectedCommentHistoryId === report.target_id && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="font-semibold text-slate-700 mb-2">Riwayat Perubahan:</div>
                      {commentHistory.length === 0 ? (
                        <p className="text-[10px] text-slate-500">Tidak ada riwayat edit.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {commentHistory.map((h) => (
                            <div key={h.id} className="bg-blue-50/70 p-2.5 rounded border border-blue-100 text-[11px] space-y-1.5">
                              <div className="flex items-center gap-1.5 text-slate-500 border-b border-blue-100/50 pb-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{timeAgo(h.created_at)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 bg-white/50 p-1.5 rounded border border-slate-100">
                                <div>
                                  <p className="text-[#dc2626] font-semibold">Sebelum:</p>
                                  <p className="text-slate-600 whitespace-pre-wrap">{h.body_before}</p>
                                </div>
                                <div>
                                  <p className="text-[#059669] font-semibold">Sesudah:</p>
                                  <p className="text-slate-600 whitespace-pre-wrap">{h.body_after}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedReportId === report.id && (
                <form onSubmit={onResolveSubmit} className="mt-3 border-t border-blue-100 pt-3 flex flex-col gap-3" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1e293b]">Tindakan</label>
                      <select className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:border-[#60a5fa]" {...register("action")}>
                        <option value="resolve">Resolve</option>
                        <option value="reject">Reject</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1e293b]">Tindak Lanjut</label>
                      <select className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:border-[#60a5fa]" {...register("action_taken")}>
                        <option value="ignore">Ignore</option>
                        <option value="warn">Peringatan</option>
                        <option value="delete_content">Hapus Konten</option>
                        <option value="ban_user">Ban User</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1e293b]">Catatan (opsional)</label>
                    <textarea rows={2} className="px-3 py-2 text-sm border border-blue-200 rounded-lg resize-none focus:outline-none focus:border-[#60a5fa]" {...register("resolution_note")} />
                  </div>
                  {errors.root && <p className="text-xs text-[#dc2626]">{errors.root.message}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" loading={isResolvingReport}>Simpan</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onSelectReport(null)}>Batal</Button>
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
// Tab: Categories
// ─────────────────────────────────────────────────────────────
function CategoriesTab({
  categories, isLoadingCategories,
  editingCategoryId, showCreateCategory,
  isCreatingCategory, isUpdatingCategory,
  createCategoryForm, editCategoryForm,
  onShowCreateCategory, onSetEditingCategory,
  onCreateCategory, onUpdateCategory, onDeleteCategory,
}: AdminViewProps) {
  const { register: regCreate, formState: { errors: createErrors } } = createCategoryForm;
  const { register: regEdit, formState: { errors: editErrors } } = editCategoryForm;

  return (
    <div>
      {/* Header + toggle create form */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-[#1e293b]">
          Semua Kategori ({categories.length})
        </h3>
        <Button
          variant={showCreateCategory ? "outline" : "primary"}
          size="sm"
          onClick={() => onShowCreateCategory(!showCreateCategory)}
        >
          {showCreateCategory ? (
            <><X className="w-3.5 h-3.5" /> Batal</>
          ) : (
            <><Plus className="w-3.5 h-3.5" /> Tambah Kategori</>
          )}
        </Button>
      </div>

      {/* Create form */}
      {showCreateCategory && (
        <form onSubmit={onCreateCategory} className="border border-[#60a5fa] rounded-lg p-4 mb-4 flex flex-col gap-3" noValidate>
          <h4 className="text-sm font-semibold text-[#1e293b]">Kategori Baru</h4>
          <Input label="Nama" placeholder="Nama kategori" error={createErrors.name?.message} {...regCreate("name")} />
          <Input label="Deskripsi (opsional)" placeholder="Deskripsi singkat" {...regCreate("description")} />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" loading={isCreatingCategory}>Buat</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onShowCreateCategory(false)}>Batal</Button>
          </div>
        </form>
      )}

      {/* Category list */}
      {isLoadingCategories ? (
        <Spinner />
      ) : (
        <div className="border border-blue-200 rounded-lg divide-y divide-blue-100">
          {categories.map((cat) => (
            <div key={cat.id} className="p-3">
              {editingCategoryId === cat.id ? (
                /* Edit inline */
                <form onSubmit={onUpdateCategory} className="flex flex-col gap-2" noValidate>
                  <Input
                    placeholder="Nama kategori"
                    error={editErrors.name?.message}
                    {...regEdit("name")}
                  />
                  <Input placeholder="Deskripsi (opsional)" {...regEdit("description")} />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" loading={isUpdatingCategory}>Simpan</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onSetEditingCategory(null)}>Batal</Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm text-[#1e293b]">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-[#64748b]">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onSetEditingCategory(cat.id);
                        editCategoryForm.reset({ name: cat.name, description: cat.description ?? "" });
                      }}
                      className="p-1.5 text-[#64748b] hover:text-[#60a5fa] transition-colors"
                      aria-label="Edit kategori"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 text-[#64748b] hover:text-[#dc2626] transition-colors"
                      aria-label="Hapus kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
