import Link from "next/link";
import { Tag } from "lucide-react";

interface RightSidebarProps {
  children?: React.ReactNode;
}

// Widget: Ask a question CTA
function AskWidget() {
  return (
    <div className="border border-[#f1b600] bg-[#fdf7e2] rounded p-3 text-sm">
      <h3 className="font-semibold text-[#3b3229] mb-1">Punya pertanyaan?</h3>
      <p className="text-[#6a5f4b] text-xs mb-2">
        Dapatkan jawaban dari komunitas pengembang aktif.
      </p>
      <Link
        href="/questions/ask"
        className="block w-full text-center bg-[#0a95ff] hover:bg-[#0074cc] text-white text-xs font-medium py-1.5 rounded transition-colors"
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
    "css",
  ];
  return (
    <div className="border border-[#e3e6eb] rounded p-3 text-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <Tag className="w-4 h-4 text-[#6a737c]" />
        <h3 className="font-semibold text-[#232629]">Tag Populer</h3>
      </div>
      <div className="flex flex-wrap gap-1">
        {popularTags.map((tag) => (
          <Link
            key={tag}
            href={`/questions?tag=${tag}`}
            className="px-1.5 py-0.5 text-xs rounded border border-[#9cc3db] bg-[#e1ecf4] text-[#39739d] hover:bg-[#d0e3f0] transition-colors"
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
