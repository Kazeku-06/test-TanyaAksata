import type { UseFormReturn } from "react-hook-form";
import Link from "next/link";
import type { User, Report, AdminStatistics, ActivityTrend, Category, ReportStatus } from "@/types";
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
      <h1 className="text-xl font-semibold text-[#232629] mb-4">Dashboard Admin</h1>

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
  if (!statistics) return <p className="text-sm text-[#6a737c]">Tidak ada data statistik.</p>;

  const statCards = [
    { label: "Total User",      value: statistics.users.total,      sub: `+${statistics.users.new_this_week} minggu ini`,      icon: <Users className="w-5 h-5 text-[#0a95ff]" /> },
    { label: "Total Post",      value: statistics.posts.total,      sub: `${statistics.posts.solved} terjawab`,                icon: <FileText className="w-5 h-5 text-[#2e6d44]" /> },
    { label: "Total Komentar",  value: statistics.comments.total,   sub: `+${statistics.comments.this_week} minggu ini`,       icon: <FileText className="w-5 h-5 text-[#f48024]" /> },
    { label: "Laporan Pending", value: statistics.reports.pending,  sub: `${statistics.reports.total} total`,                  icon: <ShieldAlert className="w-5 h-5 text-[#c91d2e]" /> },
    { label: "Total Vote",      value: statistics.votes.total,      sub: `${statistics.votes.upvotes} up / ${statistics.votes.downvotes} down`, icon: <TrendingUp className="w-5 h-5 text-[#6a737c]" /> },
    { label: "Total Like",      value: statistics.likes.total,      sub: `+${statistics.likes.this_week} minggu ini`,          icon: <CheckCircle className="w-5 h-5 text-[#a56600]" /> },
    { label: "Kategori",        value: statistics.categories.total, sub: "",                                                   icon: <Tag className="w-5 h-5 text-[#39739d]" /> },
    { label: "User Dibanned",   value: statistics.users.banned,     sub: "",                                                   icon: <X className="w-5 h-5 text-[#c91d2e]" /> },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="border border-[#e3e6eb] rounded p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <span className="text-xs text-[#6a737c]">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#232629]">{formatCount(card.value)}</p>
            {card.sub && <p className="text-xs text-[#6a737c] mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Engagement */}
      <div className="border border-[#e3e6eb] rounded p-4 mb-6 bg-white">
        <h3 className="font-semibold text-sm text-[#232629] mb-3">Engagement</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-lg font-bold text-[#232629]">{formatCount(statistics.engagement.total_interactions)}</p>
            <p className="text-xs text-[#6a737c]">Total Interaksi</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#232629]">{statistics.engagement.avg_comments_per_post.toFixed(1)}</p>
            <p className="text-xs text-[#6a737c]">Rata-rata Komentar/Post</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#232629]">{statistics.engagement.avg_votes_per_post.toFixed(1)}</p>
            <p className="text-xs text-[#6a737c]">Rata-rata Vote/Post</p>
          </div>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="border border-[#e3e6eb] rounded p-4 bg-white">
        <h3 className="font-semibold text-sm text-[#232629] mb-3">Aktivitas 7 Hari Terakhir</h3>
        {isLoadingTrend ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#e3e6eb] text-[#6a737c]">
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
                  <tr key={row.date} className="border-b border-[#e3e6eb] last:border-0">
                    <td className="py-2 pr-4 text-[#232629]">{row.date}</td>
                    <td className="py-2 pr-4 font-medium text-[#0a95ff]">{row.posts}</td>
                    <td className="py-2 pr-4 font-medium text-[#f48024]">{row.comments}</td>
                    <td className="py-2 pr-4 font-medium text-[#2e6d44]">{row.users}</td>
                    <td className="py-2 pr-4 text-[#6a737c]">{row.votes}</td>
                    <td className="py-2 text-[#6a737c]">{row.likes}</td>
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
      <div className="border border-[#e3e6eb] rounded p-4">
        <h3 className="font-semibold text-sm text-[#232629] mb-3">Tambah Role</h3>
        <form onSubmit={onAssignRole} className="flex flex-col sm:flex-row gap-3" noValidate>
          <div className="flex-1">
            <Input placeholder="UUID user" error={assignErrors.userId?.message} {...regAssign("userId")} />
          </div>
          <select
            className="px-3 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff]"
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
      <div className="border border-[#e3e6eb] rounded p-4">
        <h3 className="font-semibold text-sm text-[#232629] mb-3">Hapus Role</h3>
        <form onSubmit={onRemoveRole} className="flex flex-col sm:flex-row gap-3" noValidate>
          <div className="flex-1">
            <Input placeholder="UUID user" error={removeErrors.userId?.message} {...regRemove("userId")} />
          </div>
          <select
            className="px-3 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff]"
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
        <h3 className="font-semibold text-sm text-[#232629] mb-3">
          Semua Pengguna ({users.length})
        </h3>
        {isLoadingUsers ? (
          <Spinner />
        ) : (
          <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8f9f9] text-xs text-[#6a737c]">
                  <th className="px-4 py-3 text-left font-medium">Nama</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-right font-medium">Rep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e6eb]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-medium text-[#232629]">{user.name}</td>
                    <td className="px-4 py-3 text-[#6a737c]">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((r) => (
                          <span
                            key={r.id}
                            className={cn(
                              "px-1.5 py-0.5 text-xs rounded font-medium",
                              r.name === "admin"     && "bg-[#fce8e9] text-[#c91d2e]",
                              r.name === "moderator" && "bg-[#fdf3d0] text-[#a56600]",
                              r.name === "user"      && "bg-[#e4e6e8] text-[#6a737c]"
                            )}
                          >
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[#6a737c]">{formatCount(user.reputation)}</td>
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
}: AdminViewProps) {
  const { register, formState: { errors } } = resolveForm;

  return (
    <div>
      <div className="flex gap-px border border-[#e3e6eb] rounded overflow-hidden w-fit mb-4 text-xs">
        {REPORT_STATUS_TABS.map((s) => (
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
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full font-medium",
                      report.status === "pending"  && "bg-[#fdf3d0] text-[#a56600]",
                      report.status === "resolved" && "bg-[#d4edda] text-[#2e6d44]",
                      report.status === "rejected" && "bg-[#e4e6e8] text-[#6a737c]"
                    )}>
                      {report.status}
                    </span>
                    <span className="text-xs text-[#6a737c]">
                      {report.target_type.split("\\").pop()}
                    </span>
                    <span className="text-xs text-[#6a737c]">{timeAgo(report.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-[#232629]">{report.reason}</p>
                  {report.reporter && (
                    <p className="text-xs text-[#6a737c] mt-0.5 mb-2">oleh: {report.reporter.name}</p>
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

              {selectedReportId === report.id && (
                <form onSubmit={onResolveSubmit} className="mt-3 border-t border-[#e3e6eb] pt-3 flex flex-col gap-3" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#232629]">Tindakan</label>
                      <select className="px-3 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff]" {...register("action")}>
                        <option value="resolve">Resolve</option>
                        <option value="reject">Reject</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#232629]">Tindak Lanjut</label>
                      <select className="px-3 py-2 text-sm border border-[#babfc4] rounded focus:outline-none focus:border-[#0a95ff]" {...register("action_taken")}>
                        <option value="ignore">Ignore</option>
                        <option value="warn">Peringatan</option>
                        <option value="delete_content">Hapus Konten</option>
                        <option value="ban_user">Ban User</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#232629]">Catatan (opsional)</label>
                    <textarea rows={2} className="px-3 py-2 text-sm border border-[#babfc4] rounded resize-none focus:outline-none focus:border-[#0a95ff]" {...register("resolution_note")} />
                  </div>
                  {errors.root && <p className="text-xs text-[#c91d2e]">{errors.root.message}</p>}
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
        <h3 className="font-semibold text-sm text-[#232629]">
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
        <form onSubmit={onCreateCategory} className="border border-[#0a95ff] rounded p-4 mb-4 flex flex-col gap-3" noValidate>
          <h4 className="text-sm font-semibold text-[#232629]">Kategori Baru</h4>
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
        <div className="border border-[#e3e6eb] rounded divide-y divide-[#e3e6eb]">
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
                    <p className="font-medium text-sm text-[#232629]">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-[#6a737c]">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onSetEditingCategory(cat.id);
                        editCategoryForm.reset({ name: cat.name, description: cat.description ?? "" });
                      }}
                      className="p-1.5 text-[#6a737c] hover:text-[#0a95ff] transition-colors"
                      aria-label="Edit kategori"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 text-[#6a737c] hover:text-[#c91d2e] transition-colors"
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
