import MainLayout from "@/components/layout/MainLayout";
import EditLogic from "@/features/questions/EditLogic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <MainLayout showSidebar={false}>
      <EditLogic postId={id} />
    </MainLayout>
  );
}
