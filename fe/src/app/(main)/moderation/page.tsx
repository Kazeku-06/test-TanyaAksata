import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Dashboard Moderasi",
};

export default function ModerationPage() {
  return (
    <MainLayout>
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-[#232629] mb-4">
          Dashboard Moderasi
        </h1>

        {/* Tabs */}
        <div className="flex gap-px border border-[#e3e6eb] rounded overflow-hidden w-fit mb-6 text-sm">
          {["Laporan", "Post Terhapus", "Komentar Terhapus", "Manajemen User"].map(
            (tab, i) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium transition-colors ${
                  i === 0
                    ? "bg-[#e3e6eb] text-[#232629]"
                    : "bg-white text-[#6a737c] hover:bg-[#f6f6f6]"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="text-sm text-[#6a737c] py-8 text-center border border-dashed border-[#e3e6eb] rounded">
          Konten moderasi akan tampil di sini.
        </div>
      </div>
    </MainLayout>
  );
}
