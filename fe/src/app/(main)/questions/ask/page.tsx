import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import AskQuestionForm from "@/components/post/AskQuestionForm";

export const metadata: Metadata = {
  title: "Ajukan Pertanyaan",
};

export default function AskPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="px-6 py-6 max-w-[860px]">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#232629] mb-1">
            Ajukan Pertanyaan Publik
          </h1>
          <p className="text-sm text-[#6a737c]">
            Tuliskan masalah kamu dengan jelas agar mudah dijawab oleh komunitas.
          </p>
        </div>
        <AskQuestionForm />
      </div>
    </MainLayout>
  );
}
