import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import TagsLogic from "@/features/tags/TagsLogic";

export const metadata: Metadata = {
  title: "Tag",
};

export default function TagsPage() {
  return (
    <MainLayout>
      <TagsLogic />
    </MainLayout>
  );
}
