import Link from "next/link";
import { Tag } from "lucide-react";
import { ReactNode } from "react";

interface RightSidebarProps {
  children?: ReactNode;
}

// Widget: Ask a question CTA
function AskWidget() {
  return (
    <div className="border border-[var(--primary-light)] bg-white rounded-2xl p-5 text-sm">
      <h3 className="mb-2 text-base font-semibold text-[var(--text-default)]">
        Punya Pertanyaan?
      </h3>

      <p className="mb-4 text-sm leading-6 text-[var(--text-default)]">
        Bagikan pengalaman dan dapatkan jawaban dari komunitas developer aktif.
      </p>

      <Link
        href="/questions/ask"
        className="block w-full rounded-xl bg-[var(--primary)] py-3 text-center text-sm font-semibold !text-white transition-colors duration-150 hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-light)]"
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
    <div className="border border-[#e2e8f0] bg-white rounded-2xl p-5 text-sm">
      <div className="mb-4 flex items-center gap-2">
        <Tag className="h-4 w-4 text-[var(--primary)]" />
        <h3 className="font-semibold text-[var(--text-default)]">
          Tag Populer
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Link
            key={tag}
            href={`/questions?tag=${tag}`}
            className="rounded-full border border-[var(--primary-light)] bg-[var(--primary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors duration-150 hover:bg-[#d0e3f1]"
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