import MainLayout from "@/components/layout/MainLayout";
import UserProfileLogic from "@/features/userProfile/UserProfileLogic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <MainLayout>
      <UserProfileLogic userId={id} />
    </MainLayout>
  );
}
