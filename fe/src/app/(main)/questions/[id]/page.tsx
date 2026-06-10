import MainLayout from "@/components/layout/MainLayout";
import RightSidebar from "@/components/layout/RightSidebar";
import QuestionDetailLogic from "@/features/questions/QuestionDetailLogic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <MainLayout rightSidebar={<RightSidebar />}>
      <QuestionDetailLogic postId={id} />
    </MainLayout>
  );
}
