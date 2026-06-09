import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Bookmark Saya",
};

export default function BookmarksPage() {
  return (
    <MainLayout>
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-[#232629] mb-4">Bookmark Saya</h1>
        {/* BookmarkList component will be implemented here */}
        <div className="text-sm text-[#6a737c]">Daftar bookmark akan tampil di sini.</div>
      </div>
    </MainLayout>
  );
}
