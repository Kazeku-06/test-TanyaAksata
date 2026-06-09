import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Pengguna",
};

export default function UsersPage() {
  return (
    <MainLayout>
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-[#232629] mb-4">Pengguna</h1>
        {/* UserGrid component will be implemented here */}
        <div className="text-sm text-[#6a737c] py-8 text-center border border-dashed border-[#e3e6eb] rounded">
          Daftar pengguna akan tampil di sini.
        </div>
      </div>
    </MainLayout>
  );
}
