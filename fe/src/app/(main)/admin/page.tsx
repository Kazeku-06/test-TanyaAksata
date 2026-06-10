"use client";

import MainLayout from "@/components/layout/MainLayout";
import dynamic from "next/dynamic";
import Spinner from "@/components/ui/Spinner";

const AdminLogic = dynamic(
  () => import("@/features/admin/AdminLogic"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    ),
  }
);

export default function AdminPage() {
  return (
    <MainLayout>
      <AdminLogic />
    </MainLayout>
  );
}
