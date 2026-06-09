import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import RightSidebar from "@/components/layout/RightSidebar";
import PostList from "@/components/post/PostList";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beranda — TanyaAksata",
};

export default function HomePage() {
  return (
    <MainLayout rightSidebar={<RightSidebar />}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-[#232629]">
            Pertanyaan Terbaru
          </h1>
          <Link
            href="/questions/ask"
            className="bg-[#0a95ff] hover:bg-[#0074cc] text-white text-sm font-medium px-3 py-2 rounded transition-colors"
          >
            Ajukan Pertanyaan
          </Link>
        </div>
        <PostList />
      </div>
    </MainLayout>
  );
}
