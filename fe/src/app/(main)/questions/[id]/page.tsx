import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import PostDetailClient from "@/components/post/PostDetailClient";

export const metadata: Metadata = {
  title: "Detail Pertanyaan",
};

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  return (
    <MainLayout>
      <PostDetailClient postId={id} />
    </MainLayout>
  );
}
