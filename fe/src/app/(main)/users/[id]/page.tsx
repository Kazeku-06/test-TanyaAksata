import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import UserProfileClient from "@/components/user/UserProfileClient";

export const metadata: Metadata = {
  title: "Profil Pengguna",
};

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  return (
    <MainLayout>
      <UserProfileClient userId={id} />
    </MainLayout>
  );
}
