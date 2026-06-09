import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Profil Saya",
};

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="px-6 py-4">
        <h1 className="text-xl font-semibold text-[#232629] mb-4">Profil Saya</h1>
        {/* ProfileForm component will be implemented here */}
        <div className="text-sm text-[#6a737c]">
          Form edit profil akan ada di sini.
        </div>
      </div>
    </MainLayout>
  );
}
