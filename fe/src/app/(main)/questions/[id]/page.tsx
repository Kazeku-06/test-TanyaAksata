import MainLayout from "@/components/layout/MainLayout";
import PostDetailClient from "@/components/post/PostDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <MainLayout>
      <PostDetailClient postId={id} />
    </MainLayout>
  );
}
