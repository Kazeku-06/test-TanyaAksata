import Link from "next/link";
import { Tag } from "lucide-react";

interface RightSidebarProps {
  children?: React.ReactNode;
}

// Widget: Ask a question CTA
function AskWidget() {
  return (
    <div className="border border-[var(--primary-light)] bg-white rounded-[28px] p-5 text-sm">
      <h3 className="font-semibold text-[var(--text-default)] text-base mb-2">
        Punya Pertanyaan?
      </h3>
      <p className="text-[var(--text-default)] text-sm mb-4 leading-6">
        Bagikan pengalaman dan dapatkan jawaban dari komunitas developer aktif.
      </p>
      <Link
        href="/questions/ask"
        className="block w-full text-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] !text-white text-sm font-semibold py-3 rounded-2xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-light)]"
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
    <div className="border border-[#e2e8f0] bg-white rounded-[28px] p-5 text-sm">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-[var(--primary)]" />
        <h3 className="font-semibold text-[var(--text-default)]">
          Tag Populer
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Link
            key={tag}
            href={`/questions?tag=${tag}`}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-[var(--primary-light)] bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[#d0e3f1] transition-colors duration-150"
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
    <div className="space-y-5">
      <AskWidget />
      <TagsWidget />
      {children}
    </div>
  );
}
