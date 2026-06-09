import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import RightSidebar from "@/components/layout/RightSidebar";

export const metadata: Metadata = {
  title: "Pencarian",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  return (
    <MainLayout rightSidebar={<RightSidebar />}>
      <div className="px-6 py-4">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-[#232629]">
            {query ? (
              <>
                Hasil pencarian untuk:{" "}
                <span className="text-[#0a95ff]">&quot;{query}&quot;</span>
              </>
            ) : (
              "Cari Pertanyaan"
            )}
          </h1>
        </div>

        {/* Search filters */}
        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          <span className="text-[#6a737c]">Filter:</span>
          {["Relevansi", "Terbaru", "Paling Banyak Vote"].map((f, i) => (
            <button
              key={f}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                i === 0
                  ? "border-[#0a95ff] bg-[#e1ecf4] text-[#0074cc]"
                  : "border-[#babfc4] text-[#6a737c] hover:bg-[#f6f6f6]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* SearchResults component will be implemented here */}
        <div className="text-sm text-[#6a737c] py-8 text-center border border-dashed border-[#e3e6eb] rounded">
          {query ? `Mencari "${query}"...` : "Masukkan kata kunci untuk mencari."}
        </div>
      </div>
    </MainLayout>
  );
}
