"use client";

import MainLayout from "@/components/layout/MainLayout";
import dynamic from "next/dynamic";
import Spinner from "@/components/ui/Spinner";

const ModerationLogic = dynamic(
  () => import("@/features/moderation/ModerationLogic"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    ),
  }
);

export default function ModerationPage() {
  return (
    <MainLayout>
      <ModerationLogic />
    </MainLayout>
  );
}
