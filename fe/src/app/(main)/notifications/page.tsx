import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Notifikasi",
};

export default function NotificationsPage() {
  return (
    <MainLayout>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-[#232629]">Notifikasi</h1>
          <button className="text-sm text-[#0074cc] hover:underline">
            Tandai semua dibaca
          </button>
        </div>
        {/* NotificationList component will be implemented here */}
        <div className="text-sm text-[#6a737c]">Notifikasi akan tampil di sini.</div>
      </div>
    </MainLayout>
  );
}
