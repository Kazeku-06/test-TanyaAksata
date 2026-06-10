import MainLayout from "@/components/layout/MainLayout";
import AskLogic from "@/features/questions/AskLogic";

export default function AskPage() {
  return (
    <MainLayout showSidebar={false}>
      <AskLogic />
    </MainLayout>
  );
}
