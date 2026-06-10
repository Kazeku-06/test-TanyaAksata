import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RightSidebar from "@/components/layout/RightSidebar";
import QuestionsLogic from "@/features/questions/QuestionsLogic";
import Spinner from "@/components/ui/Spinner";

export default function QuestionsPage() {
  return (
    <MainLayout rightSidebar={<RightSidebar />}>
      {/* Suspense diperlukan karena QuestionsLogic pakai useSearchParams */}
      <Suspense fallback={<div className="flex justify-center py-16"><Spinner size="lg" /></div>}>
        <QuestionsLogic />
      </Suspense>
    </MainLayout>
  );
}
