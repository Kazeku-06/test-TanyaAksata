import MainLayout from "@/components/layout/MainLayout";
import RightSidebar from "@/components/layout/RightSidebar";
import HomeLogic from "@/features/home/HomeLogic";

export default function HomePage() {
  return (
    <MainLayout rightSidebar={<RightSidebar />}>
      <HomeLogic />
    </MainLayout>
  );
}
