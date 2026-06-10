"use client";

import MainLayout from "@/components/layout/MainLayout";
import dynamic from "next/dynamic";
import Spinner from "@/components/ui/Spinner";

// ProfileLogic bergantung pada auth state (cookie/token) yang hanya ada di client.
// ssr: false mencegah server me-render komponen ini sehingga tidak ada hydration mismatch.
const ProfileLogic = dynamic(
  () => import("@/features/profile/ProfileLogic"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    ),
  }
);

export default function ProfilePage() {
  return (
    <MainLayout>
      <ProfileLogic />
    </MainLayout>
  );
}
