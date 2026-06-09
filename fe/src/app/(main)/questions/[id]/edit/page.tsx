import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import EditPostClient from "@/components/post/EditPostClient";

export const metadata: Metadata = {
  title: "Edit Pertanyaan",
};

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <div className="px-6 py-6 max-w-[860px]">
        <h1 className="text-2xl font-semibold text-[#232629] mb-6">Edit Pertanyaan</h1>
        <EditPostClient postId={id} />
      </div>
    </MainLayout>
  );
}
