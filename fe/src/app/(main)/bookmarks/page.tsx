"use client";

import MainLayout from "@/components/layout/MainLayout";
import dynamic from "next/dynamic";
import Spinner from "@/components/ui/Spinner";

const BookmarksLogic = dynamic(
  () => import("@/features/bookmarks/BookmarksLogic"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    ),
  }
);

export default function BookmarksPage() {
  return (
    <MainLayout>
      <BookmarksLogic />
    </MainLayout>
  );
}
