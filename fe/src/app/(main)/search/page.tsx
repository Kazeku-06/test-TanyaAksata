import { Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RightSidebar from "@/components/layout/RightSidebar";
import SearchLogic from "@/features/search/SearchLogic";
import Spinner from "@/components/ui/Spinner";

export default function SearchPage() {
  return (
    <MainLayout rightSidebar={<RightSidebar />}>
      <Suspense fallback={<div className="flex justify-center py-16"><Spinner size="lg" /></div>}>
        <SearchLogic />
      </Suspense>
    </MainLayout>
  );
}
