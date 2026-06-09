import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

export default function AdminPage() {
  return (
    <MainLayout>
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-[#232629] mb-4">
          Dashboard Admin
        </h1>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total User", value: "—" },
            { label: "Total Post", value: "—" },
            { label: "Total Komentar", value: "—" },
            { label: "Laporan Pending", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[#e3e6eb] rounded p-4 bg-white"
            >
              <p className="text-xs text-[#6a737c] mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-[#232629]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-px border border-[#e3e6eb] rounded overflow-hidden w-fit mb-4 text-sm">
          {["Statistik", "Pengguna & Role", "Laporan"].map((tab, i) => (
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
          ))}
        </div>

        <div className="text-sm text-[#6a737c] py-8 text-center border border-dashed border-[#e3e6eb] rounded">
          Konten admin akan tampil di sini.
        </div>
      </div>
    </MainLayout>
  );
}
