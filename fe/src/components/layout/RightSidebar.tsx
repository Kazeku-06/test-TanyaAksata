import Link from "next/link";
import { Tag } from "lucide-react";

interface RightSidebarProps {
  children?: React.ReactNode;
}

// Widget: Ask a question CTA
function AskWidget() {
  return (
    <div className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-sm">
      <h3 className="font-bold text-[#3b82f6] mb-1">Punya pertanyaan?</h3>
      <p className="text-[#475569] text-xs mb-3">
        Dapatkan jawaban dari komunitas pengembang aktif.
      </p>
      <Link
        href="/questions/ask"
        className="block w-full text-center bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-sm shadow-blue-200/30"
      >
        Ajukan Pertanyaan
      </Link>
    </div>
  );
}

// Widget: Hot network tags
function TagsWidget() {
  const popularTags = [
    "laravel",
    "javascript",
    "react",
    "php",
    "python",
    "mysql",
    "typescript",
    "nextjs",
    "api",
    "css"
  ];
  return (
    <div className="border border-blue-200 bg-white rounded-xl p-4 text-sm">
      <div className="flex items-center gap-1.5 mb-3">
        <Tag className="w-4 h-4 text-[#3b82f6]" />
        <h3 className="font-bold text-[#1e293b]">Tag Populer</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {popularTags.map((tag) => (
          <Link
            key={tag}
            href={`/questions?tag=${tag}`}
            className="px-2 py-0.5 text-xs rounded-md border border-blue-200 bg-blue-50 text-[#60a5fa] hover:bg-blue-100 hover:border-blue-300 transition-colors font-medium"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function RightSidebar({ children }: RightSidebarProps) {
  return (
    <div className="space-y-4">
      <AskWidget />
      <TagsWidget />
      {children}
    </div>
  );
}
