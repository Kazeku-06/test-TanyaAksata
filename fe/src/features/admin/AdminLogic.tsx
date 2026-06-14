"use client";

import { useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAdminUsers,
  useAssignRole,
  useRemoveRole,
  useAdminStatistics,
  useActivityTrend,
  useAdminReports,
  useAdminResolveReport,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useCategories";
import { resolveReportSchema, type ResolveReportFormData } from "@/lib/schemas";
import { usePostEditHistory, useCommentEditHistory } from "@/hooks/useModeration";
import type { ReportStatus } from "@/types";
import AdminView from "./AdminView";
import Spinner from "@/components/ui/Spinner";

export type AdminTab = "statistics" | "users" | "reports" | "categories";

// Schema sederhana untuk assign/remove role
const roleSchema = z.object({
  userId: z.string().min(1, "User ID wajib diisi"),
  role_name: z.enum(["user", "moderator", "admin"] as const, {
    message: "Pilih role",
  }),
});
type RoleFormData = z.infer<typeof roleSchema>;

// Schema category form
const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  description: z.string().max(255).optional(),
  parent_id: z.string().optional(),
  sort_order: z.number().int().optional(),
});
type CategoryFormData = z.infer<typeof categorySchema>;

export { type RoleFormData, type CategoryFormData };

export default function AdminLogic() {
  // Guard: hanya admin yang boleh akses
  const { isAllowed, isLoading: isLoadingRole } = useRoleGuard(["admin"]);

  const [activeTab, setActiveTab] = useState<AdminTab>("statistics");

  // ── Report state ────────────────────────────────────────────
  const [reportStatus, setReportStatus] = useState<ReportStatus | undefined>("pending");
  const [reportPage, setReportPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // ── Report target history state ──
  const [selectedPostHistoryId, setSelectedPostHistoryId] = useState<string | null>(null);
  const [selectedCommentHistoryId, setSelectedCommentHistoryId] = useState<string | null>(null);

  // ── Category state ──────────────────────────────────────────
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  // ── Data fetching ───────────────────────────────────────────
  const { data: users, isLoading: isLoadingUsers } = useAdminUsers();
  const { data: statistics, isLoading: isLoadingStats } = useAdminStatistics();
  const { data: trend, isLoading: isLoadingTrend } = useActivityTrend();
  const { data: reportsData, isLoading: isLoadingReports } =
    useAdminReports(reportStatus, reportPage);
  const { data: categories, isLoading: isLoadingCategories } = useCategories(true);

  // ── Target history queries ──
  const { data: postHistory } = usePostEditHistory(selectedPostHistoryId ?? "");
  const { data: commentHistory } = useCommentEditHistory(selectedCommentHistoryId ?? "");

  // ── Mutations ───────────────────────────────────────────────
  const { mutate: assignRole, isPending: isAssigning } = useAssignRole();
  const { mutate: removeRole, isPending: isRemoving } = useRemoveRole();
  const { mutate: resolveReport, isPending: isResolvingReport } = useAdminResolveReport();
  const { mutate: createCategory, isPending: isCreatingCategory } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdatingCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  // ── Forms ───────────────────────────────────────────────────
  const assignForm = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { userId: "", role_name: "moderator" },
  });

  const removeForm = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: { userId: "", role_name: "moderator" },
  });

  const resolveForm = useForm<ResolveReportFormData>({
    resolver: zodResolver(resolveReportSchema),
    defaultValues: { action: "resolve", action_taken: "ignore", resolution_note: "" },
  });

  const createCategoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", parent_id: "", sort_order: 0 },
  });

  const editCategoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", parent_id: "", sort_order: 0 },
  });

  // ── Handlers ───────────────────────────────────────────────

  function handleAssignRole(data: RoleFormData) {
    assignRole(
      { userId: data.userId, role_name: data.role_name },
      { onSuccess: () => assignForm.reset() }
    );
  }

  function handleRemoveRole(data: RoleFormData) {
    removeRole(
      { userId: data.userId, role_name: data.role_name },
      { onSuccess: () => removeForm.reset() }
    );
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

  function handleCreateCategory(data: CategoryFormData) {
    createCategory(
      { name: data.name, description: data.description, sort_order: data.sort_order },
      { onSuccess: () => { createCategoryForm.reset(); setShowCreateCategory(false); } }
    );
  }

  function handleUpdateCategory(data: CategoryFormData) {
    if (!editingCategoryId) return;
    updateCategory(
      { id: editingCategoryId, name: data.name, description: data.description, sort_order: data.sort_order },
      { onSuccess: () => { editCategoryForm.reset(); setEditingCategoryId(null); } }
    );
  }

  function handleDeleteCategory(id: string) {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    deleteCategory(id);
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
    <AdminView
      // Tab
      activeTab={activeTab}
      onTabChange={setActiveTab}

      // Statistics
      statistics={statistics ?? null}
      trend={trend ?? []}
      isLoadingStats={isLoadingStats}
      isLoadingTrend={isLoadingTrend}

      // Users & Roles
      users={users ?? []}
      isLoadingUsers={isLoadingUsers}
      isAssigning={isAssigning}
      isRemoving={isRemoving}
      assignForm={assignForm}
      removeForm={removeForm}
      onAssignRole={assignForm.handleSubmit(handleAssignRole)}
      onRemoveRole={removeForm.handleSubmit(handleRemoveRole)}

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
      // Target Edit Histories
      selectedPostHistoryId={selectedPostHistoryId}
      selectedCommentHistoryId={selectedCommentHistoryId}
      postHistory={postHistory ?? []}
      commentHistory={commentHistory ?? []}
      onSelectPostHistory={(id) =>
        setSelectedPostHistoryId((prev) => (prev === id ? null : id))
      }
      onSelectCommentHistory={(id) =>
        setSelectedCommentHistoryId((prev) => (prev === id ? null : id))
      }

      // Categories
      categories={categories ?? []}
      isLoadingCategories={isLoadingCategories}
      editingCategoryId={editingCategoryId}
      showCreateCategory={showCreateCategory}
      isCreatingCategory={isCreatingCategory}
      isUpdatingCategory={isUpdatingCategory}
      createCategoryForm={createCategoryForm}
      editCategoryForm={editCategoryForm}
      onShowCreateCategory={setShowCreateCategory}
      onSetEditingCategory={setEditingCategoryId}
      onCreateCategory={createCategoryForm.handleSubmit(handleCreateCategory)}
      onUpdateCategory={editCategoryForm.handleSubmit(handleUpdateCategory)}
      onDeleteCategory={handleDeleteCategory}
    />
  );
}
